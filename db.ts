
import { AppData, Imprint, HistoryRecord, AppSettings } from './types';
import { imageStore } from './imageStore';

const STORAGE_KEY = 'publimanager_asd_v3';
const OLD_KEYS = ['publimanager_asd_v2', 'publimanager_asd_v1', 'publimanager_data'];

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
  pseudonyms: [
    { id: 'p1', name: 'Elena R. S.', bio: 'Escritora de suspense.' }
  ],
  series: [],
  books: [],
  tasks: [],
  sales: [],
  history: [],
  settings: defaultSettings
};

export const db = {
  getData: (): AppData => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      
      if (!stored) {
        for (const oldKey of OLD_KEYS) {
          const oldData = localStorage.getItem(oldKey);
          if (oldData) {
            localStorage.setItem(STORAGE_KEY, oldData);
            return JSON.parse(oldData);
          }
        }
        return initialData;
      }
      
      const parsed = JSON.parse(stored);
      if (!parsed.imprints || parsed.imprints.length === 0) {
        parsed.imprints = initialImprints;
      }
      if (!parsed.history) {
        parsed.history = [];
      }
      if (!parsed.settings) {
        parsed.settings = defaultSettings;
      } else {
        if (!parsed.settings.defaultLanguage) parsed.settings.defaultLanguage = 'Español';
        if (!parsed.settings.externalLinks) parsed.settings.externalLinks = [];
      }
      return parsed;
    } catch (e) {
      console.error("Error al leer de localStorage", e);
      return initialData;
    }
  },
  
  saveData: (data: AppData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new Event('storage_updated'));
      return true;
    } catch (e) {
      console.error("Error crítico de persistencia:", e);
      return false;
    }
  },

  logAction: (bookId: string, bookTitle: string, action: string, details?: string) => {
    const data = db.getData();
    const newRecord: HistoryRecord = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      bookId,
      bookTitle,
      action,
      timestamp: new Date().toISOString(),
      details
    };
    data.history.unshift(newRecord);
    if (data.history.length > 500) {
      data.history = data.history.slice(0, 500);
    }
    db.saveData(data);
  },

  addItem: <T extends { id: string },>(collection: keyof AppData, item: T) => {
    const data = db.getData();
    (data[collection] as any[]).push(item);
    return db.saveData(data);
  },

  updateItem: <T extends { id: string },>(collection: keyof AppData, item: T) => {
    const data = db.getData();
    const index = (data[collection] as any[]).findIndex(i => i.id === item.id);
    if (index !== -1) {
      (data[collection] as any)[index] = item;
      return db.saveData(data);
    }
    return false;
  },

  deleteItem: (collection: keyof AppData, id: string) => {
    const data = db.getData();
    (data[collection] as any) = (data[collection] as any[]).filter(i => i.id !== id);
    imageStore.delete(id); 
    return db.saveData(data);
  },

  exportData: async () => {
    const metadata = db.getData();
    const media = await imageStore.getAll();
    const fullBackup = { metadata, media, timestamp: new Date().toISOString(), version: '3.0' };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PM_FULL_Backup_${new Date().toISOString().split('T')[0]}.json`;
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
             db.saveData(metadata);
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
