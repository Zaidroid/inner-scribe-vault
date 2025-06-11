import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateSalt, deriveKey, setSessionKey, decryptWithKey } from '@/lib/encryption';
import { db } from '@/lib/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null, requires2FA: boolean, challengeId?: string }>;
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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
        return { error: newError };
      }
      
      const newKey = deriveKey(password, salt);
      setSessionKey(newKey);
      console.log('Session encryption key has been set.');
      
      await migrateUserData(newKey);
    }

    toast({ title: "Welcome back!", description: "You have successfully signed in." });
    return { error: null, requires2FA: false };
  };

  const migrateUserData = async (newKey: string) => {
    console.log('Starting data migration check...');
    try {
        // We'll check the first journal entry. If it decrypts with the new key, we assume all data is fine.
        const entries = await db.getJournalEntries(); // This will use the new session key
        if (entries.length > 0 && entries[0].title) {
            // If title is readable, decryption worked, no migration needed.
            console.log('Data is already using new encryption. No migration needed.');
            return;
        }

        // If we're here, either there's no data, or it's encrypted with the old key.
        console.log('Potential old data detected. Attempting migration...');

        // 1. Get all data using a method that doesn't decrypt (getRaw)
        const rawEntries = await db.getRawJournalEntries();

        let migratedCount = 0;
        for (const entry of rawEntries) {
            // 2. Try decrypting with the old key
            const decryptedTitle = decryptWithKey(entry.title, OLD_ENCRYPTION_KEY);
            
            if (decryptedTitle !== null) {
                // 3. If successful, re-encrypt with the new key and save.
                const migratedEntry = {
                    ...entry,
                    title: decryptWithKey(entry.title, OLD_ENCRYPTION_KEY),
                    content: decryptWithKey(entry.content, OLD_ENCRYPTION_KEY),
                    tags: entry.tags.map((t: string) => decryptWithKey(t, OLD_ENCRYPTION_KEY)),
                };
                // The normal saveJournalEntry will now use the new session key to encrypt.
                await db.saveJournalEntry(migratedEntry);
                migratedCount++;
            }
        }
        
        if (migratedCount > 0) {
            console.log(`Successfully migrated ${migratedCount} journal entries to new encryption.`);
        }
        // Repeat this process for habits, tasks, etc.
        
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
        // Mark 2FA as enabled in user metadata for UI state
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
          // Manually trigger onAuthStateChange to update session
          supabase.auth.getSession().then(({ data: { session } }) => {
            // This is a bit of a hack to refresh the session state in the app
          });
      }
      return { error };
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
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
