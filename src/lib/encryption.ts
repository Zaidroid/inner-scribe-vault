import CryptoJS from 'crypto-js';

// Create a single worker instance
const encryptionWorker = new Worker(new URL('../workers/encryption.worker.ts', import.meta.url), { type: 'module' });

let rpcId = 1;
const pendingRequests = new Map<number, { resolve: (value: any) => void, reject: (reason?: any) => void }>();

encryptionWorker.onmessage = (event: MessageEvent) => {
    const { id, type, payload, error } = event.data;
    if (!pendingRequests.has(id)) {
        console.warn(`Received message with unknown id: ${id}`);
        return;
    }
    const { resolve, reject } = pendingRequests.get(id)!;
    pendingRequests.delete(id);

    if (error) {
        if (type === 'DECRYPT_RESULT') {
            // It's normal for decryption to fail with the wrong key
            resolve(null);
        } else {
            reject(new Error(error));
        }
    } else {
        if (type === 'ENCRYPT_RESULT') {
            resolve(payload.encrypted);
        } else if (type === 'DECRYPT_RESULT') {
            resolve(payload.decrypted);
        }
    }
};

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
        const id = rpcId++;
        pendingRequests.set(id, { resolve, reject });
        encryptionWorker.postMessage({ id, type: 'ENCRYPT', payload: { data } });
    });
};

// Asynchronous decrypt function
export const decrypt = (encryptedData: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const id = rpcId++;
        pendingRequests.set(id, { resolve, reject });
        encryptionWorker.postMessage({ id, type: 'DECRYPT', payload: { encryptedData } });
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
