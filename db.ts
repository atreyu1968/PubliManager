
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
  fetchData: async (): Promise<{ data: AppData, source: 'server' | 'local' | 'empty_server' }> => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const serverData = await response.json();
        if (serverData && typeof serverData === 'object' && serverData.books) {
          console.log("SYNC SUCCESS: Datos obtenidos de SQLite Servidor");
          localStorage.setItem(STORAGE_KEY, JSON.stringify(serverData));
          return { data: serverData, source: 'server' };
        } else {
          // El servidor respondió pero no tiene datos (está virgen)
          return { data: db.getData(), source: 'empty_server' };
        }
      }
    } catch (e) {
      console.warn("SYNC WARNING: Servidor no responde o inaccesible.");
    }
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { data: initialData, source: 'local' };
    
    try {
      const parsed = JSON.parse(stored);
      return { data: parsed, source: 'local' };
    } catch(e) {
      return { data: initialData, source: 'local' };
    }
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('storage_updated', { detail: data }));

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error("Server rejected data");
      return true;
    } catch (e) {
      console.error("SAVE ERROR:", e);
      return false;
    }
  },

  forcePushToServer: async (): Promise<boolean> => {
    const localData = db.getData();
    console.log("Iniciando migración forzada al servidor...");
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localData)
      });
      return response.ok;
    } catch (e) {
      console.error("Fallo en la migración:", e);
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

  exportData: () => {
    const data = db.getData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `publimanager_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
