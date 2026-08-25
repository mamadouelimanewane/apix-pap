import pool from '../../lib/db.js';

/**
 * POST /api/auth/login
 * Authentifie un utilisateur et retourne JWT
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et password requis' });
  }

  try {
    // Récupérer utilisateur
    const result = await pool.query(
      `SELECT id, nom, prenom, email, role, actif
       FROM utilisateurs
       WHERE email = $1 AND actif = true`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const user = result.rows[0];

    // Validation mot de passe (simplifié pour démo)
    // En production: utiliser bcrypt
    if (password !== 'password') {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    // Mettre à jour dernière connexion
    await pool.query(
      'UPDATE utilisateurs SET derniere_connexion = NOW() WHERE id = $1',
      [user.id]
    );

    // Générer JWT simplifié (en production: utiliser jsonwebtoken)
    const token = Buffer.from(JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 // 24h
    })).toString('base64');

    return res.status(200).json({
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
