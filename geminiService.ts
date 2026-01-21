
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateEditorialHelp = async (
  type: 'blurb' | 'ads' | 'aplus' | 'translate' | 'summary' | 'thanks', 
  title: string, 
  description: string,
  extraContext?: string,
  isKU?: boolean // Nuevo parámetro
) => {
  let prompt = '';
  const kuContext = isKU ? "Este libro es para Kindle Unlimited. Enfócate en ganchos rápidos, tropos claros del género y una promesa de gratificación inmediata para maximizar las páginas leídas." : "";
  
  if (type === 'blurb') {
    prompt = `Como experto SEO en KDP, mejora este blurb para el libro "${title}": "${description}". ${kuContext} Hazlo persuasivo y usa copywriting de alto impacto.`;
  } else if (type === 'ads') {
    prompt = `Genera 5 variantes de titulares cortos para Amazon Ads del libro "${title}" basándote en: "${description}". ${isKU ? "Usa frases que funcionen bien en KU." : ""}`;
  } else if (type === 'aplus') {
    prompt = `Sugiere 3 módulos de "A+ Content" para el libro "${title}" basándote en: "${description}". ${isKU ? "Destaca que está disponible en Kindle Unlimited." : ""}`;
  } else if (type === 'translate') {
    prompt = `Localiza y adapta el título "${title}" y blurb "${description}" al idioma ${extraContext}. Transcreación para ventas. ${isKU ? "Asegúrate de mantener los tropos del género para KU." : ""}`;
  } else if (type === 'summary') {
    prompt = `Destila esta sinopsis en un resumen impactante de máximo 2 frases (Pitch) para el libro "${title}": "${description}". ${kuContext}`;
  } else if (type === 'thanks') {
    prompt = `Escribe un texto de agradecimientos profesional y cálido para el autor "${extraContext}" (Bio: ${description}). El texto debe ser apto para incluir al final de su libro "${title}".`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error al generar contenido.";
  }
};
