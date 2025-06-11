import CryptoJS from 'crypto-js';

// Create a single worker instance
const encryptionWorker = new Worker(new URL('../workers/encryption.worker.ts', import.meta.url), { type: 'module' });

// This will be replaced by a key derived from the user's password
let userEncryptionKey: string | null = null;

// Function to derive a key from a password and salt
export const deriveKey = (password: string, salt: string): string => {
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 1000 // A good starting point
  });
  return key.toString(CryptoJS.enc.Hex);
};

// Function to set the key for the current session
export const setSessionKey = (key: string) => {
  if (key) {
    encryptionWorker.postMessage({ type: 'SET_KEY', payload: { key } });
  } else {
    // Handle key being cleared on logout
    encryptionWorker.postMessage({ type: 'SET_KEY', payload: { key: null } });
  }
};

// Function to generate a new salt
export const generateSalt = (): string => {
  return CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
};

// Asynchronous encrypt function
export const encrypt = (data: any): Promise<string> => {
    return new Promise((resolve, reject) => {
        encryptionWorker.onmessage = (event: MessageEvent) => {
            if (event.data.type === 'ENCRYPT_RESULT') {
                if (event.data.error) {
                    reject(new Error(event.data.error));
                } else {
                    resolve(event.data.payload.encrypted);
                }
            }
        };
        encryptionWorker.postMessage({ type: 'ENCRYPT', payload: { data } });
    });
};

// Asynchronous decrypt function
export const decrypt = (encryptedData: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        encryptionWorker.onmessage = (event: MessageEvent) => {
            if (event.data.type === 'DECRYPT_RESULT') {
                if (event.data.error) {
                    // It's normal to fail decryption, so we resolve with null
                    resolve(null);
                } else {
                    resolve(event.data.payload.decrypted);
                }
            }
        };
        encryptionWorker.postMessage({ type: 'DECRYPT', payload: { encryptedData } });
    });
};

// The decryptWithKey function is now tricky. For the migration, it's simpler
// to keep it on the main thread as a one-time operation.
export const decryptWithKey = (encryptedData: string, key: string): any | null => {
    if (!encryptedData) return null;
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, key);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedData) {
            return null;
        }
        return JSON.parse(decryptedData);
    } catch (error) {
        // This is expected to fail often if the wrong key is used, so we don't log an error here.
        return null;
    }
}

export const generateUserKey = (): string => {
  return CryptoJS.lib.WordArray.random(256/8).toString();
};
