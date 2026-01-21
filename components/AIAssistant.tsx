
import React, { useState } from 'react';
import { AppData } from '../types';
import { generateEditorialHelp } from '../geminiService';

interface Props {
  data: AppData;
}

const AIAssistant: React.FC<Props> = ({ data }) => {
  const [selectedBookId, setSelectedBookId] = useState('');
  const [tool, setTool] = useState<'blurb' | 'ads' | 'aplus' | 'translate' | 'summary' | 'thanks'>('blurb');
  const [targetLang, setTargetLang] = useState('Inglés');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    const book = data.books.find(b => b.id === selectedBookId);
    if (!book) {
      alert('Selecciona un libro primero.');
      return;
    }

    const author = data.pseudonyms.find(p => p.id === book.pseudonymId);
    setLoading(true);
    
    let extra: string = '';
    if (tool === 'translate') extra = targetLang;
    if (tool === 'thanks') extra = author?.name || 'Autor';

    const contentToProcess = tool === 'thanks' 
      ? (author?.bio || book.description || '') 
      : (book.description || '');

    try {
      const output = await generateEditorialHelp(tool, book.title, contentToProcess, extra, book.kuStrategy);
      setResult(output || 'No se recibió respuesta de la IA.');
    } catch (err) {
      setResult('Error crítico al procesar con DeepSeek. Revisa la consola para más detalles.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <i className="fa-solid fa-brain text-indigo-500"></i> Laboratorio DeepSeek AI
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-800 mb-4 uppercase text-xs tracking-widest text-slate-400">DeepSeek Chat Engine (V3)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Libro Fuente</label>
                <select 
                  className="w-full border-none rounded-xl bg-slate-50 p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 shadow-inner"
                  value={selectedBookId}
                  onChange={e => setSelectedBookId(e.target.value)}
                >
                  <option value="">Selecciona...</option>
                  {data.books.map(b => (
                    <option key={b.id} value={b.id}>{b.title} {b.kindleUnlimited ? '(KU)' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Herramientas IA</label>
                <div className="grid grid-cols-1 gap-2">
                  <button onClick={() => setTool('summary')} className={`text-left px-4 py-3 rounded-xl border transition ${tool === 'summary' ? 'bg-indigo-600 border-indigo-600 text-white font-bold' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                    <i className="fa-solid fa-bolt mr-2"></i> Pitch de Ventas
                  </button>
                  <button onClick={() => setTool('thanks')} className={`text-left px-4 py-3 rounded-xl border transition ${tool === 'thanks' ? 'bg-indigo-600 border-indigo-600 text-white font-bold' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                    <i className="fa-solid fa-heart mr-2"></i> Agradecimientos
                  </button>
                  <button onClick={() => setTool('blurb')} className={`text-left px-4 py-3 rounded-xl border transition ${tool === 'blurb' ? 'bg-indigo-600 border-indigo-600 text-white font-bold' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                    <i className="fa-solid fa-feather mr-2"></i> Optimizar Blurb
                  </button>
                  <button onClick={() => setTool('translate')} className={`text-left px-4 py-3 rounded-xl border transition ${tool === 'translate' ? 'bg-indigo-600 border-indigo-600 text-white font-bold' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                    <i className="fa-solid fa-globe mr-2"></i> Transcreación
                  </button>
                  <button onClick={() => setTool('ads')} className={`text-left px-4 py-3 rounded-xl border transition ${tool === 'ads' ? 'bg-indigo-600 border-indigo-600 text-white font-bold' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                    <i className="fa-solid fa-bullhorn mr-2"></i> Amazon Ads Copy
                  </button>
                </div>
              </div>

              {tool === 'translate' && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Idioma Meta</label>
                  <select 
                    value={targetLang}
                    onChange={e => setTargetLang(e.target.value)}
                    className="w-full border-none rounded-xl bg-slate-50 p-4 text-sm font-bold text-indigo-600"
                  >
                    <option value="Inglés">Inglés</option>
                    <option value="Alemán">Alemán</option>
                    <option value="Francés">Francés</option>
                    <option value="Italiano">Italiano</option>
                  </select>
                </div>
              )}

              <button 
                onClick={handleGenerate}
                disabled={loading || !selectedBookId}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition active:scale-95 disabled:bg-slate-200 mt-2 uppercase text-xs tracking-widest"
              >
                {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : 'Procesar con DeepSeek'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col min-h-[550px]">
          <div className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col flex-1 border border-slate-800">
            <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex justify-between items-center text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/50"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></span>
                <span className="ml-3 text-[10px] font-mono uppercase tracking-[0.2em]">deepseek_ai_session.out</span>
              </div>
              {result && (
                <button onClick={() => {navigator.clipboard.writeText(result); alert('Copiado');}} className="hover:text-white transition flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <i className="fa-solid fa-copy"></i> Copiar Texto
                </button>
              )}
            </div>
            <div className="p-10 text-slate-300 font-mono text-sm overflow-y-auto flex-1 leading-relaxed bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
              {result ? (
                <div className="whitespace-pre-wrap animate-fadeIn text-emerald-100">{result}</div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10 italic">
                  <i className="fa-solid fa-microchip text-7xl mb-6"></i>
                  <p className="text-xl tracking-tighter text-center">Selecciona un libro y herramienta para comenzar el análisis inteligente con DeepSeek AI.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
