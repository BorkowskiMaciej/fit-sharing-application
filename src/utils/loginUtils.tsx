import { v4 as uuidv4 } from 'uuid';

export async function saveDeviceId(deviceId: string, fsUserId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const request = window.indexedDB.open("deviceDatabase", 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains("devices")) {
                db.createObjectStore("devices");
            }
        };

        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction("devices", "readwrite");
            const store = transaction.objectStore("devices");
            store.put(deviceId, "deviceId-" + fsUserId);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(new Error("Failed to save the device ID"));
        };

        request.onerror = () => {
            reject(new Error("Failed to open IndexedDB for device ID"));
        };
    });
}

export async function getDeviceId(fsUserId: string): Promise<string>{
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open("deviceDatabase", 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains("devices")) {
                db.createObjectStore("devices");
            }
        };

        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction("devices", "readonly");
            const store = transaction.objectStore("devices");
            const getRequest = store.get("deviceId-" + fsUserId);

            getRequest.onsuccess = () => {
                const deviceId = getRequest.result;
                resolve(deviceId || null);
            };

            getRequest.onerror = () => {
                reject(new Error("Failed to retrieve the device ID"));
            };
        };

        request.onerror = () => {
            reject(new Error("Failed to open IndexedDB for device ID"));
        };
    });
}

export function generateDeviceId(): string {
    return uuidv4();
}
