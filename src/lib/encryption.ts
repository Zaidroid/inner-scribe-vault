
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'selfmastery-app-key'; // In production, this should be user-generated

export const encrypt = (data: any): string => {
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
};

export const decrypt = (encryptedData: string): any => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

export const generateUserKey = (): string => {
  return CryptoJS.lib.WordArray.random(256/8).toString();
};
