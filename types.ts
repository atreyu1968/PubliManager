
export type Platform = 'KDP' | 'D2D' | 'Ambos';
export type BookFormat = 'Ebook' | 'Papel' | 'Dura' | 'Audio';
export type BookStatus = 'Sin escribir' | 'Sin editar' | 'Preparado' | 'Publicado';

export interface ExternalLink {
  id: string;
  name: string;
  url: string;
  icon?: string;
  logoUrl?: string;
}

export interface Imprint {
  id: string;
  name: string;
  language: string;
  logoUrl?: string; 
  landingUrl?: string;
}

export interface Pseudonym {
  id: string;
  name: string;
  bio: string;
  photoUrl?: string;
  standardAcknowledgments?: string;
  driveFolderUrl?: string;
  landingUrl?: string;
}

export interface Series {
  id: string;
  name: string;
  description: string;
  language?: string;
}

export interface HistoryRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  action: string; 
  timestamp: string;
  details?: string;
}

export interface Book {
  id: string;
  title: string;
  language?: string;
  seriesId?: string;
  seriesOrder?: number;
  pseudonymId: string;
  imprintId: string;
  description: string;
  shortSummary?: string;
  isbn?: string;
  asin?: string;
  platforms: Platform[];
  formats: BookFormat[];
  price: number;
  releaseDate: string;
  scheduledDate?: string; 
  status: BookStatus;
  coverUrl?: string;
  amazonLink?: string;
  d2dLink?: string;
  landingUrl?: string;
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
  currency: string;
  platform: 'KDP' | 'D2D';
}

export interface AppSettings {
  viewMode: 'grid' | 'list';
  customActions: string[];
  defaultLanguage: string;
  externalLinks: ExternalLink[];
  googleSheetMasterUrl?: string;
}

export interface AppData {
  imprints: Imprint[];
  pseudonyms: Pseudonym[];
  series: Series[];
  books: Book[];
  tasks: Task[];
  sales: SaleRecord[];
  history: HistoryRecord[];
  settings: AppSettings;
}
