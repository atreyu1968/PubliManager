import { GoogleGenAI } from "@google/genai";

/**
 * Servicio de Inteligencia Editorial - Motor de Razonamiento Profundo (Deep Reasoning)
 * Optimizado para análisis complejo de metadatos y estrategias de marketing.
 */
export const generateEditorialHelp = async (
  type: 'blurb' | 'ads' | 'aplus' | 'translate' | 'summary' | 'thanks', 
  title: string, 
  description: string,
  extraContext?: string,
  isKU?: boolean
) => {
  // Inicialización segura
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  let prompt = '';
  const kuContext = isKU ? "ESTRATEGIA KINDLE UNLIMITED: Prioriza el gancho inicial y la retención para maximizar páginas leídas (KENP)." : "";
  
  const systemInstruction = `Eres ASD-DEEP-INTELLIGENCE, un sistema de razonamiento profundo de Atreyu Servicios Digitales. 
    Tu función es actuar como un estratega editorial senior para Amazon KDP. 
    Debes utilizar RAZONAMIENTO PROFUNDO (Deep Thinking) para analizar los tropos del género, el SEO de Amazon y la psicología del lector antes de producir cualquier texto. 
    Sé sofisticado, comercialmente agresivo y analíticamente preciso.`;

  switch(type) {
    case 'blurb':
      prompt = `DEEP ANALYSIS & OPTIMIZATION: Libro "${title}". Sinopsis actual: "${description}". ${kuContext} Reestructura para ventas de alta conversión, optimiza palabras clave para A9 de Amazon.`;
      break;
    case 'ads':
      prompt = `AD COPY GENERATION: Genera 5 variantes de copy para Amazon Ads (Headline) del libro "${title}". Basado en: "${description}". Usa gatillos psicológicos específicos.`;
      break;
    case 'translate':
      prompt = `DEEP TRANSCREATION: Traduce y adapta "${title}" y su sinopsis "${description}" al "${extraContext}". No es una traducción literal; es una adaptación cultural profunda de los tropos literarios.`;
      break;
    case 'summary':
      prompt = `SALES CORE EXTRACTION: Destila el núcleo de ventas de "${title}" en un "Elevator Pitch" infalible.`;
      break;
    case 'thanks':
      prompt = `EDITORIAL CREDITS: Genera una sección de agradecimientos profesional para el autor "${extraContext}" basada en su perfil: "${description}".`;
      break;
    default:
      prompt = `Análisis profundo requerido para: "${title}" - "${description}"`;
  }

  try {
    // Activación del presupuesto de pensamiento máximo para emular razonamiento profundo tipo DeepSeek
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.9,
        // El presupuesto máximo de pensamiento permite a la IA realizar un proceso de razonamiento extendido
        thinkingConfig: { thinkingBudget: 32768 } 
      }
    });

    return response.text || "El análisis no produjo resultados.";

  } catch (error: any) {
    console.error("Critical AI Error:", error);
    return `Error en el motor de razonamiento profundo: ${error.message}`;
  }
};