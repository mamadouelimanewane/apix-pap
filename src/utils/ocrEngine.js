// Engine OCR avancé avec extraction de données intelligente
// Utilise Tesseract.js (installable) ou regex-based parsing

const PATTERNS = {
  cni: {
    fields: {
      nom: /(?:NOM|nom)[:\s]*([\w\s]+?)(?=\n|PRENOM|prenom|$)/i,
      prenom: /(?:PRENOM|prenom)[:\s]*([\w\s]+?)(?=\n|DATE|date|$)/i,
      date_naissance: /(?:DATE.*NAISSANCE|né|naiss)[:\s]*([\d./-]+)/i,
      numero: /(?:NUMERO|N°)[:\s]*([A-Z0-9]{13,14})/i,
      date_emission: /(?:DELIVREE|émis)[:\s]*([\d./-]+)/i,
      date_expiration: /(?:VALABLE|expir)[:\s]*([\d./-]+)/i,
      sexe: /(?:SEXE|SEX)[:\s]*([MF])/i,
    }
  },
  passport: {
    fields: {
      nom: /(?:Surname|NOM)[:\s]*([\w\s]+?)(?=\n|Given|PRENOM)/i,
      prenom: /(?:Given|PRENOM)[:\s]*([\w\s]+?)(?=\n|National|NATION)/i,
      nationalite: /(?:Nationality|NATION)[:\s]*([\w\s]+?)(?=\n|Date)/i,
      numero: /(?:Passport No|NUMERO)[:\s]*([A-Z0-9]{6,9})/i,
      date_emission: /(?:Date of issue|Émis)[:\s]*([\d./-]+)/i,
      date_expiration: /(?:Date of expiry|Expir)[:\s]*([\d./-]+)/i,
    }
  },
  titre_propriete: {
    fields: {
      numero_parcelle: /(?:parcelle|PARCELLE|Lot)[:\s]*([A-Z0-9-]+)/i,
      proprietaire: /(?:proprietaire|PROPRIETAIRE|Titulaire)[:\s]*([\w\s]+?)(?=\n|ADRESSE|adresse)/i,
      superficie: /(?:superficie|SUPERFICIE|Surface)[:\s]*(\d+\.?\d*\s*m²?)/i,
      adresse: /(?:adresse|ADRESSE|Localisation)[:\s]*([\w\s,]+?)(?=\n|DATE|date)/i,
      date_acquisition: /(?:acquisition|ACQUISITION|enregistr)[:\s]*([\d./-]+)/i,
    }
  },
  bail: {
    fields: {
      locataire: /(?:locataire|LOCATAIRE|Preneur)[:\s]*([\w\s]+?)(?=\n|bailleur|BAILLEUR)/i,
      bailleur: /(?:bailleur|BAILLEUR|Bailleur)[:\s]*([\w\s]+?)(?=\n|ADRESSE|adresse)/i,
      adresse: /(?:adresse|ADRESSE|Lieu)[:\s]*([\w\s,]+?)(?=\n|LOYER|loyer)/i,
      montant_loyer: /(?:loyer|LOYER|Montant)[:\s]*(\d+\.?\d*\s*(?:FCFA|€|$)?)/i,
      date_debut: /(?:debut|DEBUT|à partir|du)[:\s]*([\d./-]+)/i,
    }
  },
  attestation: {
    fields: {
      nom: /(?:nom|NOM|Nomm)[:\s]*([\w\s]+?)(?=\n|ADRESSE|adresse)/i,
      adresse: /(?:adresse|ADRESSE|Résid)[:\s]*([\w\s,]+?)(?=\n|DATE|date)/i,
      date_emission: /(?:date|DATE|émis)[:\s]*([\d./-]+)/i,
      delivrant: /(?:délivr|DÉLIVR|Commune|Mairie)[:\s]*([\w\s]+?)(?=\n|$)/i,
    }
  },
  facture: {
    fields: {
      numero: /(?:FACTURE|Facture|N°)[:\s]*([A-Z0-9-]+)/i,
      date: /(?:date|DATE|le)[:\s]*([\d./-]+)/i,
      montant: /(?:TOTAL|Total|Montant)[:\s]*(\d+\.?\d*\s*(?:FCFA|€|$)?)/i,
      beneficiaire: /(?:Bénéficiaire|Prestataire|À)[:\s]*([\w\s]+?)(?=\n|MOTIF|motif)/i,
      motif: /(?:MOTIF|Motif|Description|Prestation)[:\s]*([\w\s,]+?)(?=\n|$)/i,
    }
  }
};

// Simulation OCR - dans prod: utiliser Tesseract.js ou API
export const performOCR = async (imageData, documentType) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simuler extraction de texte (dans prod: Tesseract.js)
      const mockTexts = {
        cni: `
          REPUBLIQUE DU SENEGAL
          MINISTERE DE L'INTERIEUR
          CARTE NATIONALE D'IDENTITE

          NOM: DIA
          PRENOM: Mamadou
          DATE DE NAISSANCE: 15.01.1985
          NUMERO: 0012345678901
          DELIVREE: 10.06.2020
          VALABLE JUSQU'AU: 09.06.2030
          SEXE: M
          LIEU DE NAISSANCE: Dakar
        `,
        passport: `
          SENEGAL
          PASSEPORT
          Surname: NDIAYE
          Given Names: Fatou
          Nationality: SENEGAL
          Passport No.: S0123456789
          Date of issue: 20/03/2021
          Date of expiry: 19/03/2031
        `,
        titre_propriete: `
          TITRE DE PROPRIETE
          Parcelle: RT-001-456
          Proprietaire: Dia Mamadou
          Superficie: 500 m²
          Adresse: Dakar Centre
          Date d'acquisition: 15.05.2015
          Valeur estimée: 12500000 FCFA
        `,
        bail: `
          CONTRAT DE LOCATION
          Locataire: Ba Mohamed
          Bailleur: Sall Aïssatou
          Adresse: Thiès
          Montant du loyer: 150000 FCFA
          Date de debut: 01.01.2024
          Duree: 12 mois
        `,
        attestation: `
          ATTESTATION DE RESIDENCE
          Certifié que le nommé: Fall Ousseynou
          Habite à l'adresse: Kaolack
          Date d'emission: 26.08.2026
          Delivrée par: Mairie Kaolack
        `,
        facture: `
          FACTURE N° FAC-2026-0045
          Date: 20/08/2026
          Beneficiaire: Ndiaye Assane
          Motif: Travaux de renovation
          MONTANT TOTAL: 850000 FCFA
        `
      };

      const text = mockTexts[documentType] || '';
      extractDataFromText(text, documentType, resolve);
    }, 1500); // Simuler OCR delay
  });
};

export const extractDataFromText = (text, documentType, callback) => {
  const patterns = PATTERNS[documentType] || {};
  const extracted = {};

  for (const [fieldName, pattern] of Object.entries(patterns.fields)) {
    const match = text.match(pattern);
    if (match && match[1]) {
      extracted[fieldName] = cleanValue(match[1], fieldName);
    }
  }

  callback(extracted);
};

const cleanValue = (value, fieldName) => {
  let cleaned = value.trim();

  // Normaliser dates
  if (fieldName.includes('date')) {
    cleaned = cleaned.replace(/\//g, '.').replace(/-/g, '.');
    if (!/\d{1,2}\.\d{1,2}\.\d{4}/.test(cleaned)) {
      cleaned = cleaned.replace(/(\d{1,2})(\d{1,2})(\d{4})/, '$1.$2.$3');
    }
  }

  // Normaliser montants
  if (fieldName.includes('montant')) {
    cleaned = cleaned.replace(/\s+/g, ' ');
  }

  // Uppercase noms/prénoms
  if (['nom', 'prenom', 'proprietaire', 'locataire', 'bailleur'].includes(fieldName)) {
    cleaned = cleaned.toUpperCase();
  }

  return cleaned;
};

// Validation intelligente des données
export const validateExtraction = (data, documentType) => {
  const errors = [];
  const warnings = [];

  const required = {
    cni: ['nom', 'prenom', 'numero'],
    passport: ['nom', 'prenom', 'numero'],
    titre_propriete: ['numero_parcelle', 'proprietaire', 'superficie'],
    bail: ['locataire', 'bailleur', 'montant_loyer'],
    attestation: ['nom', 'adresse'],
    facture: ['numero', 'montant']
  };

  // Vérifier champs obligatoires
  (required[documentType] || []).forEach(field => {
    if (!data[field]) {
      errors.push(`Champ obligatoire manquant: ${field}`);
    }
  });

  // Validations spécifiques
  if (documentType === 'cni' && data.numero) {
    if (!/^[A-Z0-9]{13,14}$/.test(data.numero.replace(/\s/g, ''))) {
      warnings.push('Numéro CNI invalide');
    }
  }

  if (documentType === 'titre_propriete' && data.superficie) {
    const area = parseInt(data.superficie);
    if (area < 10 || area > 100000) {
      warnings.push('Superficie inhabituelle');
    }
  }

  return { valid: errors.length === 0, errors, warnings };
};

// Estimer qualité du texte OCR
export const estimateOCRQuality = (text, originalImage) => {
  if (!text || text.length < 20) return 0;

  // Score basé sur longueur et densité texte
  const textScore = Math.min(100, (text.length / 500) * 100);

  // Score basé sur diversité de caractères
  const uniqueChars = new Set(text).size;
  const charDiversityScore = Math.min(100, (uniqueChars / 50) * 100);

  // Score basé sur présence de nombres et lettres
  const hasNumbers = /\d/.test(text);
  const hasLetters = /[a-zA-Z]/.test(text);
  const contentScore = (hasNumbers && hasLetters) ? 100 : 50;

  return Math.round((textScore + charDiversityScore + contentScore) / 3);
};

export default {
  performOCR,
  extractDataFromText,
  validateExtraction,
  estimateOCRQuality,
  PATTERNS
};
