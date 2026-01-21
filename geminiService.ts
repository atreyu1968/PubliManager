import { GoogleGenAI } from "@google/genai";

// Fix: Property 'env' does not exist on type 'ImportMeta'. Replacing with process.env.API_KEY and migrating to Gemini API.
export const generateEditorialHelp = async (
  type: 'blurb' | 'ads' | 'aplus' | 'translate' | 'summary' | 'thanks', 
  title: string, 
  description: string,
  extraContext?: string,
  isKU?: boolean
) => {
  // Always use process.env.API_KEY as per guidelines for initializing the @google/genai client instance
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let prompt = '';
  const kuContext = isKU ? "Este libro es para Kindle Unlimited. Enfócate en ganchos rápidos, tropos claros del género y una promesa de gratificación inmediata." : "";
  
  if (type === 'blurb') {
    prompt = `Como experto SEO en KDP, mejora este blurb para el libro "${title}": "${description}". ${kuContext} Hazlo persuasivo y usa copywriting de alto impacto.`;
  } else if (type === 'ads') {
    prompt = `Genera 5 variantes de titulares cortos para Amazon Ads del libro "${title}" basándote en: "${description}". ${isKU ? "Usa frases que funcionen bien en KU." : ""}`;
  } else if (type === 'aplus') {
    prompt = `Sugiere 3 módulos de "A+ Content" para el libro "${title}" basándote en: "${description}". ${isKU ? "Destaca que está disponible en Kindle Unlimited." : ""}`;
  } else if (type === 'translate') {
    prompt = `Localiza y adapta el título "${title}" y blurb "${description}" al idioma ${extraContext}. Transcreación para ventas. ${isKU ? "Mantén los tropos del género para KU." : ""}`;
  } else if (type === 'summary') {
    prompt = `Destila esta sinopsis en un resumen impactante de máximo 2 frases (Pitch) para el libro "${title}": "${description}". ${kuContext}`;
  } else if (type === 'thanks') {
    prompt = `Escribe un texto de agradecimientos profesional y cálido para el autor "${extraContext}" (Bio: ${description}). Libro: "${title}".`;
  }

  try {
    // Basic Text Tasks: Use 'gemini-3-flash-preview' for summarization and marketing copy.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Eres un consultor experto en marketing editorial para Amazon KDP y Draft2Digital.",
      },
    });

    // Directly access the .text property on the GenerateContentResponse object.
    return response.text || "No se pudo generar una respuesta.";

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return `Error: ${error.message}.`;
  }
};