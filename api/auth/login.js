// Demo users (en production: utiliser une vraie base de données)
const demoUsers = {
  'admin@apix.sn': {
    id: 1,
    nom: 'Administrateur',
    prenom: 'APIX',
    email: 'admin@apix.sn',
    role: 'admin'
  },
  'chef@apix.sn': {
    id: 2,
    nom: 'Chef',
    prenom: 'Projet',
    email: 'chef@apix.sn',
    role: 'chef_projet'
  },
  'agent@apix.sn': {
    id: 3,
    nom: 'Agent',
    prenom: 'Terrain',
    email: 'agent@apix.sn',
    role: 'agent_terrain'
  }
};

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

  // Validation mot de passe (simplifié pour démo)
  // En production: utiliser bcrypt + base de données
  if (password !== 'password') {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }

  const user = demoUsers[email];
  if (!user) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }

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
}
