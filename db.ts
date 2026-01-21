import { AppData } from './types';

const STORAGE_KEY = 'publimanager_data_v2';

const initialData: AppData = {
  imprints: [
    { id: '1', name: 'Sello Aurora', language: 'Español' },
    { id: '2', name: 'Moonlight Press', language: 'Inglés' }
  ],
  pseudonyms: [
    { id: '1', name: 'Elena R. S.', bio: 'Escritora de suspense.' },
    { id: '2', name: 'John Doe', bio: 'Ficción contemporánea.' }
  ],
  series: [
    { id: 's1', name: 'Crónicas del Abismo', description: 'Fantasía oscura.' }
  ],
  books: [],
  tasks: [],
  sales: []
};

export const db = {
  getData: (): AppData => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return initialData;
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error al leer de localStorage", e);
      return initialData;
    }
  },
  
  saveData: (data: AppData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Error al guardar en localStorage (¿Límite excedido?)", e);
      alert("Error al guardar datos. Es posible que las imágenes sean demasiado grandes.");
      return false;
    }
  },

  addItem: <T extends { id: string },>(collection: keyof AppData, item: T) => {
    const data = db.getData();
    (data[collection] as any[]).push(item);
    db.saveData(data);
  },

  updateItem: <T extends { id: string },>(collection: keyof AppData, item: T) => {
    const data = db.getData();
    const index = (data[collection] as any[]).findIndex(i => i.id === item.id);
    if (index !== -1) {
      (data[collection] as any)[index] = item;
      db.saveData(data);
    }
  },

  deleteItem: (collection: keyof AppData, id: string) => {
    const data = db.getData();
    (data[collection] as any) = (data[collection] as any[]).filter(i => i.id !== id);
    db.saveData(data);
  }
};