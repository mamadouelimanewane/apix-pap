import pool from '../../lib/db.js';

/**
 * POST /api/documents/upload
 * Enregistre une référence document (upload simplifié)
 * En production: utiliser Vercel Blob ou S3
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pap_id, type_document, nom_fichier, url, taille_ko } = req.body;

  if (!pap_id || !type_document || !nom_fichier || !url) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO documents (pap_id, type_document, nom_fichier, url, taille_ko, uploade_le)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [pap_id, type_document, nom_fichier, url, taille_ko || 0]
    );

    return res.status(201).json({
      message: 'Document enregistré',
      document: result.rows[0]
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
