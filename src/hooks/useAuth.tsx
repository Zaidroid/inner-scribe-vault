import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateSalt, deriveKey, setSessionKey, decryptWithKey } from '@/lib/encryption';
import { db } from '@/lib/database';
import { PasswordPromptModal } from '@/components/PasswordPromptModal';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isKeySet: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null, requires2FA?: boolean, challengeId?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  enableTwoFactor: () => Promise<{ qr: string, secret: string, error: any }>;
  verifyTwoFactor: (token: string) => Promise<{ error: any }>;
  disableTwoFactor: () => Promise<{ error: any }>;
  verifyAndSignIn: (challengeId: string, token: string) => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const OLD_ENCRYPTION_KEY = 'selfmastery-app-key';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isKeySet, setIsKeySet] = useState(false);
  const [isPasswordPromptVisible, setIsPasswordPromptVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (event === 'SIGNED_OUT') {
          setIsKeySet(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        setIsPasswordPromptVisible(true);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePasswordSubmit = async (password: string) => {
    if (!user) {
        toast({ title: 'Error', description: 'User not found.', variant: 'destructive' });
        return;
    }
    const salt = user.user_metadata?.encryption_salt;
    if (!salt) {
        toast({ title: 'Critical Error', description: 'Encryption salt not found.', variant: 'destructive' });
        return;
    }
    const key = deriveKey(password, salt);
    setSessionKey(key);
    setIsKeySet(true);
    setIsPasswordPromptVisible(false);
    toast({ title: 'Success', description: 'Encryption key set for the session.' });
    await migrateUserData(key);
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        if (error.message.includes('AAL2')) {
            const factors = await supabase.auth.mfa.listFactors();
            if (factors.error || !factors.data.all[0]) return { error: factors.error || new Error("No 2FA factor found"), requires2FA: false };
            const factorId = factors.data.all[0].id;

            const challenge = await supabase.auth.mfa.challenge({ factorId });
            if (challenge.error) return { error: challenge.error, requires2FA: false };

            return { error: null, requires2FA: true, challengeId: challenge.data.id };
        }
        toast({ title: "Sign In Failed", description: error.message, variant: "destructive" });
        return { error, requires2FA: false };
    }
    
    if (data.user) {
      const salt = data.user.user_metadata?.encryption_salt;
      if (!salt) {
        const newError = new Error('User does not have an encryption salt. Cannot decrypt data.');
        toast({ title: "Critical Error", description: newError.message, variant: "destructive" });
        return { error: newError, requires2FA: false };
      }
      
      const newKey = deriveKey(password, salt);
      setSessionKey(newKey);
      setIsKeySet(true);
      console.log('Session encryption key has been set.');
      
      await migrateUserData(newKey);
    }

    toast({ title: "Welcome back!", description: "You have successfully signed in." });
    return { error: null, requires2FA: false };
  };

  const migrateUserData = async (newKey: string) => {
    console.log('Starting data migration check...');
    try {
        const entries = await db.getJournalEntries();
        if (entries.length > 0 && entries[0].title) {
            console.log('Data is already using new encryption. No migration needed.');
            return;
        }

        console.log('Potential old data detected. Attempting migration...');

        const rawEntries = await db.getRawJournalEntries();

        let migratedCount = 0;
        for (const entry of rawEntries) {
            const decryptedTitle = decryptWithKey(entry.title, OLD_ENCRYPTION_KEY);
            
            if (decryptedTitle !== null) {
                const migratedEntry = {
                    ...entry,
                    title: decryptWithKey(entry.title, OLD_ENCRYPTION_KEY),
                    content: decryptWithKey(entry.content, OLD_ENCRYPTION_KEY),
                    tags: entry.tags.map((t: string) => decryptWithKey(t, OLD_ENCRYPTION_KEY)),
                };
                await db.saveJournalEntry(migratedEntry);
                migratedCount++;
            }
        }
        
        if (migratedCount > 0) {
            console.log(`Successfully migrated ${migratedCount} journal entries to new encryption.`);
        }
        
    } catch (error) {
        console.error('An error occurred during data migration:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const salt = generateSalt();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || '',
            encryption_salt: salt,
          }
        }
      });

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account.",
        });
      }

      return { error };
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Sign Up Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const enableTwoFactor = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error) return { qr: '', secret: '', error };
    
    const qrCode = data.totp.qr_code;
    const secret = data.totp.secret;
    return { qr: qrCode, secret, error: null };
  };

  const verifyTwoFactor = async (token: string) => {
    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: (await supabase.auth.mfa.listFactors()).data.all[0].id,
      code: token,
    });
    
    if (!error) {
        await supabase.auth.updateUser({ data: { is_two_factor_enabled: true } });
    }
    
    return { error };
  };
  
  const disableTwoFactor = async () => {
      const { data, error } = await supabase.auth.mfa.unenroll({
          factorId: (await supabase.auth.mfa.listFactors()).data.all[0].id
      });
      if (!error) {
          await supabase.auth.updateUser({ data: { is_two_factor_enabled: false } });
      }
      return { error };
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSessionKey('');
      setIsKeySet(false);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const verifyAndSignIn = async (challengeId: string, token: string) => {
      const factors = await supabase.auth.mfa.listFactors();
      if (factors.error || !factors.data.all[0]) return { error: factors.error || new Error("No 2FA factor found") };
      const factorId = factors.data.all[0].id;
      
      const { data, error } = await supabase.auth.mfa.verify({
          factorId,
          challengeId,
          code: token,
      });
      
      if (error) {
          toast({ title: "2FA Verification Failed", description: error.message, variant: "destructive"});
      } else {
          supabase.auth.getSession().then(({ data: { session } }) => {
          });
      }
      return { error };
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isKeySet,
      loading,
      signIn,
      signUp,
      signOut,
      enableTwoFactor,
      verifyTwoFactor,
      disableTwoFactor,
      verifyAndSignIn,
    }}>
      {children}
      <PasswordPromptModal
        isOpen={isPasswordPromptVisible}
        onClose={() => setIsPasswordPromptVisible(false)}
        onSubmit={handlePasswordSubmit}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
