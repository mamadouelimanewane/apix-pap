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

    // === PHASE 2: CARTOGRAPHIE ===
    if (path === '/api/cartographie' && method === 'GET') {
      return res.json({
        paps: [
          { id: 1, code: 'PAP-2026-001', lat: 14.7125, lng: -17.4676, nom: 'Dia Mamadou', statut: 'Payé', zone: 'Dakar Centre' },
          { id: 2, code: 'PAP-2026-002', lat: 14.7150, lng: -17.4650, nom: 'Ndiaye Assane', statut: 'Évalué', zone: 'Dakar Centre' },
          { id: 3, code: 'PAP-2026-003', lat: 14.7200, lng: -17.4600, nom: 'Sall Aïssatou', statut: 'Nouveau', zone: 'Thiès' },
          { id: 4, code: 'PAP-2026-004', lat: 14.7175, lng: -17.4625, nom: 'Ba Mohamed', statut: 'Payé', zone: 'Dakar Centre' }
        ],
        zones: [
          { id: 1, nom: 'Dakar Centre', lat: 14.7125, lng: -17.4676, radius: 2000 },
          { id: 2, nom: 'Thiès', lat: 14.7200, lng: -17.4600, radius: 3000 }
        ],
        stats: { totalPap: 156, affichage: 4, zones: 2, clusters: 5 }
      });
    }

    // === PHASE 2: CADASTRE ===
    if (path === '/api/cadastre' && method === 'GET') {
      return res.json({
        parcelles: [
          { id: 1, numero: 'RT-001-456', proprietaire: 'Dia Mamadou', superficie: 500, valeur: 12500000, titre: 'Titré régulier', documents: 3, statut: 'Validé' },
          { id: 2, numero: 'RT-001-457', proprietaire: 'Ndiaye Assane', superficie: 350, valeur: 8750000, titre: 'Titré régulier', documents: 2, statut: 'Validé' },
          { id: 3, numero: 'RT-002-123', proprietaire: 'Sall Aïssatou', superficie: 750, valeur: 15000000, titre: 'Immatriculé', documents: 4, statut: 'À vérifier' }
        ],
        total: 156, valides: 145, aVerifier: 11
      });
    }

    // === PHASE 2: IMPENSÉS ===
    if (path === '/api/impenses' && method === 'GET') {
      return res.json({
        impenses: [
          { id: 1, categorie: 'Dommages bâtiment', montant: 5200000, statut: 'Approuvé', date: '2026-07-15', agent: 'Ndiaye Assane', justification: 'Dégâts aux fondations' },
          { id: 2, categorie: 'Arrêt d\'activité', montant: 3100000, statut: 'En attente', date: '2026-07-20', agent: 'Ba Mohamed', justification: 'Interruption commerce 3 mois' },
          { id: 3, categorie: 'Relocation temporaire', montant: 4200000, statut: 'En attente', date: '2026-07-22', agent: 'Sall Aïssatou', justification: 'Frais d\'hébergement' },
          { id: 4, categorie: 'Perte récolte', montant: 2800000, statut: 'Rejeté', date: '2026-07-10', agent: 'Dia Mamadou', justification: 'Documentation insuffisante' }
        ],
        stats: { total: 15000000, approuves: 5200000, enAttente: 7300000, taux: 35 }
      });
    }

    // === PHASE 2: DÉDOMMAGEMENT ===
    if (path === '/api/dedommagement' && method === 'GET') {
      return res.json({
        bareme: [
          { type: 'Terrain nu', base: 'm² × prix local', montant: '50K-100K/m²' },
          { type: 'Maison', base: 'Evaluation + 20%', montant: '10-20M' },
          { type: 'Bétail', base: 'Valeur marché', montant: '500K-1M/tête' },
          { type: 'Récolte', base: 'Rendement × prix', montant: '2-5M/hectare' }
        ],
        paps: [
          { id: 1, code: 'PAP-2026-001', nom: 'Dia Mamadou', bien: 'Maison', montantCadastre: 12500000, montantOffre: 4500000 },
          { id: 2, code: 'PAP-2026-002', nom: 'Ndiaye Assane', bien: 'Terrain', montantCadastre: 8000000, montantOffre: 3200000 },
          { id: 3, code: 'PAP-2026-003', nom: 'Sall Aïssatou', bien: 'Maison+Terrain', montantCadastre: 15000000, montantOffre: 5000000 }
        ]
      });
    }

    // === PHASE 2: TRAVAUX ===
    if (path === '/api/travaux' && method === 'GET') {
      return res.json({
        phases: [
          { id: 1, nom: 'Terrassement', progression: 100, datedebut: '01.08.2026', datefin: '30.09.2026', statut: 'Complété' },
          { id: 2, nom: 'Fondations & Structures', progression: 50, datedebut: '15.09.2026', datefin: '31.10.2026', statut: 'En cours' },
          { id: 3, nom: 'Routes & Raccordements', progression: 0, datedebut: '01.11.2026', datefin: '15.12.2026', statut: 'Planifié' },
          { id: 4, nom: 'Finitions & Tests', progression: 0, datedebut: '01.12.2026', datefin: '31.12.2026', statut: 'Planifié' }
        ],
        incidents: [
          { id: 1, date: '15.07.2026', type: 'Retard', description: 'Livraison matériaux retardée de 5 jours', impact: 'Modéré' },
          { id: 2, date: '22.07.2026', type: 'Dommages', description: 'Dégâts à infrastructure existante', impact: 'Critique' },
          { id: 3, date: '28.07.2026', type: 'Accident', description: 'Incident mineur sur le chantier', impact: 'Faible' }
        ],
        photos: 3
      });
    }

    // === PHASE 2: TERRAIN ===
    if (path === '/api/terrain' && method === 'GET') {
      return res.json({
        agents: [
          { id: 1, nom: 'Ndiaye Assane', jour: 'Lundi', papCount: 5, distance: '25km', status: 'En cours' },
          { id: 2, nom: 'Ba Mohamed', jour: 'Lundi', papCount: 4, distance: '18km', status: 'Complété' },
          { id: 3, nom: 'Sall Aïssatou', jour: 'Mardi', papCount: 6, distance: '32km', status: 'Planifié' }
        ],
        itineraires: [
          { heure: '08:30', pap: 'PAP-001', lieu: 'Dakar Centre', nom: 'Dia Mamadou', action: 'Visite', statut: 'Complété' },
          { heure: '09:15', pap: 'PAP-005', lieu: 'Dakar Centre', nom: 'Ndiaye Aïda', action: 'Signature', statut: 'Complété' },
          { heure: '10:30', pap: 'PAP-012', lieu: 'Thiès', nom: 'Seck Malick', action: 'Évaluation', statut: 'En cours' }
        ]
      });
    }

    // === PHASE 2: RECOURS ===
    if (path === '/api/recours' && method === 'GET') {
      return res.json({
        recours: [
          { id: 1, code: 'REC-2026-001', pap: 'PAP-2026-001', nom: 'Dia Mamadou', dateReclamation: '15.07.2026', motif: 'Sous-évaluation montant', montantRevendique: 12500000, montantOffre: 4500000, statut: 'Commission en cours', delaiRestant: '12 jours' },
          { id: 2, code: 'REC-2026-002', pap: 'PAP-2026-005', nom: 'Ndiaye Assane', dateReclamation: '18.07.2026', motif: 'Non-reconnaissance bien', montantRevendique: 8000000, montantOffre: 2500000, statut: 'Décision rendue', delaiRestant: '0 jours' },
          { id: 3, code: 'REC-2026-003', pap: 'PAP-2026-012', nom: 'Sall Aïssatou', dateReclamation: '22.07.2026', motif: 'Erreur identification bien', montantRevendique: 5000000, montantOffre: 3200000, statut: 'Appel déposé', delaiRestant: '25 jours' }
        ],
        stats: { total: 3, enCours: 1, termines: 1, delaiMoyen: 18 }
      });
    }

    // === PHASE 2: COMPENSATION KPI ===
    if (path === '/api/compensation-kpi' && method === 'GET') {
      return res.json({
        kpi: {
          paps_total: 156,
          paps_payes: 125,
          paps_paye_pct: 80,
          montant_total: 580000000,
          montant_moyen: 4600000,
          montant_paye: 580000000,
          delai_moyen: 18
        },
        distribution: [
          { region: 'Dakar', papes: 65, payes: 52, pct: 80, montant: 240000000, cadast: 812000000, risque: 'Critique' },
          { region: 'Thiès', papes: 45, payes: 40, pct: 89, montant: 200000000, cadast: 414000000, risque: 'Modéré' },
          { region: 'Kaolack', papes: 46, payes: 33, pct: 72, montant: 140000000, cadast: 404000000, risque: 'Faible' }
        ],
        timeline: [
          { jour: 'Sem 1', papes: 15, montant: 45000000 },
          { jour: 'Sem 2', papes: 22, montant: 88000000 },
          { jour: 'Sem 3', papes: 31, montant: 142000000 },
          { jour: 'Sem 4', papes: 28, montant: 138000000 },
          { jour: 'Sem 5', papes: 29, montant: 167000000 }
        ]
      });
    }

    // === ACQUISITION DOCUMENTS OCR ===
    if (path === '/api/documents/ocr' && method === 'POST') {
      const body = JSON.parse(req.body || '{}');
      return res.json({
        id: Date.now(),
        name: body.documentType,
        date: new Date().toISOString(),
        quality: {
          resolution: Math.random() * 20 + 80,
          lighting: Math.random() * 20 + 80,
          clarity: Math.random() * 20 + 80,
          tilt: Math.random() * 20 + 80
        },
        data: body.extractedData || {},
        status: 'success'
      });
    }

    if (path === '/api/documents/ocr/list' && method === 'GET') {
      return res.json({
        documents: [
          { id: 1, name: 'cni_2026-08-20', type: 'cni', date: '2026-08-20', quality: 88 },
          { id: 2, name: 'titre_propriete_2026-08-19', type: 'titre_propriete', date: '2026-08-19', quality: 92 },
          { id: 3, name: 'passport_2026-08-15', type: 'passport', date: '2026-08-15', quality: 85 }
        ],
        total: 3
      });
    }

    return res.status(404).json({ error: 'Route not found' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
