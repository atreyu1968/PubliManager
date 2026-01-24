
import { AppData, Imprint } from './types';

const STORAGE_KEY = 'publimanager_asd_v3';

const initialImprints: Imprint[] = [
  { id: '1', name: 'ASD Español', language: 'Español' },
  { id: '2', name: 'ASD English', language: 'Inglés' },
  { id: '3', name: 'ASD Italiano', language: 'Italiano' },
  { id: '4', name: 'ASD Português', language: 'Portugués' },
  { id: '5', name: 'ASD Deutsch', language: 'Alemán' },
  { id: '6', name: 'ASD Français', language: 'Francés' },
  { id: '7', name: 'ASD Català', language: 'Catalán' }
];

const initialData: AppData = {
  imprints: initialImprints,
  pseudonyms: [
    { id: 'p1', name: 'Elena R. S.', bio: 'Escritora de suspense.' }
  ],
  series: [],
  books: [],
  tasks: [],
  sales: []
};

export const db = {
  getData: (): AppData => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return initialData;
      const parsed = JSON.parse(stored);
      
      // Aseguramos que los sellos base siempre existan
      if (!parsed.imprints || parsed.imprints.length === 0) {
        parsed.imprints = initialImprints;
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
      alert("⚠️ ERROR DE ESPACIO: No se pudo guardar. Intenta usar imágenes de portada más pequeñas (menos de 500kb).");
      return false;
    }
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
    return db.saveData(data);
  }
};
