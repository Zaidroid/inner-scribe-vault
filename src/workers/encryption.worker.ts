/// <reference lib="webworker" />
import CryptoJS from 'crypto-js';

let sessionKey: string | null = null;

self.onmessage = (event: MessageEvent) => {
    const { type, payload, id } = event.data;

    switch (type) {
        case 'SET_KEY':
            sessionKey = payload.key;
            break;
        case 'ENCRYPT':
            if (!sessionKey) {
                self.postMessage({ id, type: 'ENCRYPT_RESULT', error: 'Encryption key not set.' });
                break;
            }
            try {
                const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload.data), sessionKey).toString();
                self.postMessage({ id, type: 'ENCRYPT_RESULT', payload: { encrypted } });
            } catch (error) {
                self.postMessage({ id, type: 'ENCRYPT_RESULT', error: error.message });
            }
            break;
        case 'DECRYPT':
            if (!sessionKey) {
                self.postMessage({ id, type: 'DECRYPT_RESULT', error: 'Decryption key not set.' });
                break;
            }
            try {
                const bytes = CryptoJS.AES.decrypt(payload.encryptedData, sessionKey);
                const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                if (!decrypted) {
                    throw new Error('Decryption resulted in empty data.');
                }
                self.postMessage({ id, type: 'DECRYPT_RESULT', payload: { decrypted: JSON.parse(decrypted) } });
            } catch (error) {
                self.postMessage({ id, type: 'DECRYPT_RESULT', error: error.message });
            }
            break;
        default:
            console.warn('Unknown message type received in worker:', type);
    }
}; 