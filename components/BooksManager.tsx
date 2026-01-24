
import React, { useState, useEffect } from 'react';
import { AppData, Book, BookStatus, Series, Pseudonym, Platform } from '../types';
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
  const [covers, setCovers] = useState<Record<string, string>>({});
  
  const [isCreatingNewSeries, setIsCreatingNewSeries] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState('');
  
  const [isCreatingNewAuthor, setIsCreatingNewAuthor] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState('');

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
    d2dLink: ''
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

  const handlePlatformToggle = (platform: Platform) => {
    const currentPlatforms = newBook.platforms || [];
    if (currentPlatforms.includes(platform)) {
      setNewBook({ ...newBook, platforms: currentPlatforms.filter(p => p !== platform) });
    } else {
      setNewBook({ ...newBook, platforms: [...currentPlatforms, platform] });
    }
  };

  const handleSaveBook = async () => {
    if (!newBook.title) {
      alert("El título es obligatorio.");
      return;
    }
    
    if (!isCreatingNewAuthor && !newBook.pseudonymId) {
      alert("Debes seleccionar o crear un autor.");
      return;
    }

    let finalSeriesMap: Record<string, string> = {}; 
    let finalPseudonymId = newBook.pseudonymId;

    if (isCreatingNewSeries && newSeriesName.trim()) {
      const timestamp = Date.now();
      LANGUAGES.forEach((lang, idx) => {
        const s: Series = {
          id: `s-vuelo-${lang.toLowerCase()}-${timestamp}-${idx}`,
          name: `${newSeriesName.trim()} (${lang})`,
          description: `Saga creada al vuelo desde el proyecto: ${newBook.title}`,
          language: lang
        };
        db.addItem('series', s);
        finalSeriesMap[lang] = s.id;
      });
    }

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
          seriesId: isCreatingNewSeries ? finalSeriesMap[lang] : newBook.seriesId,
          pseudonymId: finalPseudonymId,
          imprintId: matchingImprint?.id || currentData.imprints[0]?.id || '1',
          status: 'Sin escribir',
          coverUrl: '' 
        } as Book;

        currentData.books.push(freshBook);

        if (tempCoverUrl && tempCoverUrl.startsWith('data:')) {
           await imageStore.save(bookId, tempCoverUrl);
        }
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
    setIsCreatingNewSeries(false);
    setIsCreatingNewAuthor(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setIsCreatingNewSeries(false);
    setIsCreatingNewAuthor(false);
    setNewSeriesName('');
    setNewAuthorName('');
    setNewBook({ 
      title: '', pseudonymId: '', seriesId: '', seriesOrder: 1, description: '', platforms: ['KDP'], 
      status: 'Sin escribir', kindleUnlimited: false, scheduledDate: '', amazonLink: '', d2dLink: ''
    });
  };

  const filteredBooks = data.books.filter(book => {
    const author = data.pseudonyms.find(p => p.id === book.pseudonymId);
    const series = data.series.find(s => s.id === book.seriesId);
    const searchLow = searchTerm.toLowerCase();
    const matchesSearch = book.title.toLowerCase().includes(searchLow) || 
                          (author?.name.toLowerCase().includes(searchLow)) ||
                          (series?.name.toLowerCase().includes(searchLow)) ||
                          (book.language && book.language.toLowerCase().includes(searchLow));
    const matchesStatus = statusFilter === 'Todos' || book.status === statusFilter;
    return matchesSearch && matchesStatus;
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
            {data.books.length} Proyectos en el sistema
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="w-full lg:w-auto bg-slate-900 text-white px-6 py-3.5 rounded-2xl hover:bg-indigo-600 shadow-xl transition-all active:scale-95 font-black text-[9px] tracking-[0.2em] uppercase">
          <i className="fa-solid fa-plus-circle mr-2"></i> Nuevo Lanzamiento Maestro
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative group">
          <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
          <input 
            type="text" 
            placeholder="Filtrar catálogo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-16 pr-6 text-sm font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {['Todos', ...STATUS_OPTIONS].map(opt => (
            <button 
              key={opt}
              onClick={() => setStatusFilter(opt as any)}
              className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${statusFilter === opt ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* LISTADO */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {filteredBooks.map(book => {
          const author = data.pseudonyms.find(p => p.id === book.pseudonymId);
          const displayCover = covers[book.id] || book.coverUrl;
          
          return (
            <div key={book.id} className="bg-white rounded-[1.5rem] p-3 border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
              <div className="w-12 h-16 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0 shadow-inner flex items-center justify-center border border-slate-100">
                {displayCover ? (
                  <img src={displayCover} className="w-full h-full object-cover" alt={book.title} />
                ) : (
                  <i className="fa-solid fa-book-bookmark text-slate-200"></i>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black text-slate-900 truncate pr-2">{book.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter border ${getStatusStyle(book.status)}`}>
                    {book.status}
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase">{author?.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => openEdit(book)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                  <i className="fa-solid fa-gear"></i>
                </button>
                <button onClick={() => { if(confirm('¿Eliminar?')) { db.deleteItem('books', book.id); refreshData(); } }} className="p-2.5 text-slate-200 hover:text-red-500 transition-colors">
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL LAPTOP-FRIENDLY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 lg:p-10">
          <div className="bg-white rounded-[2rem] max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scaleIn border border-white/10">
            
            {/* Cabecera Fija */}
            <div className="px-6 py-4 border-b border-slate-100 bg-white shrink-0 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                  {editingId ? 'Editor Maestro' : 'Configuración de Lanzamiento'}
                </h2>
                <p className="text-slate-400 font-bold uppercase text-[8px] tracking-[0.3em] mt-1">Atreyu Digital Infrastructure v2.5</p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-300 hover:text-slate-900 transition">
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            
            {/* Cuerpo con Scroll Interno */}
            <div className="overflow-y-auto p-6 lg:p-8 custom-scrollbar bg-slate-50/30">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Columna Izquierda (Portada & Estado) */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Arte HQ</label>
                    <div className="aspect-[3/4] bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center relative group transition-all hover:border-indigo-400 max-w-[180px] mx-auto">
                      {newBook.coverUrl ? (
                        <img src={newBook.coverUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-4 text-slate-300">
                          <i className="fa-solid fa-cloud-arrow-up text-2xl mb-2"></i>
                          <p className="text-[8px] font-black uppercase tracking-widest">Cargar Portada</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>

                  <div className="bg-slate-900 p-5 rounded-2xl shadow-xl space-y-4">
                    <div>
                      <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Canal de Ventas</label>
                      <div className="flex gap-1.5">
                          {['KDP', 'D2D'].map((p) => (
                            <button 
                              key={p}
                              onClick={() => handlePlatformToggle(p as any)}
                              className={`flex-1 py-2.5 rounded-lg text-[8px] font-black uppercase transition-all ${newBook.platforms?.includes(p as any) ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}
                            >
                              {p}
                            </button>
                          ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Workflow</label>
                      <select 
                        value={newBook.status} 
                        onChange={e => setNewBook({...newBook, status: e.target.value as BookStatus})}
                        className="w-full bg-slate-800 border-none rounded-lg p-2.5 text-[9px] font-black text-white uppercase outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {STATUS_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-slate-800 text-xs">{opt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Fecha Estimada</label>
                      <input 
                        type="date" 
                        value={newBook.scheduledDate} 
                        onChange={e => setNewBook({...newBook, scheduledDate: e.target.value})}
                        className="w-full bg-slate-800 border-none rounded-lg p-2 text-[9px] font-black text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Columna Derecha (Datos del Libro) */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Título Global del Proyecto</label>
                    <input type="text" placeholder="Nombre de la obra..." value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 font-bold text-base text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Autor</label>
                        <button onClick={() => setIsCreatingNewAuthor(!isCreatingNewAuthor)} className="text-[7px] font-black uppercase text-indigo-600">
                          {isCreatingNewAuthor ? 'Cerrar' : '+ Nuevo'}
                        </button>
                      </div>
                      {isCreatingNewAuthor ? (
                        <input type="text" placeholder="Nombre..." value={newAuthorName} onChange={e => setNewAuthorName(e.target.value)} className="w-full bg-slate-50 border border-indigo-100 rounded-lg p-2.5 text-xs font-black text-slate-900 outline-none" />
                      ) : (
                        <select value={newBook.pseudonymId} onChange={e => setNewBook({...newBook, pseudonymId: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs font-bold text-slate-900 outline-none">
                          <option value="">Seleccionar autor...</option>
                          {data.pseudonyms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      )}
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Sello</label>
                      <select value={newBook.imprintId} onChange={e => setNewBook({...newBook, imprintId: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs font-bold text-slate-900 outline-none">
                        {data.imprints.map(i => <option key={i.id} value={i.id}>{i.name} ({i.language})</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-orange-50/30 p-3 rounded-xl border border-orange-100">
                        <label className="block text-[8px] font-black text-orange-600 uppercase mb-1.5">Link KDP</label>
                        <input type="text" placeholder="https://..." value={newBook.amazonLink} onChange={e => setNewBook({...newBook, amazonLink: e.target.value})} className="w-full bg-white border border-orange-200 rounded-lg p-2 text-[9px] font-bold text-orange-900 outline-none" />
                    </div>
                    <div className="bg-blue-50/30 p-3 rounded-xl border border-blue-100">
                        <label className="block text-[8px] font-black text-blue-600 uppercase mb-1.5">Link D2D</label>
                        <input type="text" placeholder="https://..." value={newBook.d2dLink} onChange={e => setNewBook({...newBook, d2dLink: e.target.value})} className="w-full bg-white border border-blue-200 rounded-lg p-2 text-[9px] font-bold text-blue-900 outline-none" />
                    </div>
                  </div>

                  <div className="bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100 space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-[9px] font-black text-indigo-700 uppercase">Saga Maestra</label>
                        <button onClick={() => setIsCreatingNewSeries(!isCreatingNewSeries)} className="text-[7px] font-black uppercase text-indigo-600">
                            {isCreatingNewSeries ? 'Existente' : '+ Crear'}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                      <div className="md:col-span-4">
                        {isCreatingNewSeries ? (
                           <input type="text" placeholder="Nombre saga..." value={newSeriesName} onChange={e => setNewSeriesName(e.target.value)} className="w-full bg-white border border-indigo-200 rounded-lg p-2 text-xs font-black text-slate-900 outline-none" />
                        ) : (
                          <select value={newBook.seriesId || ''} onChange={e => setNewBook({...newBook, seriesId: e.target.value})} className="w-full bg-white border border-slate-100 rounded-lg p-2 text-xs font-bold text-slate-900 outline-none">
                            <option value="">Obra Independiente</option>
                            {data.series.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        )}
                      </div>
                      <input type="number" placeholder="Nº" value={newBook.seriesOrder || ''} onChange={e => setNewBook({...newBook, seriesOrder: parseInt(e.target.value) || 1})} className="w-full bg-white border border-slate-100 rounded-lg p-2 text-xs font-black text-center text-slate-900 outline-none" />
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Sinopsis IA</label>
                    <textarea value={newBook.description} onChange={e => setNewBook({...newBook, description: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 h-24 text-xs leading-relaxed text-slate-900 outline-none shadow-inner resize-none" placeholder="Argumento del libro..."></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Pie de Página Fijo */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white shrink-0 flex gap-3">
              <button onClick={closeModal} className="flex-1 py-3 text-slate-400 font-black text-[9px] tracking-[0.2em] uppercase hover:text-slate-900 transition-colors">DESCARTAR</button>
              <button onClick={handleSaveBook} className="flex-[2] py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[9px] tracking-[0.2em] shadow-lg hover:bg-indigo-600 transition-all active:scale-95">
                {editingId ? 'ACTUALIZAR PROYECTO' : 'GUARDAR LANZAMIENTO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksManager;
