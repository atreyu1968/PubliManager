import React, { useState } from 'react';
import { AppData, Book } from '../types';
import { db } from '../db';

interface Props {
  data: AppData;
  refreshData: () => void;
}

const BooksManager: React.FC<Props> = ({ data, refreshData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
        setNewBook(prev => ({ ...prev, coverUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBook = () => {
    if (newBook.title && newBook.pseudonymId && newBook.imprintId) {
      if (editingId) {
        db.updateItem('books', { ...newBook, id: editingId } as Book);
      } else {
        db.addItem('books', { ...newBook, id: 'b-' + Date.now() } as Book);
      }
      refreshData();
      closeModal();
    }
  };

  const openEdit = (book: Book) => {
    setNewBook(book);
    setEditingId(book.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setNewBook({ 
      title: '', pseudonymId: '', imprintId: '', description: '', shortSummary: '', 
      platforms: ['KDP'], formats: ['Ebook'], price: 0.99, 
      releaseDate: new Date().toISOString().split('T')[0], status: 'Draft',
      kindleUnlimited: false, kuStrategy: false, coverUrl: '',
      amazonLink: '', d2dLink: '', driveFolderUrl: ''
    });
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
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-black text-slate-800 leading-tight line-clamp-1 mb-1">{book.title}</h3>
                <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500">
                  <span>{author?.name || 'Autor desconocido'}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-indigo-600">{imprint?.name}</span>
                </div>

                <div className="mb-6 grid grid-cols-3 gap-2">
                    {book.amazonLink && (
                      <a href={book.amazonLink} target="_blank" className="flex items-center justify-center py-2 bg-amber-500 text-white rounded-lg text-[9px] font-black hover:bg-amber-600 transition"><i className="fa-brands fa-amazon mr-1"></i> KDP</a>
                    )}
                    {book.d2dLink && (
                      <a href={book.d2dLink} target="_blank" className="flex items-center justify-center py-2 bg-indigo-500 text-white rounded-lg text-[9px] font-black hover:bg-indigo-600 transition"><i className="fa-solid fa-link mr-1"></i> D2D</a>
                    )}
                    {book.driveFolderUrl && (
                      <a href={book.driveFolderUrl} target="_blank" className="flex items-center justify-center py-2 bg-emerald-500 text-white rounded-lg text-[9px] font-black hover:bg-emerald-600 transition"><i className="fa-brands fa-google-drive mr-1"></i> DRIVE</a>
                    )}
                </div>

                <div className="mt-auto flex gap-2 border-t border-slate-50 pt-4">
                  <button 
                    onClick={() => openEdit(book)}
                    className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition uppercase tracking-widest"
                  >
                    Editar Ficha
                  </button>
                  <button 
                    onClick={() => { if(confirm('¿Borrar permanentemente?')) { db.deleteItem('books', book.id); refreshData(); } }} 
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
            <h2 className="text-3xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-6">{editingId ? 'Editar Proyecto' : 'Nuevo Proyecto Editorial'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Portada</label>
                  <div className="aspect-[2/3] bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center relative group">
                    {newBook.coverUrl ? (
                      <img src={newBook.coverUrl} className="w-full h-full object-cover" />
                    ) : (
                      <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-200"></i>
                    )}
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Opciones Amazon</label>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>Kindle Unlimited</span>
                    <input type="checkbox" checked={newBook.kindleUnlimited} onChange={e => setNewBook({...newBook, kindleUnlimited: e.target.checked})} />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <input type="text" placeholder="Título" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-lg" />
                <div className="grid grid-cols-2 gap-4">
                  <select value={newBook.pseudonymId} onChange={e => setNewBook({...newBook, pseudonymId: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold">
                    <option value="">Autor...</option>
                    {data.pseudonyms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select value={newBook.imprintId} onChange={e => setNewBook({...newBook, imprintId: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold">
                    <option value="">Sello...</option>
                    {data.imprints.map(i => <option key={i.id} value={i.id}>{i.name} ({i.language})</option>)}
                  </select>
                </div>
                <textarea value={newBook.description} onChange={e => setNewBook({...newBook, description: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 h-32 text-sm" placeholder="Sinopsis completa..."></textarea>
                
                <div className="flex gap-4 pt-4">
                  <button onClick={closeModal} className="flex-1 py-4 text-slate-400 font-bold">CANCELAR</button>
                  <button onClick={handleSaveBook} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest">GUARDAR</button>
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