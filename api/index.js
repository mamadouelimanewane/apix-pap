export default async (req, res) => {
  const { method, url, body } = req;
  const path = url.split('?')[0];

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // PAP List
    if (path === '/api/pap/list' && method === 'GET') {
      return res.json({
        data: [
          { id: 1, code_pap: 'PAP-2026-0001', nom: 'Dia', prenom: 'Mamadou', telephone: '221783456789', commune: 'Dakar', statut: 'Payé', montant_valide: 5000000, montant_paye: 5000000 },
          { id: 2, code_pap: 'PAP-2026-0002', nom: 'Ndiaye', prenom: 'Fatou', telephone: '221781234567', commune: 'Thiès', statut: 'Évalué', montant_valide: 3000000, montant_paye: 0 },
          { id: 3, code_pap: 'PAP-2026-0003', nom: 'Sow', prenom: 'Ibrahim', telephone: '221789876543', commune: 'Kaolack', statut: 'Nouveau', montant_valide: 0, montant_paye: 0 }
        ],
        total: 3,
        page: 1,
        pages: 1
      });
    }

    // Dashboard Stats
    if (path === '/api/stats/dashboard' && method === 'GET') {
      return res.json({
        totalPap: 156,
        totalPaye: 125,
        totalValide: 150,
        totalReclames: 8,
        montantValide: 625000000,
        montantPaye: 580000000,
        enReclamation: 5,
        enConciliation: 3,
        tauxCompletion: 82
      });
    }

    return res.status(404).json({ error: 'Route not found' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
