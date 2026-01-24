
/**
 * Servicio de Almacenamiento Multimedia ASD
 * Utiliza IndexedDB para permitir archivos de gran tamaño (portadas 4K, fotos HQ).
 */
const DB_NAME = 'PubliManagerMedia';
const STORE_NAME = 'media';
const DB_VERSION = 1;

export const imageStore = {
  init: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  save: async (id: string, dataUrl: string): Promise<void> => {
    const db = await imageStore.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(dataUrl, id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  get: async (id: string): Promise<string | null> => {
    if (!id) return null;
    const db = await imageStore.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  delete: async (id: string): Promise<void> => {
    const db = await imageStore.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  getAll: async (): Promise<Record<string, string>> => {
    const db = await imageStore.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      const keysRequest = store.getAllKeys();
      
      request.onsuccess = () => {
        keysRequest.onsuccess = () => {
          const results: Record<string, string> = {};
          keysRequest.result.forEach((key, index) => {
            results[key.toString()] = request.result[index];
          });
          resolve(results);
        };
      };
      request.onerror = () => reject(request.error);
    });
  },

  clear: async (): Promise<void> => {
    const db = await imageStore.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};
