import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { backupNow, listBackups, recoverFromBackup } from '../lib/backup';
import { FileObject } from '@supabase/storage-js';

export function SecuritySettings() {
  const { user, enableTwoFactor, verifyTwoFactor, disableTwoFactor } = useAuth();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEnabling, setIsEnabling] = useState(false);

  const handleEnable = async () => {
    setError(null);
    setIsEnabling(true);
    const { qr, secret: newSecret, error: enableError } = await enableTwoFactor();
    if (enableError) {
      setError(enableError.message);
      setIsEnabling(false);
    } else {
      setQrCode(qr);
      setSecret(newSecret);
    }
  };

  const handleVerify = async () => {
    setError(null);
    const { error: verifyError } = await verifyTwoFactor(verificationCode);
    if (verifyError) {
      setError(verifyError.message);
    } else {
      // Success! Reset state.
      setIsEnabling(false);
      setQrCode(null);
      setSecret(null);
      setVerificationCode('');
      // You'll likely need to refresh the user state here to show 2FA is enabled
    }
  };
  
  const handleDisable = async () => {
    setError(null);
    if (confirm('Are you sure you want to disable two-factor authentication?')) {
        const { error: disableError } = await disableTwoFactor();
        if (disableError) {
            setError(disableError.message);
        } else {
            // Success, refresh state
        }
    }
  };
  
  const isTwoFactorEnabled = user?.user_metadata?.is_two_factor_enabled;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

        {isTwoFactorEnabled ? (
            <div className="space-y-4">
                <p className="text-green-500">2FA is currently enabled on your account.</p>
                <Button variant="destructive" onClick={handleDisable}>Disable 2FA</Button>
            </div>
        ) : (
            <div className="space-y-4">
                <p>Add an extra layer of security to your account.</p>
                <Button onClick={handleEnable} disabled={isEnabling}>Enable 2FA</Button>

                {isEnabling && (
                  <div className="p-4 border rounded-lg space-y-4">
                    <p>1. Scan this QR code with your authenticator app.</p>
                    {qrCode && <img src={qrCode} alt="2FA QR Code" />}
                    <p className="text-sm text-muted-foreground">Or manually enter this secret: <code className="bg-muted p-1 rounded">{secret}</code></p>
                    <hr/>
                    <p>2. Enter the 6-digit code from your app to verify.</p>
                    <div className="flex gap-2">
                        <Input 
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="123456"
                        />
                        <Button onClick={handleVerify}>Verify & Enable</Button>
                    </div>
                  </div>
                )}
            </div>
        )}
      </CardContent>
    </Card>
  );
}

export function BackupSettings() {
    const { user } = useAuth();
    const [backups, setBackups] = useState<FileObject[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBackups = async () => {
        if (!user) return;
        setLoading(true);
        const { files, error: listError } = await listBackups(user.id);
        if (listError) setError(listError.message);
        if (files) setBackups(files);
        setLoading(false);
    }

    useEffect(() => {
        if (user) {
            fetchBackups();
        }
    }, [user]);

    const handleBackup = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        const { error: backupError } = await backupNow(user.id);
        if (backupError) setError(backupError.message);
        await fetchBackups();
        setLoading(false);
    }

    const handleRecover = async (backupName: string) => {
        if (!user || !confirm(`Are you sure you want to restore from this backup? All current data will be overwritten.`)) return;
        setLoading(true);
        setError(null);
        const { error: recoverError } = await recoverFromBackup(user.id, backupName);
        if (recoverError) {
             setError(recoverError.message);
        } else {
            alert('Recovery successful! The application will now reload.');
            window.location.reload();
        }
        setLoading(false);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cloud Backup & Recovery</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    Create an encrypted backup of your local data and store it securely in the cloud.
                </p>
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                <div className="space-y-4">
                    <Button onClick={handleBackup} disabled={loading}>{loading ? 'Backing up...' : 'Backup Now'}</Button>
                    <div className="space-y-2">
                        <h4 className="font-medium">Available Backups</h4>
                        {loading && backups.length === 0 && <p className="text-sm text-muted-foreground">Loading backups...</p>}
                        {!loading && backups.length === 0 && <p className="text-sm text-muted-foreground">No backups found.</p>}
                        <ul className="border rounded-lg p-2 max-h-48 overflow-y-auto">
                            {backups.map(backup => (
                                <li key={backup.id} className="flex justify-between items-center p-2 hover:bg-muted">
                                    <span className="text-sm">{new Date(backup.created_at).toLocaleString()}</span>
                                    <Button size="sm" variant="outline" onClick={() => handleRecover(backup.name)} disabled={loading}>
                                        {loading ? 'Working...' : 'Restore'}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 