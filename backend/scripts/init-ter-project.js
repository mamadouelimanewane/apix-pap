/**
 * INITIALIZE TER PROJECT
 * Créer le projet TER et son CategorySchema
 *
 * Usage:
 *   node scripts/init-ter-project.js
 *
 * Environment:
 *   MONGODB_URI=mongodb+srv://...
 */

const mongoose = require('mongoose');
require('dotenv').config();

const { Project, CategorySchema } = require('../models');

async function initTERProject() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apix_pap', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected');

    // Check if TER already exists
    let ter = await Project.findOne({ projectCode: 'TER' });

    if (ter) {
      console.log('⚠️  Projet TER déjà existant. Mise à jour...');
    } else {
      console.log('📂 Création du projet TER...');
      ter = await Project.create({
        projectCode: 'TER',
        projectName: 'Train Express Regional',
        description: 'Projet de compensation des bénéficiaires impactés par TER',
        config: {
          categories: ['EXPLOITANT PA'],
          hierarchyLevels: 4,
          defaultCurrency: 'FCFA',
          defaultRegion: 'Sénégal'
        },
        isActive: true
      });
      console.log('✅ Projet TER créé:', ter._id);
    }

    // Create/Update CategorySchema
    let terSchema = await CategorySchema.findOne({
      projectId: ter._id,
      categoryName: 'EXPLOITANT PA'
    });

    if (terSchema) {
      console.log('⚠️  CategorySchema EXPLOITANT PA déjà existant.');
    } else {
      console.log('📋 Création du CategorySchema EXPLOITANT PA...');
      terSchema = await CategorySchema.create({
        projectId: ter._id,
        categoryName: 'EXPLOITANT PA',
        schema: {
          common: [
            { field: 'code', type: 'String', required: true, description: 'Code unique PAP' },
            { field: 'firstName', type: 'String', required: true, description: 'Prénom' },
            { field: 'lastName', type: 'String', required: true, description: 'Nom' },
            { field: 'gender', type: 'String', description: 'Sexe (M/F)' },
            { field: 'nationality', type: 'String', description: 'Nationalité' },
            { field: 'email', type: 'String', description: 'Email' },
            { field: 'phone', type: 'String', description: 'Téléphone' }
          ],
          specific: [
            { field: 'businessStatus', type: 'String', description: 'Statut PA' },
            { field: 'businessType', type: 'String', description: 'Type de place' },
            { field: 'sectorActivity', type: 'String', description: 'Secteur activité' },
            { field: 'monthlyRevenue', type: 'Number', description: 'Revenu mensuel' },
            { field: 'revenueLoss', type: 'Number', description: 'Perte revenus' },
            { field: 'legalStatus', type: 'String', description: 'Statut juridique' },
            { field: 'propertyStatus', type: 'String', description: 'Statut propriété' },
            { field: 'totalArea', type: 'Number', description: 'Superficie totale m2' },
            { field: 'affectedArea', type: 'Number', description: 'Surface affectée m2' },
            { field: 'globalEvaluation', type: 'Number', description: 'Évaluation globale FCFA' }
          ],
          repeatable: [
            {
              sectionName: 'level',
              count: 4,
              fields: [
                { field: 'levelNumber', type: 'Number' },
                { field: 'levelName', type: 'String' },
                { field: 'builtArea', type: 'Number' },
                { field: 'foundations', type: 'String' },
                { field: 'elevation', type: 'String' },
                { field: 'roof', type: 'String' },
                { field: 'flooring', type: 'String' },
                { field: 'kitchenCovering', type: 'String' },
                { field: 'sanitaryFacilities', type: 'Number' },
                { field: 'electricity', type: 'Boolean' },
                { field: 'courtyard', type: 'Boolean' },
                { field: 'terrace', type: 'Boolean' },
                { field: 'evaluation', type: 'Number' },
                { field: 'loss', type: 'Number' }
              ]
            }
          ]
        },
        columnMapping: new Map([
          ['CODE PAP', 'code'],
          ['Prénom de la PAP', 'firstName'],
          ['Nom de la PAP', 'lastName'],
          ['Sexe', 'gender'],
          ['Nationalité', 'nationality'],
          ['Email', 'email'],
          ['Telephone 1_1', 'phone'],
          ['Statut de PA', 'businessStatus'],
          ['Type de place d\'affaires', 'businessType'],
          ['Secteur d\'activité', 'sectorActivity'],
          ['Revenu mensuel', 'monthlyRevenue'],
          ['Perte de revenus de la place d\'affaires', 'revenueLoss'],
          ['Statut juridique de la place d\'affaires', 'legalStatus'],
          ['Statut de PA', 'propertyStatus'],
          ['Superficie totale', 'totalArea'],
          ['Surface affectée', 'affectedArea'],
          ['Evaluation globale', 'globalEvaluation']
        ])
      });
      console.log('✅ CategorySchema EXPLOITANT PA créé:', terSchema._id);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ TER PROJECT INITIALIZATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`Project ID: ${ter._id}`);
    console.log(`Project Code: ${ter.projectCode}`);
    console.log(`Categories: ${ter.config.categories.join(', ')}`);
    console.log(`Hierarchy Levels: ${ter.config.hierarchyLevels}`);
    console.log(`\nCategorySchema EXPLOITANT PA:`);
    console.log(`  ID: ${terSchema._id}`);
    console.log(`  Common fields: ${terSchema.schema.common.length}`);
    console.log(`  Specific fields: ${terSchema.schema.specific.length}`);
    console.log(`  Repeatable sections: ${terSchema.schema.repeatable.length}`);
    console.log('\n✅ Ready to import BDD_TC_APIX_29032022 VF.xlsx');

    process.exit(0);

  } catch (error) {
    console.error('❌ Initialization Error:', error);
    process.exit(1);
  }
}

initTERProject();
