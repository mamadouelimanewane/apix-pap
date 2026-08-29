/**
 * Excel Importer - Import PAP data from Excel files
 * Supports: .xlsx, .xls files
 * Mapping: Excel columns → MongoDB fields
 */

import * as XLSX from 'xlsx';

/**
 * Parse Excel file and extract PAP data
 * @param {File} file - Excel file to parse
 * @returns {Promise<{success: boolean, data: Array, errors: Array}>}
 */
export async function parseExcelFile(file) {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    return {
      success: true,
      data: rawData,
      sheetName,
      rowCount: rawData.length,
      columns: rawData.length > 0 ? Object.keys(rawData[0]) : []
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [error.message],
      rowCount: 0,
      columns: []
    };
  }
}

/**
 * Map Excel columns to APIX-PAP fields
 * Supports TER project with ALL 59 columns
 * @param {Array} excelData - Raw Excel data
 * @param {Object} mapping - Column mapping (optional)
 * @returns {Object} Formatted PAP data with all fields
 */
export function mapExcelToAPIP(excelData, mapping = {}) {
  // TER Mapping: Excel columns → MongoDB PAP fields
  const defaultMapping = {
    // Identifiant & Personne
    'CODE PAP': 'code_pap',
    'Prénom de la PAP': 'prenom',
    'Nom de la PAP': 'nom',
    'Sexe': 'sexe',
    'Nationalité': 'nationalite',

    // Localisation
    'Region': 'region',
    'Département': 'departement',
    'Arrondissement': 'arrondissement',
    'Commune': 'commune',
    'Localite': 'localite',
    'DR': 'dr',

    // GPS (UTM format: GPSX, GPSY, GPS Z)
    'GPSX': 'gps_x',
    'GPSY': 'gps_y',
    'GPS Z': 'gps_z',

    // Place d'affaires
    'Catégorie': 'categorie',
    'Statut de PA': 'statut_pa',
    'Type de place d\'affaires': 'type_place',
    'Nb bien impacté': 'nb_bien_impacte',
    'Type de PA': 'type_pa',
    'Statut juridique de la place d\'affaires': 'statut_juridique',
    'Secteur d\'activité': 'secteur_activite',

    // Revenus & Activité
    'Chiffre d\'affaires 2019': 'ca_2019',
    'Revenu mensuel': 'revenu_mensuel',
    'Perte de revenus de la place d\'affaires': 'perte_revenus',
    'Appui perte de revenus': 'appui_perte_revenus',
    'Frais de déplacement': 'frais_deplacement',
    'Loyer mensuel': 'loyer_mensuel',
    'Appui à la réinstallation': 'appui_reinstallation',

    // Propriété & Contrats
    'Existence d\'un contrat de location': 'contrat_location',
    'Contrat enregistré aux domaines': 'contrat_enregistre',

    // Superficies
    'Superficie totale': 'superficie_totale',
    'Surface affectée': 'surface_affectee',
    'Pertes de terres': 'perte_terres',

    // Clôtures
    'Perimètre cloture Totale': 'perimetre_clot_total',
    'Perimètre cloture impactée': 'perimetre_clot_impactee',
    'Nature de la cloture': 'nature_cloture',
    'Pertes de clôture': 'perte_cloture',

    // Arbres fruitiers
    'Perte de pied jeune': 'perte_pied_jeune',
    'Perte de pied mature': 'perte_pied_mature',
    'Total pertes d\'arbres fruitier 1': 'total_arbres_fruitier_1',
    'Perte de pied jeune_1': 'perte_pied_jeune_1',
    'Perte de pied mature_1': 'perte_pied_mature_1',
    'Total pertes d\'arbres fruitier 2': 'total_arbres_fruitier_2',
    'Perte de pied jeune_2': 'perte_pied_jeune_2',
    'Perte de pied mature_2': 'perte_pied_mature_2',
    'Total pertes d\'arbres fruitier 3': 'total_arbres_fruitier_3',
    'Perte Total d\'arbres fruitier': 'perte_total_arbres_fruitier',

    // Arbres forestiers
    'Pertes de Pieds arbre forestiere 1': 'perte_pieds_arbre_forest_1',
    'Pertes total d\'espèces forestières': 'perte_total_esp_forestieres',

    // Équipements & Bâtiments
    'Perte Equipement 1': 'perte_equipement_1',
    'Perte Equipement 2': 'perte_equipement_2',
    'Perte Equipement 3': 'perte_equipement_3',
    'Total Equipement': 'total_equipement',
    'Nombre de bâtiment': 'nombre_batiment',
    'Perte total batiment': 'perte_total_batiment',

    // Évaluation & Indemnisation
    'Evaluation globale': 'evaluation_globale',
    'Préférences indemnisation': 'preferences_indemnisation',

    // Observations
    'Observations': 'observations',
    'Observations_1': 'observations_1'
  };

  const finalMapping = { ...defaultMapping, ...mapping };
  const formattedData = [];
  const errors = [];

  excelData.forEach((row, index) => {
    try {
      const formattedRow = {};
      let hasData = false;

      // Process mapped columns
      Object.entries(finalMapping).forEach(([excelCol, apixField]) => {
        const value = row[excelCol];

        if (value !== undefined && value !== null && value !== '') {
          // Smart type conversion
          if (['gps_x', 'gps_y', 'gps_z'].includes(apixField) ||
              apixField.includes('montant') ||
              apixField.includes('perte') ||
              apixField.includes('superficie') ||
              apixField.includes('surface') ||
              apixField.includes('perimetre') ||
              apixField.includes('pied') ||
              apixField.includes('arbres') ||
              apixField.includes('equipement') ||
              apixField.includes('batiment') ||
              apixField.includes('ca_') ||
              apixField.includes('revenu') ||
              apixField.includes('loyer') ||
              apixField.includes('frais') ||
              apixField.includes('evaluation')) {
            formattedRow[apixField] = Number(value);
          } else if (apixField.includes('date')) {
            formattedRow[apixField] = new Date(value);
          } else {
            formattedRow[apixField] = String(value).trim();
          }
          hasData = true;
        }
      });

      // Add all unmapped columns as additional_data
      const mappedKeys = Object.keys(finalMapping);
      const additionalData = {};
      Object.entries(row).forEach(([key, value]) => {
        if (!mappedKeys.includes(key) && value && !key.startsWith('__EMPTY')) {
          additionalData[key] = value;
        }
      });

      if (Object.keys(additionalData).length > 0) {
        formattedRow.additional_data = additionalData;
      }

      if (hasData) {
        formattedData.push(formattedRow);
      }
    } catch (error) {
      errors.push(`Row ${index + 1}: ${error.message}`);
    }
  });

  return { data: formattedData, errors, successCount: formattedData.length };
}

/**
 * Validate PAP data before import (TER format)
 * @param {Array} data - PAP data to validate
 * @returns {Object} Validation result with TER-specific rules
 */
export function validatePAPData(data) {
  const errors = [];
  const warnings = [];
  let validCount = 0;

  data.forEach((pap, index) => {
    const rowNum = index + 1;
    let rowErrors = [];

    // REQUIRED FIELDS (TER project)
    if (!pap.code_pap) rowErrors.push(`CODE PAP requis`);
    if (!pap.nom) rowErrors.push(`Nom de la PAP requis`);
    if (!pap.prenom) rowErrors.push(`Prénom de la PAP requis`);
    if (!pap.region) warnings.push(`Row ${rowNum}: Région manquante`);

    // GPS VALIDATION (UTM format: positive numbers)
    if (pap.gps_x !== undefined && pap.gps_x !== null) {
      if (typeof pap.gps_x !== 'number' || pap.gps_x < 0) {
        rowErrors.push(`GPS X invalide (${pap.gps_x})`);
      }
    } else {
      warnings.push(`Row ${rowNum}: GPS X manquant`);
    }

    if (pap.gps_y !== undefined && pap.gps_y !== null) {
      if (typeof pap.gps_y !== 'number' || pap.gps_y < 0) {
        rowErrors.push(`GPS Y invalide (${pap.gps_y})`);
      }
    } else {
      warnings.push(`Row ${rowNum}: GPS Y manquant`);
    }

    // SUPERFICIE VALIDATION (positive numbers)
    if (pap.superficie_totale !== undefined && pap.superficie_totale !== null) {
      if (typeof pap.superficie_totale !== 'number' || pap.superficie_totale <= 0) {
        rowErrors.push(`Superficie totale invalide (${pap.superficie_totale})`);
      }
    }

    // MONTANT VALIDATION (positive if present)
    if (pap.evaluation_globale !== undefined && pap.evaluation_globale !== null) {
      if (typeof pap.evaluation_globale !== 'number' || pap.evaluation_globale < 0) {
        rowErrors.push(`Evaluation globale invalide (${pap.evaluation_globale})`);
      }
    }

    // CATÉGORIE VALIDATION
    const validCategories = ['EXPLOITANT PA', 'PROPRIETAIRE', 'LOCATAIRE', 'AUTRE'];
    if (pap.categorie && !validCategories.includes(pap.categorie.toUpperCase())) {
      warnings.push(`Row ${rowNum}: Catégorie inconnue (${pap.categorie})`);
    }

    // WARNINGS pour données potentiellement incomplètes
    if (!pap.sexe) warnings.push(`Row ${rowNum}: Sexe manquant`);
    if (!pap.secteur_activite) warnings.push(`Row ${rowNum}: Secteur d'activité manquant`);
    if (!pap.statut_pa && pap.categorie === 'EXPLOITANT PA') {
      warnings.push(`Row ${rowNum}: Statut PA manquant pour exploitant`);
    }

    // Ajouter les erreurs row-specific
    rowErrors.forEach(err => {
      errors.push(`Row ${rowNum}: ${err}`);
    });

    if (rowErrors.length === 0) {
      validCount++;
    }
  });

  return {
    isValid: errors.length === 0,
    validCount,
    totalCount: data.length,
    errors,
    warnings,
    successRate: Math.round((validCount / data.length) * 100) + '%'
  };
}

/**
 * Import PAP data to API
 * @param {Array} data - PAP data
 * @param {String} apiUrl - API endpoint
 * @returns {Promise<Object>} Import result
 */
export async function importToAPI(data, apiUrl = '/api/pap/bulk-import') {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paps: data })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const result = await response.json();
    return {
      success: true,
      message: `${result.created || 0} PAPs importées`,
      created: result.created,
      failed: result.failed,
      errors: result.errors || []
    };
  } catch (error) {
    return {
      success: false,
      message: `Erreur import: ${error.message}`,
      errors: [error.message]
    };
  }
}

export default {
  parseExcelFile,
  mapExcelToAPIP,
  validatePAPData,
  importToAPI
};
