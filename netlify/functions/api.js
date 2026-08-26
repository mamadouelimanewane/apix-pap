exports.handler = async (event, context) => {
  const path = event.path || event.rawUrl?.split('?')[0] || '/';
  const method = event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : {};

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Auth routes
    if (path === '/api/auth/login' && method === 'POST') {
      const { email, password } = body;
      const users = {
        'admin@apix.sn': { nom: 'Administrateur', role: 'admin', password: 'password' },
        'chef@apix.sn': { nom: 'Chef Projet', role: 'chef_projet', password: 'password' },
        'agent@apix.sn': { nom: 'Agent Terrain', role: 'agent_terrain', password: 'password' }
      };

      const user = users[email];
      if (!user || user.password !== password) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Identifiants incorrects' })
        };
      }

      const token = Buffer.from(JSON.stringify({ email, nom: user.nom, role: user.role })).toString('base64');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          token,
          user: { email, nom: user.nom, role: user.role }
        })
      };
    }

    // PAP list
    if (path === '/api/pap/list' && method === 'GET') {
      const allPap = [
        { id: 1, code_pap: 'PAP-2026-0001', nom: 'Dia', prenom: 'Mamadou', telephone: '221783456789', commune: 'Dakar', statut: 'Payé', montant_valide: 5000000, montant_paye: 5000000 },
        { id: 2, code_pap: 'PAP-2026-0002', nom: 'Ndiaye', prenom: 'Fatou', telephone: '221781234567', commune: 'Thiès', statut: 'Évalué', montant_valide: 3000000, montant_paye: 0 },
        { id: 3, code_pap: 'PAP-2026-0003', nom: 'Sow', prenom: 'Ibrahim', telephone: '221789876543', commune: 'Kaolack', statut: 'Nouveau', montant_valide: 0, montant_paye: 0 }
      ];
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: allPap, total: 3, page: 1, pages: 1 })
      };
    }

    // Dashboard stats
    if (path === '/api/stats/dashboard' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          totalPap: 156,
          totalPaye: 125,
          totalValide: 150,
          totalReclames: 8,
          montantValide: 625000000,
          montantPaye: 580000000,
          enReclamation: 5,
          enConciliation: 3,
          tauxCompletion: 82
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route not found' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
