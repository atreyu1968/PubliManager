
import React, { useState, useEffect } from 'react';
import { AppData, Book, BookStatus, Series, Pseudonym, Platform, Imprint } from '../types';
import { db } from '../db';
import { imageStore } from '../imageStore';

interface Props {
  data: AppData;
  refreshData: () => void;
}

const LANGUAGES = ['Español', 'Inglés', 'Italiano', 'Portugués', 'Alemán', 'Francés', 'Catalán'];
const STATUS_OPTIONS: BookStatus[] = ['Sin escribir', 'Sin editar', 'Preparado', 'Publicado'];

const BooksManager: React.FC<Props> = ({ data, refreshData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookStatus | 'Todos'>('Todos');
  const [authorFilter, setAuthorFilter] = useState<string>('Todos');
  const [imprintFilter, setImprintFilter] = useState<string>('Todos');
  const [covers, setCovers] = useState<Record<string, string>>({});
  
  const [isCreatingNewSeries, setIsCreatingNewSeries] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState('');
  
  const [isCreatingNewAuthor, setIsCreatingNewAuthor] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState('');

  // Estados para loggear acción personalizada en la edición
  const [customActionToLog, setCustomActionToLog] = useState('');
  const [customActionDetails, setCustomActionDetails] = useState('');

  const [newBook, setNewBook] = useState<Partial<Book>>({
    title: '',
    pseudonymId: '',
    imprintId: '',
    seriesId: '',
    seriesOrder: 1,
    description: '',
    platforms: ['KDP'],
    formats: ['Ebook'],
    price: 0.99,
    scheduledDate: '', 
    status: 'Sin escribir',
    kindleUnlimited: false,
    kuStrategy: false,
    amazonLink: '',
    d2dLink: '',
    asin: ''
  });

  useEffect(() => {
    const loadCovers = async () => {
      const allMedia = await imageStore.getAll();
      setCovers(allMedia);
    };
    loadCovers();
  }, [data.books]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBook(prev => ({ ...prev, coverUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBook = async () => {
    if (!newBook.title) {
      alert("El título es obligatorio.");
      return;
    }
    
    let finalPseudonymId = newBook.pseudonymId;

    if (isCreatingNewAuthor && newAuthorName.trim()) {
      const newAuthor: Pseudonym = {
        id: `p-vuelo-${Date.now()}`,
        name: newAuthorName.trim(),
        bio: 'Biografía pendiente de completar.',
      };
      db.addItem('pseudonyms', newAuthor);
      finalPseudonymId = newAuthor.id;
    }

    const currentData = db.getData();
    const tempCoverUrl = newBook.coverUrl;

    if (editingId) {
      const index = currentData.books.findIndex(b => b.id === editingId);
      if (index !== -1) {
        const oldBook = currentData.books[index];
        const bookToSave = { 
          ...newBook, 
          id: editingId,
          pseudonymId: finalPseudonymId,
          coverUrl: '' 
        } as Book;
        
        currentData.books[index] = bookToSave;
        
        if (tempCoverUrl && tempCoverUrl.startsWith('data:')) {
           await imageStore.save(editingId, tempCoverUrl);
        }

        // Determinar acción para el log
        if (customActionToLog) {
           db.logAction(editingId, bookToSave.title, customActionToLog, customActionDetails || `Hito alcanzado: ${customActionToLog}`);
        } else {
           let details = `Actualización de metadatos.`;
           if (oldBook.status !== bookToSave.status) {
             details = `Cambio de estado: ${oldBook.status} -> ${bookToSave.status}.`;
           }
           db.logAction(editingId, bookToSave.title, oldBook.status !== bookToSave.status ? 'Cambio de Estado' : 'Modificación', details);
        }
      }
      db.saveData(currentData);
    } else {
      const timestamp = Date.now();
      for (let idx = 0; idx < LANGUAGES.length; idx++) {
        const lang = LANGUAGES[idx];
        const matchingImprint = currentData.imprints.find(i => i.language.toLowerCase() === lang.toLowerCase());
        const bookId = `b-${lang.toLowerCase()}-${timestamp}-${idx}`;
        
        const freshBook = { 
          ...newBook, 
          id: bookId,
          title: `${newBook.title} (${lang})`,
          language: lang,
          pseudonymId: finalPseudonymId,
          imprintId: matchingImprint?.id || currentData.imprints[0]?.id || '1',
          status: 'Sin escribir',
          coverUrl: '' 
        } as Book;

        currentData.books.push(freshBook);

        if (tempCoverUrl && tempCoverUrl.startsWith('data:')) {
           await imageStore.save(bookId, tempCoverUrl);
        }
        db.logAction(bookId, freshBook.title, 'Creación', `Nuevo proyecto iniciado para el idioma ${lang}.`);
      }
      db.saveData(currentData);
    }

    refreshData();
    closeModal();
  };

  const openEdit = async (book: Book) => {
    const fullCover = await imageStore.get(book.id);
    setNewBook({ ...book, coverUrl: fullCover || book.coverUrl || '' });
    setEditingId(book.id);
    setIsCreatingNewAuthor(false);
    setCustomActionToLog('');
    setCustomActionDetails('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setIsCreatingNewAuthor(false);
    setNewAuthorName('');
    setCustomActionToLog('');
    setCustomActionDetails('');
    setNewBook({ 
      title: '', pseudonymId: '', seriesId: '', seriesOrder: 1, description: '', platforms: ['KDP'], 
      status: 'Sin escribir', kindleUnlimited: false, scheduledDate: '', amazonLink: '', d2dLink: '', asin: ''
    });
  };

  const filteredBooks = data.books.filter(book => {
    const author = data.pseudonyms.find(p => p.id === book.pseudonymId);
    const series = data.series.find(s => s.id === book.seriesId);
    const searchLow = searchTerm.toLowerCase();
    const matchesSearch = book.title.toLowerCase().includes(searchLow) || 
                          (author?.name.toLowerCase().includes(searchLow)) ||
                          (series?.name.toLowerCase().includes(searchLow)) ||
                          (book.asin?.toLowerCase().includes(searchLow));
    const matchesStatus = statusFilter === 'Todos' || book.status === statusFilter;
    const matchesAuthor = authorFilter === 'Todos' || book.pseudonymId === authorFilter;
    const matchesImprint = imprintFilter === 'Todos' || book.imprintId === imprintFilter;
    return matchesSearch && matchesStatus && matchesAuthor && matchesImprint;
  }).sort((a, b) => a.title.localeCompare(b.title));

  const getStatusStyle = (status: BookStatus) => {
    switch(status) {
      case 'Sin escribir': return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'Sin editar': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'Preparado': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Publicado': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const isListView = data.settings.viewMode === 'list';

  return (
    <div className="space-y-6 text-slate-900 pb-20 animate-fadeIn">
      {/* HEADER COMPACTO */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
            <i className="fa-solid fa-book-journal-whills text-indigo-600"></i>
            Catálogo Editorial
          </h1>
          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
            Vista actual: {isListView ? 'Lista' : 'Rejilla'} • {filteredBooks.length} Proyectos
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="w-full lg:w-auto bg-slate-900 text-white px-6 py-3.5 rounded-2xl hover:bg-indigo-600 shadow-xl transition-all active:scale-95 font-black text-[9px] tracking-[0.2em] uppercase">
          <i className="fa-solid fa-plus-circle mr-2"></i> Nuevo Lanzamiento Maestro
        </button>
      </div>

      {/* FILTROS AVANZADOS */}
      <div className="space-y-4">
        <div className="relative group">
          <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
          <input 
            type="text" 
            placeholder="Buscar por título, autor o ASIN..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-16 pr-6 text-sm font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[150px]">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-[10px] font-bold text-slate-600 outline-none"
            >
              <option value="Todos">Todos los estados</option>
              {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <select 
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-[10px] font-bold text-slate-600 outline-none"
            >
              <option value="Todos">Todos los autores</option>
              {data.pseudonyms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* LISTADO DINÁMICO (GRID / LIST) */}
      <div className={isListView ? "space-y-3" : "grid grid-cols-1 xl:grid-cols-2 gap-4"}>
        {filteredBooks.map(book => {
          const author = data.pseudonyms.find(p => p.id === book.pseudonymId);
          const imprint = data.imprints.find(i => i.id === book.imprintId);
          const displayCover = covers[book.id] || book.coverUrl;
          
          return (
            <div key={book.id} className={`bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex items-center gap-5 group relative overflow-hidden ${isListView ? 'p-3' : 'p-4'}`}>
              <div className={`${isListView ? 'w-10 h-14' : 'w-16 h-24'} bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 shadow-inner flex items-center justify-center border border-slate-100`}>
                {displayCover ? (
                  <img src={displayCover} className="w-full h-full object-cover" alt={book.title} />
                ) : (
                  <i className={`fa-solid fa-book-bookmark text-slate-200 ${isListView ? 'text-sm' : 'text-xl'}`}></i>
                )}
              </div>
              <div className="flex-1 min-w-0 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border ${getStatusStyle(book.status)}`}>
                    {book.status}
                  </span>
                </div>
                <h3 className={`${isListView ? 'text-xs' : 'text-sm'} font-black text-slate-900 truncate pr-4 leading-tight`}>{book.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">{author?.name || 'Desconocido'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pr-2">
                <button onClick={() => openEdit(book)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                  <i className="fa-solid fa-edit"></i>
                </button>
                {!isListView && (
                  <button onClick={() => { if(confirm('¿Eliminar?')) { db.deleteItem('books', book.id); refreshData(); } }} className="p-2.5 text-slate-200 hover:text-red-500 transition-colors">
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE EDICIÓN / LANZAMIENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 lg:p-10">
          <div className="bg-white rounded-[2.5rem] max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleIn border border-white/10">
            
            <div className="px-8 py-5 border-b border-slate-100 bg-white shrink-0 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                  {editingId ? 'Editor Maestro' : 'Nuevo Lanzamiento Maestro'}
                </h2>
              </div>
              <button onClick={closeModal} className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-300">
                <i className="fa-solid fa-times text-lg"></i>
              </button>
            </div>
            
            <div className="overflow-y-auto p-8 custom-scrollbar bg-slate-50/20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white p-5 rounded-3xl border border-slate-100">
                    <div className="aspect-[3/4] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center relative group transition-all hover:border-indigo-400 max-w-[220px] mx-auto">
                      {newBook.coverUrl ? (
                        <img src={newBook.coverUrl} className="w-full h-full object-cover" />
                      ) : (
                        <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-200"></i>
                      )}
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>

                  <div className="bg-slate-900 p-6 rounded-3xl space-y-5">
                    <div>
                      <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3">Workflow de Producción</label>
                      <select 
                        value={newBook.status} 
                        onChange={e => setNewBook({...newBook, status: e.target.value as BookStatus})}
                        className="w-full bg-slate-800 border-none rounded-xl p-3 text-[10px] font-black text-white uppercase outline-none"
                      >
                        {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Título Principal de la Obra</label>
                    <input type="text" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black text-lg outline-none" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <label className="text-[9px] font-black text-slate-400 uppercase mb-3 block">Autor / Identidad</label>
                        <select value={newBook.pseudonymId} onChange={e => setNewBook({...newBook, pseudonymId: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs font-bold outline-none">
                          <option value="">Seleccionar autor...</option>
                          {data.pseudonyms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-3">Sello Editorial</label>
                      <select value={newBook.imprintId} onChange={e => setNewBook({...newBook, imprintId: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs font-bold outline-none">
                        {data.imprints.map(i => <option key={i.id} value={i.id}>{i.name} ({i.language})</option>)}
                      </select>
                    </div>
                  </div>

                  {/* SECCIÓN DE HITO PERSONALIZADO AL EDITAR */}
                  {editingId && (
                    <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 space-y-4">
                       <label className="block text-[9px] font-black text-indigo-600 uppercase tracking-widest">Registrar Acción Personalizada</label>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <select 
                            value={customActionToLog}
                            onChange={(e) => setCustomActionToLog(e.target.value)}
                            className="w-full bg-white border border-indigo-100 rounded-xl p-3 text-xs font-bold outline-none"
                          >
                            <option value="">Acción por defecto (Modificación)</option>
                            {data.settings.customActions.map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                          <input 
                            type="text" 
                            placeholder="Notas opcionales del hito..."
                            value={customActionDetails}
                            onChange={(e) => setCustomActionDetails(e.target.value)}
                            className="w-full bg-white border border-indigo-100 rounded-xl p-3 text-xs outline-none"
                          />
                       </div>
                    </div>
                  )}

                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-3">Argumento / Sinopsis Maestra</label>
                    <textarea value={newBook.description} onChange={e => setNewBook({...newBook, description: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 h-32 text-xs leading-relaxed outline-none resize-none" placeholder="Escribe el resumen del libro..."></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 bg-white flex gap-4">
              <button onClick={closeModal} className="flex-1 py-4 text-slate-400 font-black text-[10px] tracking-[0.3em] uppercase">DESCARTAR</button>
              <button onClick={handleSaveBook} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl transition-all active:scale-95">
                {editingId ? 'GUARDAR CAMBIOS' : 'CREAR LANZAMIENTO MAESTRO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksManager;
