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
 * @param {Array} excelData - Raw Excel data
 * @param {Object} mapping - Column mapping
 * @returns {Array} Formatted PAP data
 */
export function mapExcelToAPIP(excelData, mapping = {}) {
  // Default mapping (adjust based on actual Excel structure)
  const defaultMapping = {
    'Code PAP': 'code_pap',
    'Nom': 'nom',
    'Prénom': 'prenom',
    'Email': 'email',
    'Téléphone': 'telephone',
    'Adresse': 'adresse',
    'Type de bien': 'type_bien',
    'Superficie': 'superficie_m2',
    'Localisation': 'localisation',
    'Latitude': 'gps_lat',
    'Longitude': 'gps_lng',
    'Montant Initial': 'montant_initial',
    'Statut': 'statut',
    'Phase': 'phase',
    'Date Création': 'date_creation'
  };

  const finalMapping = { ...defaultMapping, ...mapping };
  const formattedData = [];
  const errors = [];

  excelData.forEach((row, index) => {
    try {
      const formattedRow = {};
      let hasData = false;

      Object.entries(finalMapping).forEach(([excelCol, apixField]) => {
        if (row[excelCol] !== undefined && row[excelCol] !== null && row[excelCol] !== '') {
          // Type conversion
          if (apixField.includes('montant') || apixField.includes('superficie')) {
            formattedRow[apixField] = Number(row[excelCol]);
          } else if (apixField.includes('gps')) {
            formattedRow[apixField] = parseFloat(row[excelCol]);
          } else if (apixField.includes('date')) {
            formattedRow[apixField] = new Date(row[excelCol]);
          } else {
            formattedRow[apixField] = String(row[excelCol]).trim();
          }
          hasData = true;
        }
      });

      if (hasData) {
        // Auto-generate code if missing
        if (!formattedRow.code_pap) {
          formattedRow.code_pap = `PAP-${String(Date.now()).slice(-6)}`;
        }
        formattedData.push(formattedRow);
      }
    } catch (error) {
      errors.push(`Row ${index + 1}: ${error.message}`);
    }
  });

  return { data: formattedData, errors, successCount: formattedData.length };
}

/**
 * Validate PAP data before import
 * @param {Array} data - PAP data to validate
 * @returns {Object} Validation result
 */
export function validatePAPData(data) {
  const errors = [];
  const warnings = [];
  let validCount = 0;

  data.forEach((pap, index) => {
    // Required fields
    if (!pap.nom) errors.push(`Row ${index + 1}: Nom requis`);
    if (!pap.prenom) errors.push(`Row ${index + 1}: Prénom requis`);
    if (!pap.adresse) warnings.push(`Row ${index + 1}: Adresse manquante`);

    // Email validation
    if (pap.email && !pap.email.includes('@')) {
      warnings.push(`Row ${index + 1}: Email invalide`);
    }

    // GPS validation (if present)
    if (pap.gps_lat && (pap.gps_lat < -90 || pap.gps_lat > 90)) {
      errors.push(`Row ${index + 1}: Latitude invalide (${pap.gps_lat})`);
    }
    if (pap.gps_lng && (pap.gps_lng < -180 || pap.gps_lng > 180)) {
      errors.push(`Row ${index + 1}: Longitude invalide (${pap.gps_lng})`);
    }

    if (errors.filter(e => e.startsWith(`Row ${index + 1}`)).length === 0) {
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
