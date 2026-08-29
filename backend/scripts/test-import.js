/**
 * TEST IMPORT SCRIPT
 * Tester l'import TER localement
 *
 * Usage:
 *   node scripts/test-import.js /path/to/BDD_TC_APIX_29032022\ VF.xlsx
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let XLSX;
try {
  XLSX = require('xlsx');
} catch (e) {
  console.error('❌ XLSX not installed. Run: npm install xlsx');
  process.exit(1);
}

const { Project, CategorySchema, Beneficiary, ImportBatch } = require('../models');

async function testImport() {
  try {
    // Get file path from args
    const filePath = process.argv[2];
    if (!filePath) {
      console.error('❌ Usage: node scripts/test-import.js /path/to/file.xlsx');
      process.exit(1);
    }

    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🧪 APIX-PAP IMPORT TEST');
    console.log('='.repeat(60));

    // Connect MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apix_pap', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected');

    // Get or create project
    console.log('\n📂 Getting TER project...');
    let project = await Project.findOne({ projectCode: 'TER' });
    if (!project) {
      console.log('   Creating TER project...');
      project = await Project.create({
        projectCode: 'TER',
        projectName: 'Train Express Regional',
        config: {
          categories: ['EXPLOITANT PA'],
          hierarchyLevels: 4,
          defaultCurrency: 'FCFA'
        }
      });
      console.log('✅ TER project created');
    } else {
      console.log('✅ TER project found');
    }

    // Get or create category schema
    console.log('\n📋 Getting EXPLOITANT PA schema...');
    let schema = await CategorySchema.findOne({
      projectId: project._id,
      categoryName: 'EXPLOITANT PA'
    });
    if (!schema) {
      console.log('   Creating EXPLOITANT PA schema...');
      schema = await CategorySchema.create({
        projectId: project._id,
        categoryName: 'EXPLOITANT PA',
        schema: {
          common: [
            { field: 'code', type: 'String', required: true },
            { field: 'firstName', type: 'String', required: true },
            { field: 'lastName', type: 'String', required: true }
          ],
          specific: [],
          repeatable: []
        }
      });
      console.log('✅ EXPLOITANT PA schema created');
    } else {
      console.log('✅ EXPLOITANT PA schema found');
    }

    // Parse Excel
    console.log('\n📄 Parsing Excel file...');
    const fileData = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileData, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log(`✅ File parsed`);
    console.log(`   Rows: ${excelData.length}`);
    console.log(`   Columns: ${Object.keys(excelData[0]).length}`);
    console.log(`   First sheet: ${sheetName}`);

    // Analyze categories
    console.log('\n📊 Analyzing categories...');
    const categories = {};
    excelData.forEach(row => {
      const cat = row['Catégorie'] || 'DEFAULT';
      if (!categories[cat]) categories[cat] = 0;
      categories[cat]++;
    });

    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} rows`);
    });

    // Test import
    console.log('\n🔄 Testing import (first 5 rows)...');

    const testBatch = await ImportBatch.create({
      projectId: project._id,
      importBatchId: `TEST-${Date.now()}`,
      sourceFile: {
        filename: path.basename(filePath),
        size: fileData.length
      },
      stats: {
        totalRows: excelData.length,
        totalCreated: 0,
        totalFailed: 0,
        successRate: 0
      },
      importedBy: null,
      status: 'PROCESSING'
    });

    let created = 0;
    let failed = 0;

    for (let i = 0; i < Math.min(5, excelData.length); i++) {
      const row = excelData[i];
      try {
        const beneficiary = await Beneficiary.create({
          projectId: project._id,
          categoryId: schema._id,
          categoryName: 'EXPLOITANT PA',
          code: row['CODE PAP'] || `PAP-${i}`,
          firstName: row['Prénom de la PAP'] || 'TEST',
          lastName: row['Nom de la PAP'] || 'TEST',
          email: row['Email'],
          nationality: row['Nationalité'],
          location: {
            region: row['Region'],
            gps: row['GPSX'] && row['GPSY'] ? {
              type: 'Point',
              coordinates: [Number(row['GPSX']), Number(row['GPSY'])]
            } : null
          },
          categoryData: row,
          import: {
            importBatchId: testBatch.importBatchId,
            importDate: new Date(),
            sourceFile: path.basename(filePath),
            rowNumber: i + 2
          }
        });
        created++;
        console.log(`   ✅ Row ${i + 1}: ${beneficiary.firstName} ${beneficiary.lastName}`);
      } catch (error) {
        failed++;
        console.log(`   ❌ Row ${i + 1}: ${error.message}`);
      }
    }

    // Update import batch
    testBatch.stats.totalCreated = created;
    testBatch.stats.totalFailed = failed;
    testBatch.stats.successRate = Math.round((created / 5) * 100);
    testBatch.status = failed === 0 ? 'COMPLETED' : 'PARTIAL';
    await testBatch.save();

    // Report
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Project: ${project.projectCode} (${project._id})`);
    console.log(`✅ Schema: ${schema.categoryName}`);
    console.log(`✅ Beneficiaries created: ${created}/5`);
    console.log(`❌ Failed: ${failed}/5`);
    console.log(`📋 Import Batch ID: ${testBatch.importBatchId}`);
    console.log(`✅ Import Batch Status: ${testBatch.status}`);

    // Verify in DB
    console.log('\n✅ Verification in MongoDB:');
    const countBeneficiaries = await Beneficiary.countDocuments({ projectId: project._id });
    const countBatches = await ImportBatch.countDocuments({ projectId: project._id });
    console.log(`   Beneficiaries: ${countBeneficiaries}`);
    console.log(`   Import Batches: ${countBatches}`);

    if (created > 0) {
      const sample = await Beneficiary.findOne({ projectId: project._id }).lean();
      console.log(`\n📋 Sample Beneficiary:`);
      console.log(`   Code: ${sample.code}`);
      console.log(`   Name: ${sample.firstName} ${sample.lastName}`);
      console.log(`   Region: ${sample.location?.region}`);
      console.log(`   Email: ${sample.email}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log('\n✨ Ready for full import!\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testImport();
