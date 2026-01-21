import { GoogleGenAI } from "@google/genai";

/**
 * Servicio de Inteligencia Editorial - Motor de Razonamiento Profundo
 * Utiliza exclusivamente el entorno pre-configurado para acceso seguro.
 */
export const generateEditorialHelp = async (
  type: 'blurb' | 'ads' | 'aplus' | 'translate' | 'summary' | 'thanks', 
  title: string, 
  description: string,
  extraContext?: string,
  isKU?: boolean
) => {
  // Inicialización directa según directrices (apiKey desde process.env.API_KEY)
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  let prompt = '';
  const kuContext = isKU ? "ESTRATEGIA KINDLE UNLIMITED: Maximiza el hook inicial y el 'read-through'." : "";
  
  const systemInstruction = `Eres un Senior Editorial Strategist de Atreyu Servicios Digitales. 
    Tu objetivo es realizar un análisis profundo (Deep Analysis) y producir textos de altísimo impacto comercial para Amazon KDP. 
    Eres analítico, directo y usas técnicas de copywriting de élite.`;

  switch(type) {
    case 'blurb':
      prompt = `ANÁLISIS DE BLURB: Mejora la conversión del libro "${title}". Original: "${description}". ${kuContext} Reestructura para SEO y engagement emocional.`;
      break;
    case 'ads':
      prompt = `CAMPAÑA ADS: Genera 5 copys de alto CTR para Amazon Ads del libro "${title}". Basado en: "${description}".`;
      break;
    case 'translate':
      prompt = `TRANSCREACIÓN PROFUNDA: Adapta "${title}" y su sinopsis "${description}" al ${extraContext}. No traduzcas literalmente, adapta los tropos culturales.`;
      break;
    case 'summary':
      prompt = `SALES PITCH: Destila "${title}" en un "Elevator Pitch" de 2 frases basado en: "${description}".`;
      break;
    case 'thanks':
      prompt = `CREDITS & THANKS: Redacta agradecimientos para el autor "${extraContext}" (Bio: ${description}) del libro "${title}".`;
      break;
    default:
      prompt = `Analiza este proyecto editorial: "${title}" - "${description}"`;
  }

  try {
    // Usamos gemini-3-pro-preview para máxima capacidad de razonamiento editorial
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
        thinkingConfig: { thinkingBudget: 4000 } // Activamos el presupuesto de pensamiento para análisis profundo
      }
    });

    return response.text || "Análisis completado sin respuesta textual.";

  } catch (error: any) {
    console.error("Editorial AI Error:", error);
    if (error.message?.includes("entity was not found")) {
      return "Error: Acceso al modelo restringido. Contacte con soporte técnico.";
    }
    return `Error en el análisis profundo: ${error.message}`;
  }
};