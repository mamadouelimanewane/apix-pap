#!/usr/bin/env node
/**
 * Script d'import de PAP depuis un fichier Excel existant
 * Usage: npm run db:import-excel -- --file=data/pap.xlsx --projet=GT-001
 */

import readXlsxFile from 'read-excel-file/node';
import pool from '../lib/db.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const generateCodePAP = (index) => `PAP-${new Date().getFullYear()}-${String(index + 1).padStart(4, '0')}`;
const generateCodeBien = (index) => `BIEN-${new Date().getFullYear()}-${String(index + 1).padStart(4, '0')}`;

async function importExcel(filePath, projetCode) {
  console.log(`📂 Lecture du fichier: ${filePath}`);

  try {
    const rows = await readXlsxFile(filePath);

    // Supposer que la première ligne est l'en-tête
    const headers = rows[0];
    const data = rows.slice(1);

    console.log(`📊 ${data.length} enregistrements trouvés`);

    // Mapper les colonnes Excel vers les champs DB
    const mapColumns = (row) => ({
      nom: row[headers.indexOf('Nom')] || '',
      prenom: row[headers.indexOf('Prénom')] || '',
      telephone: row[headers.indexOf('Téléphone')] || '',
      cni: row[headers.indexOf('CNI')] || '',
      commune: row[headers.indexOf('Commune')] || '',
      adresse: row[headers.indexOf('Adresse')] || '',
      type_bien: row[headers.indexOf('Type Bien')] || 'Terrain',
      superficie: parseFloat(row[headers.indexOf('Superficie (m²)')] || 0),
      montant_initial: parseInt(row[headers.indexOf('Montant Initial')] || 0),
    });

    // Récupérer le projet
    const projectResult = await pool.query(
      'SELECT id FROM projets WHERE code = $1',
      [projetCode]
    );

    if (projectResult.rows.length === 0) {
      throw new Error(`❌ Projet ${projetCode} non trouvé`);
    }

    const projectId = projectResult.rows[0].id;

    // Vérifier les doublons
    let duplicates = 0;
    for (const row of data) {
      const mapped = mapColumns(row);
      const existant = await pool.query(
        'SELECT code_pap FROM pap WHERE telephone = $1 AND projet_id = $2 LIMIT 1',
        [mapped.telephone, projectId]
      );
      if (existant.rows.length > 0) {
        duplicates++;
        console.warn(`⚠️  Doublon détecté: ${mapped.nom} ${mapped.prenom} (${mapped.telephone}) → ${existant.rows[0].code_pap}`);
      }
    }

    if (duplicates > 0) {
      console.log(`\n⚠️  ${duplicates} doublon(s) trouvé(s). Continuer? (oui/non)`);
      // En mode non-interactif, continuer
    }

    // Importer
    let success = 0;
    let errors = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const mapped = mapColumns(row);

      try {
        const codePAP = generateCodePAP(i);

        // Vérifier doublon
        const existing = await pool.query(
          'SELECT id FROM pap WHERE telephone = $1 AND projet_id = $2 LIMIT 1',
          [mapped.telephone, projectId]
        );

        if (existing.rows.length > 0) {
          console.log(`⏭️  Sauter (doublon): ${codePAP}`);
          continue;
        }

        // Insérer PAP
        const papResult = await pool.query(
          `INSERT INTO pap (code_pap, projet_id, nom, prenom, telephone, cni, commune, adresse_detail, statut)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Nouveau')
           RETURNING id`,
          [codePAP, projectId, mapped.nom, mapped.prenom, mapped.telephone, mapped.cni, mapped.commune, mapped.adresse]
        );

        const papId = papResult.rows[0].id;

        // Insérer bien associé
        const codeBien = generateCodeBien(i);
        await pool.query(
          `INSERT INTO biens (code_bien, pap_id, type_bien, superficie_m2, statut)
           VALUES ($1, $2, $3, $4, 'Recensé')`,
          [codeBien, papId, mapped.type_bien, mapped.superficie]
        );

        // Insérer évaluation
        if (mapped.montant_initial > 0) {
          const bienResult = await pool.query('SELECT id FROM biens WHERE pap_id = $1 LIMIT 1', [papId]);
          const bienId = bienResult.rows[0].id;

          await pool.query(
            `INSERT INTO evaluations (bien_id, montant_initial, montant_fiabilise)
             VALUES ($1, $2, $3)`,
            [bienId, mapped.montant_initial, mapped.montant_initial]
          );
        }

        success++;
        if ((i + 1) % 50 === 0) {
          console.log(`✅ ${i + 1}/${data.length} importés...`);
        }
      } catch (error) {
        errors++;
        console.error(`❌ Erreur ligne ${i + 1}:`, error.message);
      }
    }

    console.log(`\n✅ Import terminé: ${success} PAP créés, ${errors} erreurs`);
    process.exit(errors > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Erreur d\'import:', error);
    process.exit(1);
  }
}

// Parser arguments
const args = process.argv.slice(2);
const filePath = args.find(a => a.startsWith('--file='))?.split('=')[1] || process.env.IMPORT_EXCEL_PATH || './data/pap.xlsx';
const projetCode = args.find(a => a.startsWith('--projet='))?.split('=')[1] || process.env.DEFAULT_PROJET_CODE || 'GT-001';

importExcel(filePath, projetCode);
