
import React, { useState } from 'react';
import { AppData, Book, Platform, BookFormat, Task } from '../types';
import { db } from '../db';

interface Props {
  data: AppData;
  refreshData: () => void;
}

const BooksManager: React.FC<Props> = ({ data, refreshData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBook, setNewBook] = useState<Partial<Book>>({
    title: '',
    pseudonymId: '',
    imprintId: '',
    seriesId: '',
    seriesOrder: 1,
    description: '',
    shortSummary: '',
    platforms: ['KDP'],
    formats: ['Ebook'],
    price: 0.99,
    releaseDate: new Date().toISOString().split('T')[0],
    status: 'Draft',
    coverUrl: '',
    amazonLink: '',
    d2dLink: '',
    driveFolderUrl: '',
    kindleUnlimited: false,
    kuStrategy: false
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBook({ ...newBook, coverUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBook = () => {
    if (newBook.title && newBook.pseudonymId && newBook.imprintId) {
      const bookId = 'b-' + Date.now();
      db.addItem('books', { ...newBook, id: bookId } as Book);
      refreshData();
      setIsModalOpen(false);
      setNewBook({ 
        title: '', pseudonymId: '', imprintId: '', description: '', shortSummary: '', 
        platforms: ['KDP'], formats: ['Ebook'], price: 0.99, 
        releaseDate: new Date().toISOString().split('T')[0], status: 'Draft',
        kindleUnlimited: false, kuStrategy: false, coverUrl: '',
        amazonLink: '', d2dLink: '', driveFolderUrl: ''
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Catálogo de Obras</h1>
          <p className="text-sm text-slate-500 font-medium">Gestiona portadas, enlaces y recursos de producción.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95">
          <i className="fa-solid fa-plus"></i> Nuevo Proyecto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {data.books.map(book => {
          const imprint = data.imprints.find(i => i.id === book.imprintId);
          const author = data.pseudonyms.find(p => p.id === book.pseudonymId);
          
          return (
            <div key={book.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 group flex flex-col h-full relative">
              {book.kindleUnlimited && (
                <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-amber-400 to-amber-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 border border-white/20">
                  <i className="fa-solid fa-bolt-lightning"></i> KU
                </div>
              )}

              <div className="relative h-48 bg-slate-200 overflow-hidden">
                {book.coverUrl ? (
                  <img src={book.coverUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={book.title} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                    <i className="fa-solid fa-image text-4xl mb-2"></i>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Sin Portada</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider backdrop-blur-md ${book.status === 'Published' ? 'bg-emerald-500/80 text-white' : 'bg-amber-500/80 text-white'}`}>
                    {book.status}
                  </span>
                  <span className="bg-slate-900/60 backdrop-blur-md text-white text-[9px] px-2 py-1 rounded-lg font-bold">
                    {imprint?.language}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-black text-slate-800 leading-tight line-clamp-1 flex-1">{book.title}</h3>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  {author?.photoUrl && (
                    <img src={author.photoUrl} className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-100" />
                  )}
                  <span className="text-xs font-bold text-slate-500">{author?.name}</span>
                  {book.kuStrategy && (
                    <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Estrat. KU</span>
                  )}
                </div>

                {book.shortSummary && (
                  <div className="bg-indigo-50/50 p-3 rounded-xl mb-4 border border-indigo-100/50">
                    <p className="text-[11px] text-indigo-700 leading-tight italic line-clamp-2">"{book.shortSummary}"</p>
                  </div>
                )}

                {/* Accesos Rápidos a URLs */}
                <div className="mb-6 space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Enlaces y Recursos</p>
                  <div className="flex flex-wrap gap-2">
                    {book.amazonLink && (
                      <a 
                        href={book.amazonLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 text-white rounded-xl text-[10px] font-black hover:bg-amber-600 transition shadow-sm hover:shadow-md"
                      >
                        <i className="fa-brands fa-amazon text-sm"></i> KDP
                      </a>
                    )}
                    {book.d2dLink && (
                      <a 
                        href={book.d2dLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-500 text-white rounded-xl text-[10px] font-black hover:bg-indigo-600 transition shadow-sm hover:shadow-md"
                      >
                        <i className="fa-solid fa-link text-sm"></i> D2D
                      </a>
                    )}
                    {book.driveFolderUrl && (
                      <a 
                        href={book.driveFolderUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black hover:bg-emerald-600 transition shadow-sm hover:shadow-md"
                      >
                        <i className="fa-brands fa-google-drive text-sm"></i> DRIVE
                      </a>
                    )}
                    {/* Botón placeholder si no hay enlaces */}
                    {!book.amazonLink && !book.d2dLink && !book.driveFolderUrl && (
                      <div className="w-full py-2.5 bg-slate-50 text-slate-300 rounded-xl text-[9px] font-bold text-center border border-dashed border-slate-200">
                        SIN ENLACES CONFIGURADOS
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-auto flex gap-2 border-t border-slate-50 pt-4">
                  <button className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition uppercase tracking-widest">
                    Editar Ficha
                  </button>
                  <button 
                    onClick={() => { if(confirm('¿Deseas eliminar permanentemente esta obra?')) { db.deleteItem('books', book.id); refreshData(); } }} 
                    className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 transition hover:bg-red-50 rounded-xl"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-fadeIn border border-white/20">
            <h2 className="text-3xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-6">Proyecto Editorial</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subir Portada</label>
                  <div className="aspect-[2/3] bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center relative group">
                    {newBook.coverUrl ? (
                      <img src={newBook.coverUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-200 mb-2"></i>
                        <span className="text-[10px] text-slate-300 font-bold">JPG/PNG</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-2 rounded-xl text-[10px] font-bold text-center text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      Haga clic para subir
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-2xl space-y-3 shadow-inner border border-slate-100">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Configuración Amazon</label>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">En Kindle Unlimited</span>
                    <button 
                      onClick={() => setNewBook({...newBook, kindleUnlimited: !newBook.kindleUnlimited})}
                      className={`w-10 h-5 rounded-full transition-all relative ${newBook.kindleUnlimited ? 'bg-amber-500' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${newBook.kindleUnlimited ? 'left-6' : 'left-1'}`}></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Estrategia KU</span>
                    <button 
                      onClick={() => setNewBook({...newBook, kuStrategy: !newBook.kuStrategy})}
                      className={`w-10 h-5 rounded-full transition-all relative ${newBook.kuStrategy ? 'bg-indigo-500' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${newBook.kuStrategy ? 'left-6' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <i className="fa-brands fa-amazon absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                    <input type="text" placeholder="URL Amazon" className="w-full bg-slate-50 border-none rounded-xl p-3 pl-8 text-xs focus:ring-1 focus:ring-amber-500" value={newBook.amazonLink} onChange={e => setNewBook({...newBook, amazonLink: e.target.value})} />
                  </div>
                  <div className="relative">
                    <i className="fa-solid fa-link absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                    <input type="text" placeholder="URL D2D" className="w-full bg-slate-50 border-none rounded-xl p-3 pl-8 text-xs focus:ring-1 focus:ring-indigo-500" value={newBook.d2dLink} onChange={e => setNewBook({...newBook, d2dLink: e.target.value})} />
                  </div>
                  <div className="relative">
                    <i className="fa-brands fa-google-drive absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                    <input type="text" placeholder="Carpeta Drive" className="w-full bg-slate-50 border-none rounded-xl p-3 pl-8 text-xs focus:ring-1 focus:ring-emerald-500" value={newBook.driveFolderUrl} onChange={e => setNewBook({...newBook, driveFolderUrl: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-5">
                <input type="text" placeholder="Título de la Obra" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800 text-lg shadow-inner" />
                
                <div className="grid grid-cols-2 gap-4">
                  <select value={newBook.pseudonymId} onChange={e => setNewBook({...newBook, pseudonymId: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold">
                    <option value="">Autor...</option>
                    {data.pseudonyms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select value={newBook.imprintId} onChange={e => setNewBook({...newBook, imprintId: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-indigo-600">
                    <option value="">Sello e Idioma...</option>
                    {data.imprints.map(i => <option key={i.id} value={i.id}>{i.name} ({i.language})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Resumen Corto (Punchy Summary)</label>
                  <input type="text" value={newBook.shortSummary} onChange={e => setNewBook({...newBook, shortSummary: e.target.value})} className="w-full bg-indigo-50 border-none rounded-2xl p-4 text-sm font-medium text-indigo-900 italic" placeholder="Una frase que venda el libro..." />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Sinopsis Completa</label>
                  <textarea value={newBook.description} onChange={e => setNewBook({...newBook, description: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 h-32 text-sm" placeholder="Blurb completo..."></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600 transition">CANCELAR</button>
                  <button onClick={handleAddBook} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:scale-[1.02] transition-transform uppercase text-xs tracking-widest">GUARDAR</button>
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
