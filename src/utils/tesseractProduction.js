// Tesseract.js Production - OCR Réel avec Cache & Worker Pool
// Installation: npm install tesseract.js

import Tesseract from 'tesseract.js';

const WORKER_CONFIG = {
  corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v5/dist/',
  langPath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v5/dist/lang-data',
  cachePath: '/tesseract-cache',
  cacheSize: 100 * 1024 * 1024, // 100MB
};

let workerPool = [];
const maxWorkers = 3;
let activeJobs = 0;

// Initialiser pool de workers
export const initializeWorkerPool = async () => {
  try {
    for (let i = 0; i < maxWorkers; i++) {
      const worker = await Tesseract.createWorker({
        corePath: WORKER_CONFIG.corePath,
        langPath: WORKER_CONFIG.langPath,
      });
      await worker.load();
      workerPool.push({ worker, busy: false });
    }
    console.log(`✅ Worker pool initialisé: ${maxWorkers} workers`);
    return true;
  } catch (error) {
    console.error('❌ Erreur initialisation pool:', error);
    return false;
  }
};

// Obtenir worker disponible
const getAvailableWorker = () => {
  const available = workerPool.find(w => !w.busy);
  if (available) {
    available.busy = true;
    activeJobs++;
    return available;
  }
  return null;
};

// Libérer worker
const releaseWorker = (workerObj) => {
  workerObj.busy = false;
  activeJobs--;
};

// OCR Multi-langue Production
export const recognizeDocumentProduction = async (imageData, languages = ['fre', 'eng'], options = {}) => {
  try {
    const workerObj = getAvailableWorker();
    if (!workerObj) {
      throw new Error('Aucun worker disponible');
    }

    const { worker } = workerObj;
    const startTime = Date.now();

    // Charger langues si nécessaire
    for (const lang of languages) {
      try {
        await worker.loadLanguage(lang);
      } catch (e) {
        console.warn(`Langue ${lang} non disponible`);
      }
    }
    await worker.initialize(languages);

    // Options OCR
    const recognizeOptions = {
      tessedit_create_hocr: true, // HTML output
      tessedit_pagesegmode: Tesseract.PSM.AUTO,
      ...options
    };

    // Reconnaissance
    const { data } = await worker.recognize(imageData, recognizeOptions);

    releaseWorker(workerObj);

    const processingTime = Date.now() - startTime;

    return {
      success: true,
      text: data.text,
      confidence: Math.round(data.confidence),
      blocks: data.blocks || [],
      lines: extractLines(data),
      words: extractWords(data),
      processingTime,
      languages: languages,
      hocr: data.hocr // HTML structure
    };
  } catch (error) {
    console.error('❌ Erreur OCR Tesseract:', error);
    return {
      success: false,
      error: error.message,
      text: '',
      confidence: 0
    };
  }
};

// Extraire lignes avec confiance
const extractLines = (data) => {
  const lines = [];
  if (data.blocks) {
    data.blocks.forEach(block => {
      if (block.lines) {
        block.lines.forEach(line => {
          lines.push({
            text: line.text,
            confidence: Math.round(line.confidence),
            bbox: line.bbox,
            words: line.words || []
          });
        });
      }
    });
  }
  return lines;
};

// Extraire mots avec confiance individuelle
const extractWords = (data) => {
  const words = [];
  if (data.blocks) {
    data.blocks.forEach(block => {
      if (block.lines) {
        block.lines.forEach(line => {
          if (line.words) {
            line.words.forEach(word => {
              words.push({
                text: word.text,
                confidence: Math.round(word.confidence),
                bbox: word.bbox
              });
            });
          }
        });
      }
    });
  }
  return words;
};

// OCR avec Région Intérêt (cropping)
export const recognizeRegionOCR = async (imageData, region, languages = ['fre']) => {
  try {
    // Cropper image à région
    const croppedImage = await cropImage(imageData, region);

    // OCR sur région
    const result = await recognizeDocumentProduction(croppedImage, languages, {
      tessedit_pagesegmode: Tesseract.PSM.SINGLE_LINE
    });

    return {
      ...result,
      region: region
    };
  } catch (error) {
    console.error('Erreur OCR région:', error);
    return { success: false, error: error.message };
  }
};

// Crop image
const cropImage = (imageData, { x, y, width, height }) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.src = imageData;
  });
};

// Batch OCR (plusieurs images)
export const recognizeBatchDocuments = async (imageArray, languages = ['fre', 'eng']) => {
  const results = [];
  const batchSize = 3;

  for (let i = 0; i < imageArray.length; i += batchSize) {
    const batch = imageArray.slice(i, i + batchSize);
    const batchPromises = batch.map(img =>
      recognizeDocumentProduction(img, languages)
    );
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return {
    total: imageArray.length,
    processed: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results: results,
    avgConfidence: Math.round(
      results.filter(r => r.success).reduce((sum, r) => sum + r.confidence, 0) /
      results.filter(r => r.success).length
    )
  };
};

// Détection orientation document
export const detectDocumentOrientation = async (imageData) => {
  try {
    const workerObj = getAvailableWorker();
    if (!workerObj) throw new Error('Pas de worker disponible');

    const { worker } = workerObj;
    await worker.loadLanguage('eng');
    await worker.initialize(['eng']);

    const { data } = await worker.detect(imageData);
    releaseWorker(workerObj);

    return {
      angle: data.angle,
      orientation: getOrientationLabel(data.angle),
      confidence: Math.round(data.confidence)
    };
  } catch (error) {
    console.error('Erreur détection orientation:', error);
    return { angle: 0, orientation: 'normal', confidence: 0 };
  }
};

// Label orientation
const getOrientationLabel = (angle) => {
  if (angle === 0) return 'Normal';
  if (Math.abs(angle - 90) < 5) return 'Tourné 90°';
  if (Math.abs(angle - 180) < 5) return 'Inversé 180°';
  if (Math.abs(angle - 270) < 5) return 'Tourné 270°';
  return `Angle ${angle}°`;
};

// Nettoyage ressources
export const cleanupWorkerPool = async () => {
  for (const workerObj of workerPool) {
    try {
      await workerObj.worker.terminate();
    } catch (e) {
      console.warn('Erreur cleanup worker:', e);
    }
  }
  workerPool = [];
  console.log('✅ Worker pool nettoyé');
};

// Status du pool
export const getWorkerPoolStatus = () => {
  return {
    totalWorkers: workerPool.length,
    busyWorkers: workerPool.filter(w => w.busy).length,
    availableWorkers: workerPool.filter(w => !w.busy).length,
    activeJobs: activeJobs
  };
};

export default {
  initializeWorkerPool,
  recognizeDocumentProduction,
  recognizeRegionOCR,
  recognizeBatchDocuments,
  detectDocumentOrientation,
  cleanupWorkerPool,
  getWorkerPoolStatus
};
