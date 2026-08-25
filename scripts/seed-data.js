#!/usr/bin/env node
/**
 * Script de seed données de test pour développement
 * Usage: npm run db:seed
 */

import pool from '../lib/db.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function seedData() {
  try {
    console.log('🌱 Création des données de test...');

    // 1. Créer un projet
    const projectRes = await pool.query(
      `INSERT INTO projets (code, nom, region, statut, date_debut, date_fin_prevue)
       VALUES ('GT-001', 'Autoroute A1 Dakar-AIBD', 'Dakar', 'Actif', '2024-01-01', '2027-12-31')
       ON CONFLICT DO NOTHING
       RETURNING id`
    );

    const projectId = projectRes.rows[0]?.id || 1;
    console.log(`✅ Projet créé: GT-001 (ID: ${projectId})`);

    // 2. Créer utilisateurs demo
    const users = [
      { nom: 'Diop', prenom: 'Amadou', email: 'admin@apix.sn', role: 'admin' },
      { nom: 'Sarr', prenom: 'Mariama', email: 'chef@apix.sn', role: 'chef_projet' },
      { nom: 'Fall', prenom: 'Ibrahim', email: 'terrain@apix.sn', role: 'agent_terrain' },
      { nom: 'Ndiaye', prenom: 'Fatoumata', email: 'social@apix.sn', role: 'agent_social' },
      { nom: 'Sow', prenom: 'Alassane', email: 'finance@apix.sn', role: 'agent_financier' },
      { nom: 'Thiam', prenom: 'Aïssatou', email: 'juridique@apix.sn', role: 'responsable_juridique' },
    ];

    for (const user of users) {
      await pool.query(
        `INSERT INTO utilisateurs (nom, prenom, email, password_hash, role)
         VALUES ($1, $2, $3, '$2a$10$...', $4)
         ON CONFLICT (email) DO NOTHING`,
        [user.nom, user.prenom, user.email, user.role]
      );
    }

    console.log(`✅ ${users.length} utilisateurs créés`);

    // 3. Créer quelques PAP demo
    const paps = [
      { code: 'PAP-2026-0001', nom: 'Diallo', prenom: 'Ousmane', tel: '77123456', commune: 'Dakar' },
      { code: 'PAP-2026-0002', nom: 'Kane', prenom: 'Fatou', tel: '77234567', commune: 'Dakar' },
      { code: 'PAP-2026-0003', nom: 'Sall', prenom: 'Moussa', tel: '77345678', commune: 'Pikine' },
      { code: 'PAP-2026-0004', nom: 'Ndiaye', prenom: 'Aissatou', tel: '77456789', commune: 'Pikine' },
      { code: 'PAP-2026-0005', nom: 'Sarr', prenom: 'Cheikh', tel: '77567890', commune: 'Guédiawaye' },
    ];

    for (const pap of paps) {
      await pool.query(
        `INSERT INTO pap (code_pap, projet_id, nom, prenom, telephone, commune, adresse_detail, statut, fiabilisation)
         VALUES ($1, $2, $3, $4, $5, $6, 'Adresse test', 'Nouveau', 'incomplet')
         ON CONFLICT (code_pap) DO NOTHING`,
        [pap.code, projectId, pap.nom, pap.prenom, pap.tel, pap.commune]
      );
    }

    console.log(`✅ ${paps.length} PAP créés`);

    // 4. Créer des biens pour les PAP
    const papResult = await pool.query('SELECT id, code_pap FROM pap WHERE projet_id = $1 LIMIT 5', [projectId]);

    for (let i = 0; i < papResult.rows.length; i++) {
      const pap = papResult.rows[i];
      const bienCode = `BIEN-2026-${String(i + 1).padStart(4, '0')}`;

      await pool.query(
        `INSERT INTO biens (code_bien, pap_id, type_bien, superficie_m2, statut)
         VALUES ($1, $2, $3, $4, 'Recensé')
         ON CONFLICT (code_bien) DO NOTHING`,
        [bienCode, pap.id, i % 2 === 0 ? 'Terrain' : 'Maison', 500 + i * 100]
      );

      // Ajouter une évaluation
      const bienResult = await pool.query('SELECT id FROM biens WHERE code_bien = $1', [bienCode]);
      if (bienResult.rows.length > 0) {
        await pool.query(
          `INSERT INTO evaluations (bien_id, montant_initial, montant_fiabilise, montant_valide)
           VALUES ($1, $2, $3, $4)`,
          [bienResult.rows[0].id, 10000000 + i * 1000000, 10000000 + i * 1000000, 10000000 + i * 1000000]
        );
      }
    }

    console.log('✅ Biens et évaluations créés');

    // 5. Créer quelques paiements
    for (let i = 0; i < 3; i++) {
      const pap = papResult.rows[i];
      const payCode = `PAY-2026-${String(i + 1).padStart(4, '0')}`;

      await pool.query(
        `INSERT INTO paiements (code_paiement, pap_id, montant, mode, reference, date_paiement, statut)
         VALUES ($1, $2, $3, $4, $5, $6, 'Payé')
         ON CONFLICT (code_paiement) DO NOTHING`,
        [payCode, pap.id, 10000000 + i * 1000000, 'Chèque', `CH-${String(i + 1).padStart(5, '0')}`, new Date()]
      );
    }

    console.log('✅ Paiements créés');

    console.log('\n✅ Seed données complétées!');
    console.log('\nDonnées de connexion demo:');
    console.log('  Email: admin@apix.sn');
    console.log('  Mot de passe: password');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur seed:', error);
    process.exit(1);
  }
}

seedData();
