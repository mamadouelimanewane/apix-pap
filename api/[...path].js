// Centralized API Handler - Remplace les 16+ fichiers séparés
export default async (req, res) => {
  const { method } = req;
  const path = req.url.split('?')[0];

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') return res.status(200).end();

  try {
    // === AUTH ===
    if (path === '/api/auth/login' && method === 'POST') {
      const { email, password } = JSON.parse(req.body || '{}');
      const users = {
        'admin@apix.sn': { nom: 'Administrateur', role: 'admin', password: 'password' },
        'chef@apix.sn': { nom: 'Chef Projet', role: 'chef_projet', password: 'password' },
        'agent@apix.sn': { nom: 'Agent Terrain', role: 'agent_terrain', password: 'password' }
      };
      const user = users[email];
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Identifiants incorrects' });
      }
      const token = Buffer.from(JSON.stringify({ email, nom: user.nom, role: user.role })).toString('base64');
      return res.json({ token, user: { email, nom: user.nom, role: user.role } });
    }

    // === PAP ===
    if (path === '/api/pap/list' && method === 'GET') {
      return res.json({
        data: [
          { id: 1, code_pap: 'PAP-2026-0001', nom: 'Dia', prenom: 'Mamadou', telephone: '221783456789', commune: 'Dakar', statut: 'Payé', montant_valide: 5000000, montant_paye: 5000000 },
          { id: 2, code_pap: 'PAP-2026-0002', nom: 'Ndiaye', prenom: 'Fatou', telephone: '221781234567', commune: 'Thiès', statut: 'Évalué', montant_valide: 3000000, montant_paye: 0 },
          { id: 3, code_pap: 'PAP-2026-0003', nom: 'Sow', prenom: 'Ibrahim', telephone: '221789876543', commune: 'Kaolack', statut: 'Nouveau', montant_valide: 0, montant_paye: 0 }
        ],
        total: 3, page: 1, pages: 1
      });
    }

    if (path.startsWith('/api/pap/') && !path.includes('/list') && method === 'GET') {
      const id = path.split('/').pop();
      return res.json({
        id: parseInt(id), code_pap: `PAP-2026-000${id}`, nom: 'Dia', prenom: 'Mamadou',
        telephone: '221783456789', email: 'dia@example.com', commune: 'Dakar', statut: 'Payé'
      });
    }

    if (path === '/api/pap/create' && method === 'POST') {
      return res.json({ code_pap: 'PAP-2026-0004', success: true });
    }

    // === STATS ===
    if (path === '/api/stats/dashboard' && method === 'GET') {
      return res.json({
        totalPap: 156, totalPaye: 125, totalValide: 150, totalReclames: 8,
        montantValide: 625000000, montantPaye: 580000000, enReclamation: 5,
        enConciliation: 3, tauxCompletion: 82
      });
    }

    // === BIENS ===
    if (path === '/api/biens/list' && method === 'GET') {
      return res.json({
        data: [
          { id: 1, code_bien: 'BIEN-2026-0001', type_bien: 'Terrain', superficie: 500, prix_m2: 50000 },
          { id: 2, code_bien: 'BIEN-2026-0002', type_bien: 'Maison', superficie: 250, prix_m2: 100000 }
        ]
      });
    }

    if (path === '/api/biens/create' && method === 'POST') {
      return res.json({ code_bien: 'BIEN-2026-0003', success: true });
    }

    // === EVALUATIONS ===
    if (path === '/api/evaluations/list' && method === 'GET') {
      return res.json({ data: [] });
    }

    if (path === '/api/evaluations/create' && method === 'POST') {
      return res.json({ code_eval: 'EVAL-2026-0001', success: true });
    }

    // === PAIEMENTS ===
    if (path === '/api/paiements/list' && method === 'GET') {
      return res.json({
        data: [
          { id: 1, code_paiement: 'PAY-2026-0001', montant: 5000000, mode: 'Virement', statut: 'Payé' }
        ]
      });
    }

    if (path === '/api/paiements/create' && method === 'POST') {
      return res.json({ code_paiement: 'PAY-2026-0002', success: true });
    }

    // === DOCUMENTS ===
    if (path === '/api/documents/list' && method === 'GET') {
      return res.json({ data: [] });
    }

    // === RECLAMATIONS ===
    if (path === '/api/reclamations/list' && method === 'GET') {
      return res.json({ data: [] });
    }

    if (path === '/api/reclamations/create' && method === 'POST') {
      return res.json({ code_reclamation: 'REC-2026-0001', success: true });
    }

    // === CONCILIATIONS ===
    if (path === '/api/conciliations/create' && method === 'POST') {
      return res.json({ success: true });
    }

    return res.status(404).json({ error: 'Route not found' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
