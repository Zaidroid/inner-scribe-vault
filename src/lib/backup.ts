import { supabase } from '@/integrations/supabase/client';
import { db } from './database';
import { encrypt, decrypt } from './encryption';

const BUCKET_NAME = 'user_backups';

export async function backupNow(userId: string): Promise<{ error: any }> {
    try {
        // 1. Export data from IndexedDB
        const data = await db.exportData();
        const jsonString = JSON.stringify(data);

        // 2. Encrypt the data
        const encryptedData = await encrypt(jsonString);
        if (!encryptedData) {
            throw new Error('Encryption failed during backup.');
        }

        // 3. Upload to Supabase Storage
        const filePath = `${userId}/backup-${new Date().toISOString()}.json.enc`;
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, encryptedData);

        if (error) throw error;
        
        return { error: null };
    } catch (error) {
        console.error('Backup failed:', error);
        return { error };
    }
}

export async function listBackups(userId: string): Promise<{ files: any[] | null, error: any }> {
    try {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .list(userId, {
                sortBy: { column: 'created_at', order: 'desc' },
            });
        
        if (error) throw error;
        return { files: data, error: null };
    } catch (error) {
        console.error('Failed to list backups:', error);
        return { files: null, error };
    }
}

export async function recoverFromBackup(userId: string, backupName: string): Promise<{ error: any }> {
    try {
        // 1. Download the encrypted backup file
        const filePath = `${userId}/${backupName}`;
        const { data, error: downloadError } = await supabase.storage
            .from(BUCKET_NAME)
            .download(filePath);
        
        if (downloadError) throw downloadError;

        // The file content is a Blob, we need to read it as text
        const encryptedText = await data.text();

        // 2. Decrypt the content
        const decryptedJson = await decrypt(encryptedText);
        if (!decryptedJson) {
            throw new Error('Decryption failed. The key might be incorrect or the data corrupted.');
        }
        
        const backupData = JSON.parse(decryptedJson);

        // 3. Import the data into the local DB
        await db.importData(backupData);
        
        return { error: null };
    } catch (error) {
        console.error('Recovery failed:', error);
        return { error };
    }
} 