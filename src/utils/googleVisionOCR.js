// Google Vision API - OCR Ultra-Précis + Handwriting + Entities
// Install: npm install @google-cloud/vision

// Configuration (via .env)
const GOOGLE_VISION_CONFIG = {
  apiKey: process.env.REACT_APP_GOOGLE_VISION_KEY,
  projectId: process.env.REACT_APP_GOOGLE_PROJECT_ID,
  enableHandwriting: true,
  enableEntities: true,
  enableDocumentAnalysis: true
};

// OCR Google Vision API
export const recognizeWithGoogleVision = async (imageData) => {
  if (!GOOGLE_VISION_CONFIG.apiKey) {
    console.warn('⚠️ Google Vision API Key manquante');
    return null;
  }

  try {
    const base64Image = imageData.split(',')[1];

    const requestBody = {
      requests: [
        {
          image: { content: base64Image },
          features: [
            { type: 'TEXT_DETECTION', maxResults: 10 },
            { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 },
            { type: 'HANDWRITING_DETECTION', maxResults: 10 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
            { type: 'FACE_DETECTION', maxResults: 10 }
          ],
          imageContext: {
            languageHints: ['fr', 'en']
          }
        }
      ]
    };

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_CONFIG.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`Google Vision API error: ${response.statusText}`);
    }

    const result = await response.json();
    const annotations = result.responses[0];

    return {
      success: true,
      fullText: extractFullText(annotations.fullTextAnnotation),
      entities: extractEntities(annotations.textAnnotations),
      handwriting: extractHandwriting(annotations.textAnnotations),
      objects: annotations.localizedObjectAnnotations || [],
      faces: annotations.faceAnnotations || [],
      confidence: calculateConfidence(annotations),
      documentStructure: parseDocumentStructure(annotations.fullTextAnnotation)
    };
  } catch (error) {
    console.error('❌ Erreur Google Vision:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Extraire texte complet
const extractFullText = (fullTextAnnotation) => {
  if (!fullTextAnnotation) return '';
  return fullTextAnnotation.text;
};

// Extraire entités nommées
const extractEntities = (textAnnotations) => {
  if (!textAnnotations || textAnnotations.length === 0) return {};

  const entities = {};

  // Premier annotation = full text, suivants = mots individuels
  for (let i = 1; i < Math.min(textAnnotations.length, 100); i++) {
    const annotation = textAnnotations[i];
    const text = annotation.description;
    const confidence = annotation.confidence || 0;

    // Détection patterns
    if (isDatePattern(text)) {
      entities.dates = entities.dates || [];
      entities.dates.push({ text, confidence });
    } else if (isNumberPattern(text)) {
      entities.numbers = entities.numbers || [];
      entities.numbers.push({ text, confidence });
    } else if (isEmailPattern(text)) {
      entities.emails = entities.emails || [];
      entities.emails.push(text);
    } else if (isPhonePattern(text)) {
      entities.phones = entities.phones || [];
      entities.phones.push(text);
    } else if (isCapitalizedWord(text)) {
      entities.properNouns = entities.properNouns || [];
      entities.properNouns.push(text);
    }
  }

  return entities;
};

// Extraire handwriting
const extractHandwriting = (textAnnotations) => {
  const handwritings = [];
  if (!textAnnotations) return handwritings;

  // Filtrer annotations avec properties.detectedLanguages (handwriting)
  textAnnotations.forEach(annotation => {
    if (annotation.properties && annotation.properties.detectedLanguages) {
      handwritings.push({
        text: annotation.description,
        confidence: annotation.confidence,
        languages: annotation.properties.detectedLanguages
      });
    }
  });

  return handwritings;
};

// Parser structure document
const parseDocumentStructure = (fullTextAnnotation) => {
  if (!fullTextAnnotation) return null;

  const pages = [];
  if (fullTextAnnotation.pages) {
    fullTextAnnotation.pages.forEach(page => {
      pages.push({
        width: page.width,
        height: page.height,
        blocks: page.blocks ? page.blocks.length : 0,
        text: extractPageText(page)
      });
    });
  }

  return { pages, totalPages: pages.length };
};

// Extraire texte par page
const extractPageText = (page) => {
  let text = '';
  if (page.blocks) {
    page.blocks.forEach(block => {
      if (block.paragraphs) {
        block.paragraphs.forEach(para => {
          if (para.words) {
            para.words.forEach(word => {
              if (word.symbols) {
                word.symbols.forEach(symbol => {
                  text += symbol.text;
                });
              }
            });
            text += ' ';
          }
        });
      }
      text += '\n';
    });
  }
  return text;
};

// Calculer confiance globale
const calculateConfidence = (annotations) => {
  const confidences = [];

  if (annotations.textAnnotations) {
    annotations.textAnnotations.forEach(annotation => {
      if (annotation.confidence) {
        confidences.push(annotation.confidence);
      }
    });
  }

  if (confidences.length === 0) return 0;
  return Math.round(
    confidences.reduce((a, b) => a + b, 0) / confidences.length * 100
  );
};

// Patterns detection
const isDatePattern = (text) => /\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4}/.test(text);
const isNumberPattern = (text) => /^\d+(?:[.,]\d+)*$/.test(text);
const isEmailPattern = (text) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
const isPhonePattern = (text) => /^\+?[\d\s\-()]{8,}$/.test(text);
const isCapitalizedWord = (text) => /^[A-Z][a-z]+$/.test(text);

// Analyse de document complet (facture, contrat, etc.)
export const analyzeDocumentStructure = async (imageData, documentType = 'general') => {
  const visionResult = await recognizeWithGoogleVision(imageData);
  if (!visionResult || !visionResult.success) return null;

  const analysis = {
    documentType,
    fullText: visionResult.fullText,
    entities: visionResult.entities,
    fields: extractFieldsFromAnalysis(visionResult, documentType),
    confidence: visionResult.confidence,
    hasHandwriting: visionResult.handwriting.length > 0,
    hasImages: visionResult.objects.length > 0,
    hasFaces: visionResult.faces.length > 0,
    structure: visionResult.documentStructure
  };

  return analysis;
};

// Extraire champs spécifiques par type document
const extractFieldsFromAnalysis = (visionResult, documentType) => {
  const fields = {};
  const text = visionResult.fullText.toUpperCase();
  const entities = visionResult.entities;

  switch (documentType) {
    case 'cni':
      fields.nom = extractFromEntities(entities.properNouns, 0);
      fields.prenom = extractFromEntities(entities.properNouns, 1);
      fields.date_naissance = extractFromEntities(entities.dates, 0);
      fields.numero = extractNumberAfterKeyword(text, 'NUMERO');
      break;

    case 'facture':
      fields.numero = extractNumberAfterKeyword(text, 'FACTURE|N°');
      fields.date = extractFromEntities(entities.dates, 0);
      fields.montant = extractLargestNumber(entities.numbers);
      fields.beneficiaire = extractFromEntities(entities.properNouns, 0);
      break;

    case 'titre_propriete':
      fields.numero_parcelle = extractNumberAfterKeyword(text, 'PARCELLE|LOT');
      fields.superficie = extractNumberAfterKeyword(text, 'SUPERFICIE|SURFACE');
      fields.proprietaire = extractFromEntities(entities.properNouns, 0);
      fields.adresse = extractAddress(text);
      break;

    default:
      fields.text = visionResult.fullText;
      fields.entities = entities;
      break;
  }

  return fields;
};

// Helper: Extraire d'entités
const extractFromEntities = (entityArray, index) => {
  if (!entityArray || !entityArray[index]) return '';
  return entityArray[index].text || entityArray[index];
};

// Helper: Extraire nombre après keyword
const extractNumberAfterKeyword = (text, keyword) => {
  const regex = new RegExp(`${keyword}[:\\s]+([\\d.,]+)`, 'i');
  const match = text.match(regex);
  return match ? match[1] : '';
};

// Helper: Extraire plus grand nombre
const extractLargestNumber = (numberArray) => {
  if (!numberArray || numberArray.length === 0) return '';
  return numberArray.reduce((max, curr) =>
    parseFloat(curr.text.replace(/,/g, '.')) > parseFloat(max.text.replace(/,/g, '.')) ? curr : max
  ).text;
};

// Helper: Extraire adresse
const extractAddress = (text) => {
  // Simple pattern - améliorer selon besoins
  const addressPatterns = [
    /(?:adresse|rue|avenue|boulevard)[:\s]+([^,\n]+)/i,
    /(\d+\s+(?:rue|avenue|boulevard|place|cours)[^,\n]*)/i
  ];

  for (const pattern of addressPatterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return '';
};

export default {
  recognizeWithGoogleVision,
  analyzeDocumentStructure,
  GOOGLE_VISION_CONFIG
};
