
import React, { useState } from 'react';
import { AppData, Book, SaleRecord } from '../types';
import { db } from '../db';

interface Props {
  data: AppData;
  refreshData: () => void;
}

const ImportManager: React.FC<Props> = ({ data, refreshData }) => {
  const [rawText, setRawText] = useState('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processInput = () => {
    if (!rawText.trim()) return;
    
    const lines = rawText.trim().split('\n');
    const delimiter = rawText.includes('\t') ? '\t' : ',';
    
    const results = lines.map(line => {
      const parts = line.split(delimiter).map(p => p.trim());
      // Esperamos: [Título] [Mes] [Año] [Unidades] [KENP] [Regalías] [Moneda] [ASIN]
      return {
        title: parts[0] || 'Sin título',
        month: parseInt(parts[1]) || new Date().getMonth() + 1,
        year: parseInt(parts[2]) || new Date().getFullYear(),
        units: parseInt(parts[3]) || 0,
        kenpc: parseInt(parts[4]) || 0,
        revenue: parseFloat(parts[5]?.replace(',', '.')) || 0,
        currency: parts[6] || 'EUR',
        asin: parts[7] || '',
        platform: 'KDP' as const
      };
    });

    setPreviewData(results);
  };

  const confirmImport = async () => {
    setIsProcessing(true);
    let currentData = db.getData();
    let importedCount = 0;
    let newBooksCount = 0;

    for (const item of previewData) {
      // 1. Buscar o Crear Libro (Priorizar por ASIN si existe)
      let book = currentData.books.find(b => 
        (item.asin && b.asin === item.asin) || 
        (b.title.toLowerCase() === item.title.toLowerCase())
      );
      
      if (!book) {
        const bookId = `b-imported-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const newBook: Book = {
          id: bookId,
          title: item.title,
          asin: item.asin,
          pseudonymId: currentData.pseudonyms[0]?.id || 'p1',
          imprintId: currentData.imprints[0]?.id || '1',
          description: 'Importado automáticamente via Amazon Sync.',
          platforms: ['KDP'],
          formats: ['Ebook'],
          price: 0,
          releaseDate: new Date().toISOString(),
          status: 'Publicado',
          kindleUnlimited: item.kenpc > 0,
          kuStrategy: false
        };
        currentData.books.push(newBook);
        book = newBook;
        newBooksCount++;
        currentData = db.logAction(bookId, item.title, 'Creación', 'Libro creado automáticamente durante importación.', currentData);
      } else if (item.asin && !book.asin) {
        // Actualizar ASIN si el libro ya existía pero no lo tenía
        book.asin = item.asin;
      }

      // 2. Verificar duplicado de venta
      const duplicate = currentData.sales.find(s => 
        s.bookId === book?.id && 
        s.month === item.month && 
        s.year === item.year && 
        s.platform === item.platform &&
        s.currency === item.currency
      );

      if (!duplicate) {
        const saleId = `sale-imp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        currentData.sales.push({
          id: saleId,
          bookId: book.id,
          month: item.month,
          year: item.year,
          units: item.units,
          kenpc: item.kenpc,
          revenue: item.revenue,
          currency: item.currency,
          platform: item.platform
        });
        importedCount++;
      }
    }

    db.saveData(currentData);
    refreshData();
    setIsProcessing(false);
    alert(`Importación finalizada.\n- Registros de venta nuevos: ${importedCount}\n- Libros creados: ${newBooksCount}`);
    setPreviewData([]);
    setRawText('');
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      {/* HEADER ESTANDARIZADO */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
            <i className="fa-solid fa-file-import text-2xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Ingesta de Datos</h1>
            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">Sincronización masiva con ASIN y multidivisa</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
             <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Motor v3.0 Activo</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-paste text-indigo-500"></i> Entrada de Datos
          </h2>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
            Copia y pega desde tu Excel o Amazon KDP. Orden de columnas:<br/>
            <span className="font-bold text-indigo-600 text-[10px]">[Título] [Mes] [Año] [Uds] [KENP] [Regalías] [Moneda] [ASIN]</span>
          </p>
          <textarea 
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className="w-full h-64 bg-slate-50 border border-slate-100 rounded-3xl p-6 font-mono text-[10px] outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-inner"
            placeholder="Pega aquí los datos..."
          />
          <button 
            onClick={processInput}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95"
          >
            Previsualizar Importación
          </button>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
            <i className="fa-solid fa-magnifying-glass-chart text-indigo-500"></i> Verificación de Ingesta
          </h2>
          
          <div className="flex-1 overflow-y-auto max-h-[400px] mb-6 border border-slate-50 rounded-2xl">
             {previewData.length > 0 ? (
               <table className="w-full text-left">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-100">
                    <tr className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-4 py-3">ASIN / Obra</th>
                      <th className="px-4 py-3 text-center">Periodo</th>
                      <th className="px-4 py-3 text-right">Regalías</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {previewData.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                           <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">{item.asin || 'Sin ASIN'}</div>
                           <div className="text-[10px] font-bold text-slate-700 truncate max-w-[150px]">{item.title}</div>
                        </td>
                        <td className="px-4 py-3 text-center text-[9px] font-black text-slate-400 uppercase">{item.month}/{item.year}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-[10px] font-black text-emerald-600">{item.revenue} {item.currency}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             ) : (
               <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                  <i className="fa-solid fa-table text-4xl mb-4"></i>
                  <p className="text-[9px] font-black uppercase tracking-widest">Sin datos para procesar</p>
               </div>
             )}
          </div>

          <button 
            onClick={confirmImport}
            disabled={previewData.length === 0 || isProcessing}
            className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-100 disabled:opacity-20 transition-all active:scale-95"
          >
            {isProcessing ? <i className="fa-solid fa-sync animate-spin"></i> : 'Confirmar e Integrar en Base de Datos'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportManager;
