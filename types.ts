
export type Platform = 'KDP' | 'D2D' | 'Ambos';
export type BookFormat = 'Ebook' | 'Papel' | 'Dura' | 'Audio';

export interface Imprint {
  id: string;
  name: string;
  language: string;
  logoUrl?: string; // Nuevo
}

export interface Pseudonym {
  id: string;
  name: string;
  bio: string;
  photoUrl?: string;
  standardAcknowledgments?: string;
}

export interface Series {
  id: string;
  name: string;
  description: string;
}

export interface Book {
  id: string;
  title: string;
  seriesId?: string;
  seriesOrder?: number;
  pseudonymId: string;
  imprintId: string;
  description: string;
  shortSummary?: string;
  isbn?: string;
  platforms: Platform[];
  formats: BookFormat[];
  price: number;
  releaseDate: string;
  status: 'Draft' | 'Published' | 'Archived';
  coverUrl?: string;
  amazonLink?: string;
  d2dLink?: string;
  driveFolderUrl?: string;
  kindleUnlimited: boolean;
  kuStrategy: boolean;
}

export interface Task {
  id: string;
  bookId: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  type: 'Metadata' | 'Marketing' | 'Publication' | 'Production';
}

export interface SaleRecord {
  id: string;
  bookId: string;
  year: number;
  month: number; 
  units: number;
  kenpc: number;
  revenue: number;
  platform: 'KDP' | 'D2D';
}

export interface AppData {
  imprints: Imprint[];
  pseudonyms: Pseudonym[];
  series: Series[];
  books: Book[];
  tasks: Task[];
  sales: SaleRecord[];
}
