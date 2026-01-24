
import React, { useState } from 'react';
import { AppData, Book, BookStatus, Series, Pseudonym } from '../types';
import { db } from '../db';

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
    kuStrategy: false
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        alert("La imagen es muy grande. Por favor, usa una de menos de 800KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBook(prev => ({ ...prev, coverUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBook = () => {
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
    let updatedData: AppData;

    if (editingId) {
      const index = currentData.books.findIndex(b => b.id === editingId);
      if (index !== -1) {
        currentData.books[index] = { 
          ...newBook, 
          id: editingId,
          pseudonymId: finalPseudonymId
        } as Book;
      }
      updatedData = { ...currentData };
    } else {
      const newBooks: Book[] = LANGUAGES.map((lang, idx) => {
        const matchingImprint = currentData.imprints.find(i => i.language.toLowerCase() === lang.toLowerCase());
        const timestamp = Date.now();
        return { 
          ...newBook, 
          id: `b-${lang.toLowerCase()}-${timestamp}-${idx}`,
          title: `${newBook.title} (${lang})`,
          language: lang,
          seriesId: isCreatingNewSeries ? finalSeriesMap[lang] : newBook.seriesId,
          pseudonymId: finalPseudonymId,
          imprintId: matchingImprint?.id || currentData.imprints[0]?.id || '1',
          status: 'Sin escribir'
        } as Book;
      });
      
      const dataAfterCreations = db.getData(); 
      updatedData = { ...dataAfterCreations, books: [...dataAfterCreations.books, ...newBooks] };
    }

    if (db.saveData(updatedData)) {
      refreshData();
      closeModal();
    }
  };

  const openEdit = (book: Book) => {
    setNewBook(book);
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
      status: 'Sin escribir', kindleUnlimited: false, scheduledDate: '' 
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
            <i className="fa-solid fa-book-journal-whills text-indigo-600"></i>
            Gestión de Catálogo
          </h1>
          <p className="text-sm text-slate-400 font-bold mt-1 uppercase tracking-widest">
            {data.books.length} Obras registradas
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="w-full lg:w-auto bg-slate-900 text-white px-10 py-5 rounded-3xl hover:bg-indigo-600 shadow-2xl transition-all active:scale-95 font-black text-xs tracking-[0.2em] uppercase">
          <i className="fa-solid fa-plus-circle mr-2"></i> Crear Proyecto Maestro
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
          <input 
            type="text" 
            placeholder="Filtrar por título, autor, saga..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-[2rem] py-5 pl-16 pr-6 text-sm font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {['Todos', ...STATUS_OPTIONS].map(opt => (
            <button 
              key={opt}
              onClick={() => setStatusFilter(opt as any)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${statusFilter === opt ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* LISTADO */}
      <div className="space-y-3">
        {filteredBooks.map(book => {
          const author = data.pseudonyms.find(p => p.id === book.pseudonymId);
          const series = data.series.find(s => s.id === book.seriesId);
          return (
            <div key={book.id} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-center gap-6 group">
              <div className="w-16 h-24 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner flex items-center justify-center border border-slate-100">
                {book.coverUrl ? (
                  <img src={book.coverUrl} className="w-full h-full object-cover" alt={book.title} />
                ) : (
                  <i className="fa-solid fa-book-bookmark text-slate-200 text-xl"></i>
                )}
              </div>
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight truncate max-w-md">{book.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(book.status)}`}>
                    {book.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-1.5 text-indigo-600">
                    <i className="fa-solid fa-language text-xs"></i> {book.language || 'Multi'}
                  </div>
                  <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <i className="fa-solid fa-user-pen text-xs"></i> {author?.name || 'Autor'}
                  </div>
                  {series && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                      <div className="flex items-center gap-1.5 text-amber-600">
                        <i className="fa-solid fa-layer-group text-xs"></i> {series.name}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto pt-4 md:pt-0">
                <button onClick={() => openEdit(book)} className="flex-1 md:flex-none px-6 py-3 bg-slate-50 text-slate-900 rounded-xl text-[10px] font-black hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest border border-slate-100">
                  <i className="fa-solid fa-edit mr-1"></i> Gestionar
                </button>
                <button onClick={() => { if(confirm('¿Eliminar ficha?')) { db.deleteItem('books', book.id); refreshData(); } }} className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors hover:bg-red-50 rounded-xl">
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL - CORRECCIÓN DE CONTRASTE CRÍTICA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white rounded-[3rem] p-8 lg:p-12 max-w-5xl w-full shadow-2xl my-auto animate-scaleIn relative text-slate-900">
            <button onClick={closeModal} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition text-2xl">
              <i className="fa-solid fa-times"></i>
            </button>

            <div className="mb-10">
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                {editingId ? 'Editor de Proyecto' : 'Lanzamiento Global'}
              </h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-3">Atreyu Editorial Architecture</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4 space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Arte de Portada</label>
                  <div className="aspect-[2/3] bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center relative group transition-all hover:border-indigo-400">
                    {newBook.coverUrl ? (
                      <img src={newBook.coverUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-6 text-slate-300">
                        <i className="fa-solid fa-cloud-arrow-up text-4xl mb-4"></i>
                        <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Arrastra o pulsa<br/>para subir</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Estado</label>
                    <select 
                      value={newBook.status} 
                      onChange={e => setNewBook({...newBook, status: e.target.value as BookStatus})}
                      className="w-full bg-slate-800 border-none rounded-2xl p-4 text-xs font-black text-white uppercase outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {STATUS_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-slate-800">{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Publicación Programada</label>
                    <input 
                      type="date" 
                      value={newBook.scheduledDate} 
                      onChange={e => setNewBook({...newBook, scheduledDate: e.target.value})}
                      className="w-full bg-slate-800 border-none rounded-2xl p-4 text-xs font-black text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-8 text-slate-900">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Título Maestro</label>
                    <input type="text" placeholder="Escribe el título global..." value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-bold text-xl text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                      <div className="flex justify-between items-center mb-3 px-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Autor / Seudónimo</label>
                        <button onClick={() => setIsCreatingNewAuthor(!isCreatingNewAuthor)} className={`text-[8px] font-black uppercase px-3 py-1 rounded-full border transition-all ${isCreatingNewAuthor ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-indigo-100'}`}>
                          {isCreatingNewAuthor ? 'Seleccionar' : 'Nuevo +'}
                        </button>
                      </div>
                      {isCreatingNewAuthor ? (
                        <input type="text" placeholder="Nombre del autor..." value={newAuthorName} onChange={e => setNewAuthorName(e.target.value)} className="w-full bg-white border border-indigo-100 rounded-xl p-4 text-sm font-black text-slate-900 placeholder:text-slate-200 outline-none animate-fadeIn" />
                      ) : (
                        <select value={newBook.pseudonymId} onChange={e => setNewBook({...newBook, pseudonymId: e.target.value})} className="w-full bg-white border border-slate-100 rounded-xl p-4 text-sm font-bold text-slate-900 outline-none">
                          <option value="">Selecciona...</option>
                          {data.pseudonyms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      )}
                    </div>

                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Sello Base</label>
                      <select value={newBook.imprintId} onChange={e => setNewBook({...newBook, imprintId: e.target.value})} className="w-full bg-white border border-slate-100 rounded-xl p-4 text-sm font-bold text-slate-900 outline-none">
                        {data.imprints.map(i => <option key={i.id} value={i.id}>{i.name} ({i.language})</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="bg-amber-50/50 p-8 rounded-[2.5rem] border border-amber-100 space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <label className="block text-[10px] font-black text-amber-700 uppercase tracking-widest">Saga / Serie</label>
                        <button onClick={() => setIsCreatingNewSeries(!isCreatingNewSeries)} className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full border transition-all ${isCreatingNewSeries ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-amber-600 border-amber-200'}`}>
                            {isCreatingNewSeries ? 'Usar Existente' : 'Nueva Saga +'}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-3">
                        {isCreatingNewSeries ? (
                           <input type="text" placeholder="Nombre de la saga..." value={newSeriesName} onChange={e => setNewSeriesName(e.target.value)} className="w-full bg-white border border-amber-200 rounded-2xl p-5 text-sm font-black text-slate-900 placeholder:text-amber-200 outline-none animate-fadeIn" />
                        ) : (
                          <select value={newBook.seriesId || ''} onChange={e => setNewBook({...newBook, seriesId: e.target.value})} className="w-full bg-white border border-slate-100 rounded-2xl p-5 text-sm font-bold text-slate-900 outline-none">
                            <option value="">Obra Independiente</option>
                            {data.series.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        )}
                      </div>
                      <input type="number" placeholder="Vol." value={newBook.seriesOrder || ''} onChange={e => setNewBook({...newBook, seriesOrder: parseInt(e.target.value) || 1})} className="w-full bg-white border border-slate-100 rounded-2xl p-5 text-sm font-black text-slate-900 outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Sinopsis Maestra</label>
                    <textarea value={newBook.description} onChange={e => setNewBook({...newBook, description: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-6 h-44 text-sm leading-relaxed text-slate-900 placeholder:text-slate-300 outline-none shadow-inner" placeholder="Escribe aquí la sinopsis global del proyecto..."></textarea>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-8 border-t border-slate-100">
                  <button onClick={closeModal} className="flex-1 py-5 text-slate-400 font-black text-[11px] tracking-[0.4em] uppercase hover:text-slate-900 transition-colors">DESCARTAR</button>
                  <button onClick={handleSaveBook} className="flex-[2] py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.4em] shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                    {editingId ? 'GUARDAR CAMBIOS' : 'EJECUTAR LANZAMIENTO'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksManager;
