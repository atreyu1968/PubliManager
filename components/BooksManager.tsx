
import React, { useState, useEffect } from 'react';
import { AppData, Book, BookStatus, Series, Pseudonym, Platform, Imprint, BookFormat } from '../types';
import { db } from '../db';
import { imageStore } from '../imageStore';

interface Props {
  data: AppData;
  refreshData: () => void;
}

const LANGUAGES = ['Español', 'Inglés', 'Italiano', 'Portugués', 'Alemán', 'Francés', 'Catalán'];
const STATUS_OPTIONS: BookStatus[] = ['Sin escribir', 'Sin editar', 'Preparado', 'Publicado'];
const FORMAT_OPTIONS: BookFormat[] = ['Ebook', 'Papel', 'Dura', 'Audio'];

const BooksManager: React.FC<Props> = ({ data, refreshData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookStatus | 'Todos'>('Todos');
  const [langFilter, setLangFilter] = useState<string>(data.settings.defaultLanguage || 'Todos');
  const [formatFilter, setFormatFilter] = useState<BookFormat | 'Todos'>('Ebook');
  const [authorFilter, setAuthorFilter] = useState<string>('Todos');
  const [urlFilter, setUrlFilter] = useState<'Todos' | 'Con Landing' | 'Sin Landing'>('Todos');
  const [covers, setCovers] = useState<Record<string, string>>({});
  
  const [launchType, setLaunchType] = useState<'master' | 'single'>('master');
  
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
    d2dLink: '',
    landingUrl: '',
    asin: '',
    driveFolderUrl: ''
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

  const toggleFormat = (format: BookFormat) => {
    const currentFormats = newBook.formats || [];
    if (currentFormats.includes(format)) {
      setNewBook({ ...newBook, formats: currentFormats.filter(f => f !== format) });
    } else {
      setNewBook({ ...newBook, formats: [...currentFormats, format] });
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
        bio: 'Biografía generada automáticamente.',
      };
      await db.addItem('pseudonyms', newAuthor);
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
          pseudonymId: finalPseudonymId || oldBook.pseudonymId,
          coverUrl: '' 
        } as Book;
        
        currentData.books[index] = bookToSave;
        
        if (tempCoverUrl) {
           await imageStore.save(editingId, tempCoverUrl);
        }

        db.logAction(editingId, bookToSave.title, oldBook.status !== bookToSave.status ? 'Cambio de Estado' : 'Modificación', `Actualización de metadatos.`);
      }
      await db.saveData(currentData);
    } else {
      const timestamp = Date.now();
      const targetLangs = launchType === 'master' ? LANGUAGES : [data.settings.defaultLanguage];
      
      for (let idx = 0; idx < targetLangs.length; idx++) {
        const lang = targetLangs[idx];
        const matchingImprint = currentData.imprints.find(i => i.language.toLowerCase() === lang.toLowerCase());
        const bookId = `b-${lang.toLowerCase()}-${timestamp}-${idx}`;
        
        const freshBook = { 
          ...newBook, 
          id: bookId,
          title: launchType === 'master' ? `${newBook.title} (${lang})` : newBook.title,
          language: lang,
          pseudonymId: finalPseudonymId,
          imprintId: matchingImprint?.id || currentData.imprints[0]?.id || '1',
          status: 'Sin escribir',
          coverUrl: '' 
        } as Book;

        currentData.books.push(freshBook);

        if (tempCoverUrl) {
           await imageStore.save(bookId, tempCoverUrl);
        }
        db.logAction(bookId, freshBook.title, 'Creación', `Nuevo proyecto iniciado para el idioma ${lang}.`);
      }
      await db.saveData(currentData);
    }

    refreshData();
    closeModal();
  };

  const openEdit = async (book: Book) => {
    const fullCover = await imageStore.get(book.id);
    setNewBook({ ...book, coverUrl: fullCover || book.coverUrl || '' });
    setEditingId(book.id);
    setIsCreatingNewAuthor(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setIsCreatingNewAuthor(false);
    setNewAuthorName('');
    setLaunchType('master');
    setNewBook({ 
      title: '', pseudonymId: '', seriesId: '', seriesOrder: 1, description: '', platforms: ['KDP'], 
      formats: ['Ebook'], status: 'Sin escribir', kindleUnlimited: false, scheduledDate: '', amazonLink: '', d2dLink: '', landingUrl: '', asin: '', driveFolderUrl: '', price: 0.99
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
    const matchesLang = langFilter === 'Todos' || book.language === langFilter;
    const matchesAuthor = authorFilter === 'Todos' || book.pseudonymId === authorFilter;
    const matchesFormat = formatFilter === 'Todos' || (book.formats && book.formats.includes(formatFilter as BookFormat));
    const hasLanding = !!book.landingUrl;
    const matchesUrl = urlFilter === 'Todos' || (urlFilter === 'Con Landing' ? hasLanding : !hasLanding);

    return matchesSearch && matchesStatus && matchesLang && matchesAuthor && matchesFormat && matchesUrl;
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
      {/* HEADER */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
            <i className="fa-solid fa-book-journal-whills text-2xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Catálogo Maestro</h1>
            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">
              Control de obras y Landings Privadas ASD
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-4 rounded-2xl hover:bg-indigo-600 shadow-xl transition-all active:scale-95 font-black text-[10px] tracking-[0.2em] uppercase">
            <i className="fa-solid fa-plus-circle mr-2"></i> Crear Proyecto
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
        <div className="relative group">
          <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
          <input 
            type="text" 
            placeholder="Buscar por título, autor o ASIN..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-16 pr-6 text-sm font-bold text-slate-700 shadow-inner focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <select value={formatFilter} onChange={e => setFormatFilter(e.target.value as any)} className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-indigo-600 outline-none">
            <option value="Todos">Formato: Todos</option>
            {FORMAT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select value={langFilter} onChange={e => setLangFilter(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-slate-600 outline-none">
            <option value="Todos">Idioma: Todos</option>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-slate-600 outline-none">
            <option value="Todos">Estado: Todos</option>
            {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <select value={authorFilter} onChange={(e) => setAuthorFilter(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-slate-600 outline-none">
            <option value="Todos">Autor: Todos</option>
            {data.pseudonyms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={urlFilter} onChange={(e) => setUrlFilter(e.target.value as any)} className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-emerald-600 outline-none">
            <option value="Todos">Landing Privada: Todos</option>
            <option value="Con Landing">Con Landing</option>
            <option value="Sin Landing">Sin Landing</option>
          </select>
        </div>
      </div>

      {/* LISTADO */}
      <div className={isListView ? "space-y-4" : "grid grid-cols-1 xl:grid-cols-2 gap-6"}>
        {filteredBooks.length > 0 ? (
          filteredBooks.map(book => {
            const author = data.pseudonyms.find(p => p.id === book.pseudonymId);
            const series = data.series.find(s => s.id === book.seriesId);
            const displayCover = covers[book.id] || book.coverUrl;
            
            return (
              <div key={book.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex items-start gap-6 p-6 group relative overflow-hidden text-left">
                <div className="w-24 h-36 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner flex items-center justify-center border border-slate-100 relative">
                  {displayCover ? (
                    <img src={displayCover} className="w-full h-full object-cover" alt={book.title} />
                  ) : (
                    <i className="fa-solid fa-book-bookmark text-slate-200 text-2xl"></i>
                  )}
                  {book.kindleUnlimited && (
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-lg uppercase">KU</div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border ${getStatusStyle(book.status)}`}>
                      {book.status}
                    </span>
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{book.language}</span>
                    {book.asin && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-[7px] font-black uppercase tracking-widest">
                        ASIN: {book.asin}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-black text-slate-900 truncate pr-10 leading-none mb-1 group-hover:text-indigo-600 transition-colors">{book.title}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{author?.name || 'Autor desconocido'}</p>
                  
                  {series && (
                    <div className="flex items-center gap-2 mb-2 bg-amber-50/50 px-2 py-1 rounded-lg w-fit border border-amber-100">
                      <i className="fa-solid fa-layer-group text-[9px] text-amber-500"></i>
                      <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">
                        {series.name} #{book.seriesOrder || 1}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-1 mb-3">
                    {book.formats?.includes('Ebook') && <span title="Ebook Disponible" className="w-5 h-5 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-md text-[10px]"><i className="fa-solid fa-tablet-screen-button"></i></span>}
                    {book.formats?.includes('Papel') && <span title="Tapa Blanda Disponible" className="w-5 h-5 flex items-center justify-center bg-blue-50 text-blue-600 rounded-md text-[10px]"><i className="fa-solid fa-book"></i></span>}
                    {book.formats?.includes('Audio') && <span title="Audiolibro Disponible" className="w-5 h-5 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-md text-[10px]"><i className="fa-solid fa-headphones"></i></span>}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4">
                    {book.price > 0 && (
                      <div className="flex items-center gap-1.5">
                        <i className="fa-solid fa-tag text-[10px] text-slate-300"></i>
                        <span className="text-[11px] font-black text-slate-700">{book.price.toFixed(2)}€</span>
                      </div>
                    )}
                    <div className="h-4 w-[1px] bg-slate-100"></div>
                    <div className="flex items-center gap-3">
                      {book.amazonLink && (
                        <a href={book.amazonLink} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all">
                          <i className="fa-brands fa-amazon text-[10px]"></i>
                        </a>
                      )}
                      {book.landingUrl && (
                        <a href={book.landingUrl} target="_blank" rel="noopener noreferrer" title="Landing Privada" className="w-8 h-8 rounded-lg bg-indigo-900 text-white flex items-center justify-center hover:bg-[#1CB5B1] transition-all">
                          <i className="fa-solid fa-globe text-[10px]"></i>
                        </a>
                      )}
                      {book.driveFolderUrl && (
                        <a href={book.driveFolderUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all">
                          <i className="fa-brands fa-google-drive text-[10px]"></i>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button onClick={() => openEdit(book)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                    <i className="fa-solid fa-edit text-xs"></i>
                  </button>
                  <button onClick={() => { if(confirm('¿Eliminar?')) { db.deleteItem('books', book.id); refreshData(); } }} className="w-10 h-10 text-slate-200 hover:text-red-500 transition-colors">
                    <i className="fa-solid fa-trash-can text-xs"></i>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center opacity-30">
             <i className="fa-solid fa-filter-circle-xmark text-4xl mb-4 text-slate-300"></i>
             <p className="text-xs font-black uppercase tracking-widest">No hay libros que coincidan con los filtros</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 lg:p-10">
          <div className="bg-white rounded-[3rem] max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleIn border border-white/10">
            <div className="px-10 py-6 border-b border-slate-100 bg-white shrink-0 flex justify-between items-center z-10">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                {editingId ? 'Editor de Metadatos' : 'Nuevo Proyecto Editorial'}
              </h2>
              <button onClick={closeModal} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-300 transition-all">
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="overflow-y-auto p-10 custom-scrollbar bg-slate-50/20 flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 space-y-8">
                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                    <div className="aspect-[3/4] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center relative group transition-all hover:border-indigo-400 max-w-[240px] mx-auto shadow-inner">
                      {newBook.coverUrl ? (
                        <img src={newBook.coverUrl} className="w-full h-full object-cover" alt="Portada" />
                      ) : (
                        <i className="fa-solid fa-cloud-arrow-up text-4xl text-slate-200"></i>
                      )}
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-8 text-left">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Título de la Obra</label>
                    <input type="text" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-black text-xl text-slate-900 outline-none" />
                  </div>
                  {/* ... Resto de campos del formulario ... */}
                </div>
              </div>
            </div>

            <div className="px-10 py-6 border-t border-slate-100 bg-white flex flex-col md:flex-row gap-4 items-center shrink-0">
              <button onClick={closeModal} className="w-full md:w-auto px-8 py-4 text-slate-400 font-black text-[10px] tracking-[0.3em] uppercase">DESCARTAR</button>
              <div className="flex-1"></div>
              <button onClick={handleSaveBook} className="w-full md:w-auto bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl">
                {editingId ? 'GUARDAR CAMBIOS' : `CREAR PROYECTO`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksManager;
