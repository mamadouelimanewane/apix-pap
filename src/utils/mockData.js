/**
 * Mock Data - Complete demo data for all pages
 * Used when backend is unavailable (Render 502 error)
 */

export const mockPAPs = [
  { id: '1', code_pap: 'PAP-001', nom: 'Diallo', prenom: 'Mamadou', email: 'mamadou@example.sn', telephone: '+221771234567', adresse: 'Pikine, Dakar', statut: 'Enregistré', phase: 'Registration', date_creation: '2026-08-01' },
  { id: '2', code_pap: 'PAP-002', nom: 'Ba', prenom: 'Fatou', email: 'fatou@example.sn', telephone: '+221772345678', adresse: 'Rufisque, Dakar', statut: 'Enregistré', phase: 'Evaluation', date_creation: '2026-08-02' },
  { id: '3', code_pap: 'PAP-003', nom: 'Sow', prenom: 'Amadou', email: 'amadou@example.sn', telephone: '+221773456789', adresse: 'Guédiawaye, Dakar', statut: 'En cours', phase: 'Compensation', date_creation: '2026-08-03' },
  { id: '4', code_pap: 'PAP-004', nom: 'Ndiaye', prenom: 'Moussa', email: 'moussa@example.sn', telephone: '+221774567890', adresse: 'Yeumbeul, Dakar', statut: 'Payé', phase: 'Payment', date_creation: '2026-08-04' },
  { id: '5', code_pap: 'PAP-005', nom: 'Sarr', prenom: 'Miriam', email: 'miriam@example.sn', telephone: '+221775678901', adresse: 'Plateau, Dakar', statut: 'Clôturé', phase: 'Closure', date_creation: '2026-08-05' }
];

export const mockBiens = [
  { id: '1', code_bien: 'BIEN-001', pap_id: '1', code_pap: 'PAP-001', pap_nom: 'Diallo', pap_prenom: 'Mamadou', type_bien: 'Terrain', superficie_m2: 500, localisation: 'Pikine', gps_lat: 14.7600, gps_lng: -17.1700, montant_initial: 5000000, statut: 'Évalué', phase: 'Evaluation' },
  { id: '2', code_bien: 'BIEN-002', pap_id: '2', code_pap: 'PAP-002', pap_nom: 'Ba', pap_prenom: 'Fatou', type_bien: 'Maison', superficie_m2: 250, localisation: 'Rufisque', gps_lat: 14.7167, gps_lng: -17.2667, montant_initial: 3000000, statut: 'Évalué', phase: 'Evaluation' },
  { id: '3', code_bien: 'BIEN-003', pap_id: '3', code_pap: 'PAP-003', pap_nom: 'Sow', pap_prenom: 'Amadou', type_bien: 'Commerce', superficie_m2: 80, localisation: 'Guédiawaye', gps_lat: 14.7500, gps_lng: -17.3000, montant_initial: 2000000, statut: 'Approuvé', phase: 'Compensation' },
  { id: '4', code_bien: 'BIEN-004', pap_id: '1', code_pap: 'PAP-001', pap_nom: 'Diallo', pap_prenom: 'Mamadou', type_bien: 'Terrain', superficie_m2: 1000, localisation: 'Dakar', gps_lat: 14.7610, gps_lng: -17.1710, montant_initial: 8000000, statut: 'Payé', phase: 'Payment' },
  { id: '5', code_bien: 'BIEN-005', pap_id: '4', code_pap: 'PAP-004', pap_nom: 'Ndiaye', pap_prenom: 'Moussa', type_bien: 'Maison', superficie_m2: 400, localisation: 'Yeumbeul', gps_lat: 14.7520, gps_lng: -17.3020, montant_initial: 4000000, statut: 'Payé', phase: 'Payment' }
];

export const mockEvaluations = [
  { id: '1', bien_id: '1', pap_id: '1', type_bien: 'Terrain', superficie: 500, montant_evalue: 5000000, montant_homologation: 4800000, etat_bien: 'Bon', date_evaluation: '2026-08-10', statut: 'Approuvé', phase: 'Evaluation' },
  { id: '2', bien_id: '2', pap_id: '2', type_bien: 'Maison', superficie: 250, montant_evalue: 3000000, montant_homologation: 2850000, etat_bien: 'Moyen', date_evaluation: '2026-08-11', statut: 'Approuvé', phase: 'Evaluation' },
  { id: '3', bien_id: '3', pap_id: '3', type_bien: 'Commerce', superficie: 80, montant_evalue: 2000000, montant_homologation: 1900000, etat_bien: 'Bon', date_evaluation: '2026-08-12', statut: 'Approuvé', phase: 'Evaluation' }
];

export const mockCompensations = [
  { id: '1', bien_id: '1', pap_id: '1', montant_homologation: 4800000, montant_propose: 4560000, montant_approuve: 4560000, justification: 'Montant évalué', date_proposition: '2026-08-15', date_approbation: '2026-08-18', statut: 'Approuvé', phase: 'Compensation' },
  { id: '2', bien_id: '2', pap_id: '2', montant_homologation: 2850000, montant_propose: 2707500, montant_approuve: 2707500, justification: 'Montant évalué', date_proposition: '2026-08-16', date_approbation: '2026-08-19', statut: 'Approuvé', phase: 'Compensation' },
  { id: '3', bien_id: '3', pap_id: '3', montant_homologation: 1900000, montant_propose: 1805000, montant_approuve: 1805000, justification: 'Montant évalué', date_proposition: '2026-08-17', date_approbation: '2026-08-20', statut: 'Approuvé', phase: 'Compensation' }
];

export const mockPayments = [
  { id: '1', bien_id: '1', pap_id: '1', montant: 4560000, montant_verse: 4560000, mode_paiement: 'Wave', date_initiation: '2026-08-20', date_execution: '2026-08-21', reference_transaction: 'REF-001', statut: 'Complété', phase: 'Payment' },
  { id: '2', bien_id: '2', pap_id: '2', montant: 2707500, montant_verse: 2707500, mode_paiement: 'Orange Money', date_initiation: '2026-08-21', date_execution: '2026-08-22', reference_transaction: 'REF-002', statut: 'Complété', phase: 'Payment' },
  { id: '3', bien_id: '3', pap_id: '3', montant: 1805000, montant_verse: 1805000, mode_paiement: 'Banque', date_initiation: '2026-08-22', date_execution: '2026-08-23', reference_transaction: 'REF-003', statut: 'En attente', phase: 'Payment' },
  { id: '4', bien_id: '4', pap_id: '1', montant: 7600000, montant_verse: 7600000, mode_paiement: 'Wave', date_initiation: '2026-08-23', date_execution: '2026-08-24', reference_transaction: 'REF-004', statut: 'Complété', phase: 'Payment' }
];

export const mockReclamations = [
  { id: '1', bien_id: '1', pap_id: '1', type_reclamation: 'Montant insuffisant', description: 'Montant évalué trop bas', date_reclamation: '2026-08-25', statut: 'Résolue', phase: 'Complaints' },
  { id: '2', bien_id: '2', pap_id: '2', type_reclamation: 'Délai prolongé', description: 'Traitement très lent', date_reclamation: '2026-08-26', statut: 'En cours', phase: 'Complaints' }
];

export default {
  mockPAPs,
  mockBiens,
  mockEvaluations,
  mockCompensations,
  mockPayments,
  mockReclamations
};
