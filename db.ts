
import { AppData, Imprint, HistoryRecord, AppSettings } from './types';
import { imageStore } from './imageStore';

const STORAGE_KEY = 'publimanager_asd_v3';
const API_URL = '/api/data';

const initialImprints: Imprint[] = [
  { id: '1', name: 'ASD Español', language: 'Español' },
  { id: '2', name: 'ASD English', language: 'Inglés' },
  { id: '3', name: 'ASD Italiano', language: 'Italiano' },
  { id: '4', name: 'ASD Português', language: 'Portugués' },
  { id: '5', name: 'ASD Deutsch', language: 'Alemán' },
  { id: '6', name: 'ASD Français', language: 'Francés' },
  { id: '7', name: 'ASD Català', language: 'Catalán' }
];

const defaultSettings: AppSettings = {
  viewMode: 'grid',
  defaultLanguage: 'Español',
  customActions: ['Traducción en curso', 'Corrección ortotipográfica', 'Diseño de portada', 'Maquetación interior', 'Revisión de galeradas'],
  externalLinks: []
};

const initialData: AppData = {
  imprints: initialImprints,
  pseudonyms: [{ id: 'p1', name: 'Elena R. S.', bio: 'Escritora de suspense.' }],
  series: [],
  books: [],
  tasks: [],
  sales: [],
  history: [],
  settings: defaultSettings
};

export const db = {
  // Ahora getData es asíncrono para intentar traer datos del servidor
  fetchData: async (): Promise<{ data: AppData, source: 'server' | 'local' }> => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const serverData = await response.json();
        if (serverData) {
          console.log("Sincronizado con SQLite en Servidor");
          // Espejo en local por si falla la conexión después
          localStorage.setItem(STORAGE_KEY, JSON.stringify(serverData));
          return { data: serverData, source: 'server' };
        }
      }
    } catch (e) {
      console.warn("Servidor no disponible, usando almacenamiento local.");
    }
    
    // Fallback a localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { data: initialData, source: 'local' };
    
    const parsed = JSON.parse(stored);
    return { data: parsed, source: 'local' };
  },

  getData: (): AppData => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialData;
    try {
      return JSON.parse(stored);
    } catch(e) {
      return initialData;
    }
  },
  
  saveData: async (data: AppData) => {
    try {
      // 1. Guardar en local (inmediato)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('storage_updated', { detail: data }));

      // 2. Intentar persistir en Servidor SQLite
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error("Error en servidor");
      
      return true;
    } catch (e) {
      console.error("Error persistiendo en servidor:", e);
      // Los datos siguen en localStorage, pero avisamos al usuario
      return false;
    }
  },

  logAction: (bookId: string, bookTitle: string, action: string, details?: string, existingData?: AppData) => {
    const data = existingData || db.getData();
    const newRecord: HistoryRecord = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      bookId,
      bookTitle,
      action,
      timestamp: new Date().toISOString(),
      details
    };
    data.history.unshift(newRecord);
    if (data.history.length > 500) data.history = data.history.slice(0, 500);
    
    if (!existingData) {
      db.saveData(data);
    }
    return data;
  },

  addItem: async <T extends { id: string },>(collection: keyof AppData, item: T) => {
    const data = db.getData();
    (data[collection] as any[]).push(item);
    return await db.saveData(data);
  },

  updateItem: async <T extends { id: string },>(collection: keyof AppData, item: T) => {
    const data = db.getData();
    const index = (data[collection] as any[]).findIndex(i => i.id === item.id);
    if (index !== -1) {
      (data[collection] as any)[index] = item;
      return await db.saveData(data);
    }
    return false;
  },

  deleteItem: async (collection: keyof AppData, id: string) => {
    const data = db.getData();
    (data[collection] as any) = (data[collection] as any[]).filter(i => i.id !== id);
    imageStore.delete(id); 
    return await db.saveData(data);
  },

  exportData: async () => {
    const metadata = db.getData();
    const media = await imageStore.getAll();
    const fullBackup = { metadata, media, timestamp: new Date().toISOString(), version: '3.0' };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PM_SQLITE_Sync_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  },

  importData: (jsonFile: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const backup = JSON.parse(content);
          let metadata = backup.metadata || backup;
          let media = backup.media || {};
          if (metadata.books && metadata.imprints) {
             await db.saveData(metadata);
             await imageStore.clear();
             for (const [id, dataUrl] of Object.entries(media)) {
               await imageStore.save(id, dataUrl as string);
             }
             resolve(true);
          } else {
            resolve(false);
          }
        } catch (err) {
          resolve(false);
        }
      };
      reader.readAsText(jsonFile);
    });
  }
};
