/**
 * IMPORT ROUTES - Multi-Project Import Endpoints
 * POST /api/projects/:projectId/detect-schema
 * POST /api/projects/:projectId/import
 * GET /api/import-batches
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');

let XLSX;
try {
  XLSX = require('xlsx');
} catch (e) {
  console.warn('Warning: xlsx not installed, install with: npm install xlsx');
}

const { Project, CategorySchema, Beneficiary, ImportBatch } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

// ============================================================================
// HELPERS
// ============================================================================

function findCategoryColumn(columns) {
  const categoryKeywords = ['Catégorie', 'Category', 'Type', 'Category PA', 'Cat'];
  for (const keyword of categoryKeywords) {
    const col = columns.find(c => c && c.includes(keyword));
    if (col) return col;
  }
  return columns[0] || 'Catégorie';
}

function suggestColumnMapping(columns) {
  const mapping = {};
  const fieldKeywords = {
    firstName: ['Prénom', 'First', 'Firstname'],
    lastName: ['Nom', 'Last', 'Lastname'],
    email: ['Email', 'Mail'],
    phone: ['Téléphone', 'Phone', 'Tel'],
    gender: ['Sexe', 'Gender'],
    nationality: ['Nationalité', 'Nationality'],
    region: ['Région', 'Region'],
    code: ['CODE', 'Code', 'ID']
  };

  columns.forEach(col => {
    if (!col) return;
    for (const [field, keywords] of Object.entries(fieldKeywords)) {
      if (keywords.some(kw => col.toLowerCase().includes(kw.toLowerCase()))) {
        mapping[col] = field;
        break;
      }
    }
  });
  return mapping;
}

function generateImportBatchId() {
  const date = new Date().toISOString().split('T')[0];
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `IMP-${date}-${random}`;
}

// ============================================================================
// DETECT SCHEMA ENDPOINT
// ============================================================================

router.post('/:projectId/detect-schema', auth, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Projet non trouvé' });
    }

    if (!XLSX) {
      return res.status(500).json({
        success: false,
        message: 'Excel support not installed. Run: npm install xlsx'
      });
    }

    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, message: 'Fichier requis' });
    }

    const workbook = XLSX.read(req.files.file.data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (data.length === 0) {
      return res.status(400).json({ success: false, message: 'Fichier vide' });
    }

    // Detect categories
    const categoryColumn = findCategoryColumn(Object.keys(data[0]));
    const categories = {};

    data.forEach(row => {
      const category = row[categoryColumn] || 'DEFAULT';
      if (!categories[category]) {
        categories[category] = { count: 0, columns: new Set() };
      }
      categories[category].count++;
      Object.keys(row).forEach(col => {
        if (row[col] && !col.startsWith('__EMPTY')) {
          categories[category].columns.add(col);
        }
      });
    });

    Object.keys(categories).forEach(cat => {
      categories[cat].columns = Array.from(categories[cat].columns);
    });

    const columnMapping = suggestColumnMapping(Object.keys(data[0]));

    res.json({
      success: true,
      fileInfo: {
        totalRows: data.length,
        totalColumns: Object.keys(data[0]).length
      },
      categories,
      columnMapping
    });

  } catch (error) {
    console.error('[DETECT-SCHEMA ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Erreur détection schéma',
      error: error.message
    });
  }
});

// ============================================================================
// BULK IMPORT ENDPOINT
// ============================================================================

router.post('/:projectId/import', auth, adminOnly, async (req, res) => {
  const startTime = Date.now();

  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Projet non trouvé' });
    }

    if (!XLSX) {
      return res.status(500).json({
        success: false,
        message: 'Excel support not installed'
      });
    }

    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, message: 'Fichier requis' });
    }

    const file = req.files.file;
    const fileHash = crypto.createHash('sha256').update(file.data).digest('hex');

    const workbook = XLSX.read(file.data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (excelData.length === 0) {
      return res.status(400).json({ success: false, message: 'Fichier Excel vide' });
    }

    if (excelData.length > 10000) {
      return res.status(400).json({
        success: false,
        message: `Limite dépassée: max 10000 lignes (reçu: ${excelData.length})`
      });
    }

    const categoryMapping = JSON.parse(req.body.categoryMapping || '{}');
    const columnMapping = JSON.parse(req.body.columnMapping || '{}');

    const categoryColumn = findCategoryColumn(Object.keys(excelData[0]));
    const categorySchemas = await CategorySchema.find({ projectId: project._id });

    const importBatchId = generateImportBatchId();

    const results = {
      created: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      warnings: [],
      resultDetails: [],
      byCategory: {}
    };

    // Group by category
    const dataByCategory = {};
    excelData.forEach((row, idx) => {
      const excelCategory = row[categoryColumn] || 'DEFAULT';
      const dbCategory = categoryMapping[excelCategory] || excelCategory;

      if (!dataByCategory[dbCategory]) {
        dataByCategory[dbCategory] = [];
      }
      dataByCategory[dbCategory].push({ row, excelIndex: idx + 2 });
    });

    // Import per category
    for (const [dbCategory, rows] of Object.entries(dataByCategory)) {
      results.byCategory[dbCategory] = 0;
      const schema = categorySchemas.find(s => s.categoryName === dbCategory);

      for (const { row, excelIndex } of rows) {
        try {
          const beneficiaryData = {
            projectId: project._id,
            categoryId: schema?._id,
            categoryName: dbCategory,
            code: row[Object.keys(columnMapping).find(k => columnMapping[k] === 'code')] || row['CODE PAP'],
            firstName: row[Object.keys(columnMapping).find(k => columnMapping[k] === 'firstName')] || row['Prénom de la PAP'],
            lastName: row[Object.keys(columnMapping).find(k => columnMapping[k] === 'lastName')] || row['Nom de la PAP'],
            email: row['Email'],
            phone: row['Téléphone'] ? [row['Téléphone']] : [],
            gender: row['Sexe'],
            nationality: row['Nationalité'],
            location: {
              region: row['Region'],
              department: row['Département'],
              district: row['Arrondissement'],
              commune: row['Commune'],
              locality: row['Localite'],
              gps: row['GPSX'] && row['GPSY'] ? {
                type: 'Point',
                coordinates: [Number(row['GPSX']), Number(row['GPSY']), Number(row['GPS Z']) || 0]
              } : null
            },
            categoryData: row,
            import: {
              importBatchId,
              importDate: new Date(),
              sourceFile: file.name,
              rowNumber: excelIndex
            },
            workflow: {
              status: 'Enregistré',
              phase: 'Registration'
            }
          };

          if (!beneficiaryData.code || !beneficiaryData.firstName || !beneficiaryData.lastName) {
            throw new Error('Code, Prénom, Nom requis');
          }

          // Check duplicates
          const existing = await Beneficiary.findOne({
            projectId: project._id,
            code: beneficiaryData.code,
            deleted_at: null
          });

          if (existing) {
            results.skipped++;
            results.resultDetails.push({
              rowNumber: excelIndex,
              code: beneficiaryData.code,
              status: 'SKIPPED',
              reason: 'Doublon'
            });
            continue;
          }

          const beneficiary = await Beneficiary.create(beneficiaryData);
          results.created++;
          results.byCategory[dbCategory]++;

          results.resultDetails.push({
            rowNumber: excelIndex,
            code: beneficiary.code,
            status: 'CREATED',
            beneficiaryId: beneficiary._id
          });

        } catch (error) {
          results.failed++;
          results.errors.push(`Ligne ${excelIndex}: ${error.message}`);
          results.resultDetails.push({
            rowNumber: excelIndex,
            status: 'FAILED',
            error: error.message
          });
        }
      }
    }

    // Create ImportBatch
    const endTime = Date.now();
    const importBatch = await ImportBatch.create({
      projectId: project._id,
      importBatchId,
      sourceFile: { filename: file.name, size: file.size, hash: fileHash },
      stats: {
        totalRows: excelData.length,
        totalCreated: results.created,
        totalFailed: results.failed,
        successRate: Math.round((results.created / excelData.length) * 100),
        byCategory: results.byCategory
      },
      results: results.resultDetails.slice(0, 1000),
      validationErrors: results.errors,
      validationWarnings: results.warnings,
      importedBy: req.user._id,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration: endTime - startTime,
      status: results.failed === 0 ? 'COMPLETED' : 'PARTIAL'
    });

    project.beneficiaryCount += results.created;
    project.importCount += 1;
    await project.save();

    res.status(results.failed === 0 ? 200 : 206).json({
      success: results.failed === 0,
      message: `${results.created}/${excelData.length} bénéficiaires importés`,
      importBatchId,
      stats: {
        totalRows: excelData.length,
        totalCreated: results.created,
        totalFailed: results.failed,
        totalSkipped: results.skipped,
        successRate: Math.round((results.created / excelData.length) * 100) + '%',
        byCategory: results.byCategory,
        duration: `${((endTime - startTime) / 1000).toFixed(2)}s`
      },
      errors: results.errors.slice(0, 20),
      warnings: results.warnings.slice(0, 20),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[IMPORT ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Erreur import',
      error: error.message
    });
  }
});

// ============================================================================
// GET ENDPOINTS
// ============================================================================

router.get('/', auth, async (req, res) => {
  try {
    const { projectId, limit = 50, skip = 0 } = req.query;
    let query = {};
    if (projectId) query.projectId = projectId;

    const total = await ImportBatch.countDocuments(query);
    const batches = await ImportBatch.find(query)
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.json({ success: true, total, count: batches.length, data: batches });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:batchId', auth, async (req, res) => {
  try {
    const batch = await ImportBatch.findOne({ importBatchId: req.params.batchId });
    if (!batch) return res.status(404).json({ success: false, message: 'Import non trouvé' });
    res.json({ success: true, data: batch });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
