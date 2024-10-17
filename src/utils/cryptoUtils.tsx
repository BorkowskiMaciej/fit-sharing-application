import { Buffer } from 'buffer';
import {News} from "../types";

export async function generateKeyPair(): Promise<CryptoKeyPair> {
    return await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"]
    );
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey("spki", key);
    const buffer = new Uint8Array(exported);
    return Buffer.from(buffer).toString('base64');
}

export async function importPublicKey(pem: string): Promise<CryptoKey> {
    const binaryDer = Buffer.from(pem, 'base64');
    return window.crypto.subtle.importKey(
        "spki",
        binaryDer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["encrypt"]
    );
}

export async function savePrivateKey(privateKey: CryptoKey, fsUserId: string) {
    return new Promise<void>((resolve, reject) => {
        const request = window.indexedDB.open("keyDatabase", 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains("keys")) {
                db.createObjectStore("keys");
            }
        };

        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction("keys", "readwrite");
            const store = transaction.objectStore("keys");
            store.put(privateKey, "privateKey-" + fsUserId);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(new Error("Failed to save the private key"));
        };

        request.onerror = () => {
            reject(new Error("Failed to open IndexedDB"));
        };
    });
}

export async function getPrivateKey(fsUserId: string | undefined): Promise<CryptoKey | null> {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open("keyDatabase", 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains("keys")) {
                db.createObjectStore("keys");
            }
        };

        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction("keys", "readonly");
            const store = transaction.objectStore("keys");
            const key = "privateKey-" + fsUserId;
            const getRequest = store.get(key);

            getRequest.onsuccess = () => {
                console.log(getRequest.result);
                const key = getRequest.result;
                resolve(key || null);
            };

            getRequest.onerror = () => {
                reject(new Error("Failed to retrieve the private key"));
            };
        };

        request.onerror = () => {
            reject(new Error("Failed to open the IndexedDB"));
        };
    });
}

export async function encryptData(publicKey: CryptoKey, data: string): Promise<string> {
    const encoded = new TextEncoder().encode(data);
    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP"
        },
        publicKey,
        encoded
    );
    return Buffer.from(new Uint8Array(encrypted)).toString('base64');
}

export async function decryptData(privateKey: CryptoKey, encryptedData: string): Promise<string> {
    const encryptedArray = Uint8Array.from(Buffer.from(encryptedData, 'base64'));
    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: "RSA-OAEP"
        },
        privateKey,
        encryptedArray
    );
    return new TextDecoder().decode(decrypted);
}

export async function decryptNews(news: News[], privateKey: CryptoKey): Promise<News[]> {
    return await Promise.all(news.map(async (item) => {
        try {
            const decryptedContent = await decryptData(privateKey, item.data);
            return {...item, data: decryptedContent};
        } catch (error) {
            console.error('Failed to decrypt news:', error);
            return item;
        }
    }));
}