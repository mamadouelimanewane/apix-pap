// Intégration Tesseract.js pour OCR avancée
// Usage: npm install tesseract.js
// ou via CDN: <script src="https://cdn.jsdelivr.net/npm/tesseract.js@5"></script>

let Tesseract = null;

// Charger Tesseract dynamiquement
export const loadTesseract = async () => {
  if (Tesseract) return Tesseract;

  try {
    // Essayer import module
    const module = await import('tesseract.js');
    Tesseract = module.default;
    return Tesseract;
  } catch (e) {
    console.warn('Tesseract.js pas installé. Utiliser: npm install tesseract.js');
    return null;
  }
};

// Exécuter OCR Tesseract réel
export const performTesseractOCR = async (imageData, languages = ['fre', 'eng']) => {
  try {
    const Tesseract = await loadTesseract();

    if (!Tesseract) {
      console.warn('Tesseract.js indisponible, fallback mock OCR');
      return { text: 'Mock OCR - installer Tesseract.js pour réel OCR', confidence: 0 };
    }

    const worker = await Tesseract.createWorker(languages);

    // Exécuter reconnaissance
    const result = await worker.recognize(imageData);

    // Extraire texte et confiance
    const text = result.data.text;
    const confidence = result.data.confidence;

    await worker.terminate();

    return { text, confidence };
  } catch (error) {
    console.error('Erreur Tesseract:', error);
    throw error;
  }
};

// Parser texte OCR avancé avec nettoyage
export const parseOCRText = (rawText) => {
  // Nettoyer texte
  let cleaned = rawText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');

  // Normaliser espaces
  cleaned = cleaned.replace(/\s+/g, ' ');

  return cleaned;
};

// Détecter langue du document
export const detectLanguage = (text) => {
  const frenchWords = ['le', 'de', 'la', 'et', 'à', 'un', 'une', 'des', 'du', 'cette', 'ce'];
  const englishWords = ['the', 'of', 'and', 'a', 'to', 'in', 'is', 'for', 'an', 'this', 'that'];

  const frenchCount = frenchWords.filter(w => text.toLowerCase().includes(w)).length;
  const englishCount = englishWords.filter(w => text.toLowerCase().includes(w)).length;

  if (frenchCount > englishCount) return ['fre'];
  if (englishCount > frenchCount) return ['eng'];
  return ['fre', 'eng']; // Bilingue
};

// Pipeline OCR complet
export const processDocumentWithTesseract = async (imageData, documentType) => {
  try {
    // 1. Exécuter OCR
    const { text, confidence } = await performTesseractOCR(imageData);

    // 2. Parser texte
    const cleanText = parseOCRText(text);

    // 3. Détecter langue
    const detectedLanguages = detectLanguage(cleanText);

    // 4. Extraire données (utiliser patterns)
    const extracted = extractFieldsFromText(cleanText, documentType);

    return {
      success: true,
      rawText: text,
      cleanText: cleanText,
      confidence: Math.round(confidence),
      languages: detectedLanguages,
      extracted: extracted
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Extraire champs du texte nettoyé
const extractFieldsFromText = (text, documentType) => {
  const patterns = {
    cni: {
      nom: /(?:NOM|nom)[:\s]+([\w\s]+?)(?=\n|PRENOM|prenom|$)/i,
      prenom: /(?:PRENOM|prenom)[:\s]+([\w\s]+?)(?=\n|DATE|$)/i,
      numero: /(?:N°|NUMERO|numero)[:\s]*([A-Z0-9]{12,14})/i,
    },
    passport: {
      nom: /(?:Surname|NOM)[:\s]+([\w\s]+?)(?=\n|Given)/i,
      numero: /(?:Passport No|NUMERO)[:\s]*([A-Z0-9]{6,9})/i,
    },
    titre_propriete: {
      numero_parcelle: /(?:parcelle|PARCELLE|Lot)[:\s]*([A-Z0-9-]+)/i,
      superficie: /(?:superficie|SUPERFICIE)[:\s]*(\d+\.?\d*)\s*m²?/i,
    },
    bail: {
      montant_loyer: /(?:loyer|LOYER)[:\s]*(\d+\.?\d*)\s*(?:FCFA|€|$)?/i,
    },
    facture: {
      numero: /(?:FACTURE|Facture|N°)[:\s]*([A-Z0-9-]+)/i,
      montant: /(?:TOTAL|Total)[:\s]*(\d+\.?\d*)/i,
    }
  };

  const extracted = {};
  const docPatterns = patterns[documentType] || {};

  for (const [field, pattern] of Object.entries(docPatterns)) {
    const match = text.match(pattern);
    if (match && match[1]) {
      extracted[field] = match[1].trim();
    }
  }

  return extracted;
};

export default {
  loadTesseract,
  performTesseractOCR,
  parseOCRText,
  detectLanguage,
  processDocumentWithTesseract
};
