/**
 * Workflow Service - Gestion des workflows PAP
 * Persiste les dossiers avec états et transitions
 */

const STORAGE_KEY = 'apix_pap_workflows';

export const WORKFLOW_STATES = {
  // Phase 1: Registration
  REGISTERED: 'registered',
  DOCUMENTED: 'documented',

  // Phase 2: Property Assessment
  PROPERTIES_LISTED: 'properties_listed',
  EVALUATED: 'evaluated',
  REJECTED_EVALUATION: 'rejected_evaluation',

  // Phase 3: Compensation
  COMPENSATED: 'compensated',
  COMPENSATION_APPROVED: 'compensation_approved',
  COMPENSATION_REJECTED: 'compensation_rejected',

  // Phase 4: Payment
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_CONFIRMED: 'payment_confirmed',
  PAYMENT_COMPLETED: 'payment_completed',

  // Phase 5: Complaints
  COMPLAINTS_RESOLVED: 'complaints_resolved',

  // Phase 6: Closure
  CLOSED: 'closed'
};

export const WORKFLOW_PHASES = {
  PHASE_1: { id: 1, name: 'Enregistrement PAP', state: WORKFLOW_STATES.REGISTERED },
  PHASE_2: { id: 2, name: 'Évaluation Biens', state: WORKFLOW_STATES.EVALUATED },
  PHASE_3: { id: 3, name: 'Compensation', state: WORKFLOW_STATES.COMPENSATED },
  PHASE_4: { id: 4, name: 'Paiement', state: WORKFLOW_STATES.PAYMENT_COMPLETED },
  PHASE_5: { id: 5, name: 'Réclamations', state: WORKFLOW_STATES.COMPLAINTS_RESOLVED },
  PHASE_6: { id: 6, name: 'Clôture', state: WORKFLOW_STATES.CLOSED }
};

class WorkflowService {
  constructor() {
    this.workflows = this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading workflows from storage:', error);
      return {};
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.workflows));
    } catch (error) {
      console.error('Error saving workflows to storage:', error);
    }
  }

  /**
   * Créer un nouveau workflow pour un PAP
   */
  createWorkflow(papCode, papData) {
    const workflow = {
      papCode,
      papName: papData.nom,
      createdAt: new Date().toISOString(),
      currentPhase: 1,
      currentState: WORKFLOW_STATES.REGISTERED,
      history: [
        {
          phase: 1,
          state: WORKFLOW_STATES.REGISTERED,
          timestamp: new Date().toISOString(),
          action: 'Dossier enregistré',
          userId: 'system'
        }
      ],
      data: {
        phase1: { ...papData },
        phase2: null,
        phase3: null,
        phase4: null,
        phase5: null,
        phase6: null
      },
      status: 'in_progress'
    };

    this.workflows[papCode] = workflow;
    this.saveToStorage();
    return workflow;
  }

  /**
   * Mettre à jour le workflow avec nouvelle transition
   */
  updateWorkflow(papCode, phaseNumber, stateKey, data = {}) {
    const workflow = this.workflows[papCode];
    if (!workflow) {
      throw new Error(`Workflow not found for PAP: ${papCode}`);
    }

    const newState = WORKFLOW_STATES[stateKey];
    if (!newState) {
      throw new Error(`Invalid workflow state: ${stateKey}`);
    }

    // Update phase data
    const phaseKey = `phase${phaseNumber}`;
    workflow.data[phaseKey] = { ...workflow.data[phaseKey], ...data, updatedAt: new Date().toISOString() };

    // Update current state
    workflow.currentPhase = Math.max(workflow.currentPhase, phaseNumber);
    workflow.currentState = newState;

    // Add to history
    workflow.history.push({
      phase: phaseNumber,
      state: newState,
      timestamp: new Date().toISOString(),
      action: this.getActionLabel(stateKey),
      userId: data.userId || 'system'
    });

    this.saveToStorage();
    return workflow;
  }

  /**
   * Obtenir un workflow
   */
  getWorkflow(papCode) {
    return this.workflows[papCode] || null;
  }

  /**
   * Lister tous les workflows avec filtres
   */
  listWorkflows(filters = {}) {
    const { status, phase, state } = filters;
    let results = Object.values(this.workflows);

    if (status) {
      results = results.filter(w => w.status === status);
    }

    if (phase) {
      results = results.filter(w => w.currentPhase === phase);
    }

    if (state) {
      results = results.filter(w => w.currentState === state);
    }

    return results;
  }

  /**
   * Rejeter une étape et revenir en arrière
   */
  rejectPhase(papCode, phaseNumber, reason) {
    const workflow = this.workflows[papCode];
    if (!workflow) {
      throw new Error(`Workflow not found for PAP: ${papCode}`);
    }

    const rejectionState = `REJECTED_${WORKFLOW_PHASES[`PHASE_${phaseNumber}`]?.name.toUpperCase().replace(/ /g, '_')}`;
    const state = WORKFLOW_STATES[rejectionState] || `rejected_phase_${phaseNumber}`;

    workflow.history.push({
      phase: phaseNumber,
      state,
      timestamp: new Date().toISOString(),
      action: `Rejeté: ${reason}`,
      userId: 'system'
    });

    workflow.currentState = state;
    this.saveToStorage();
    return workflow;
  }

  /**
   * Obtenir les statistiques du workflow
   */
  getStats() {
    const workflows = Object.values(this.workflows);
    const stats = {
      total: workflows.length,
      byPhase: {},
      byStatus: { in_progress: 0, completed: 0, rejected: 0 },
      progress: {}
    };

    // Count by phase
    for (const phase of Object.values(WORKFLOW_PHASES)) {
      stats.byPhase[phase.name] = workflows.filter(w => w.currentPhase >= phase.id).length;
    }

    // Count by status
    workflows.forEach(w => {
      if (w.status === 'completed') stats.byStatus.completed++;
      else if (w.status === 'rejected') stats.byStatus.rejected++;
      else stats.byStatus.in_progress++;
    });

    // Calculate progress percentage per phase
    workflows.forEach(w => {
      if (!stats.progress[w.currentPhase]) {
        stats.progress[w.currentPhase] = 0;
      }
      stats.progress[w.currentPhase]++;
    });

    return stats;
  }

  /**
   * Exporter workflow en JSON
   */
  exportWorkflow(papCode) {
    const workflow = this.workflows[papCode];
    if (!workflow) {
      throw new Error(`Workflow not found for PAP: ${papCode}`);
    }

    return JSON.stringify(workflow, null, 2);
  }

  /**
   * Clôturer un dossier
   */
  closeWorkflow(papCode) {
    const workflow = this.workflows[papCode];
    if (!workflow) {
      throw new Error(`Workflow not found for PAP: ${papCode}`);
    }

    workflow.status = 'completed';
    workflow.currentPhase = 6;
    workflow.currentState = WORKFLOW_STATES.CLOSED;
    workflow.closedAt = new Date().toISOString();

    workflow.history.push({
      phase: 6,
      state: WORKFLOW_STATES.CLOSED,
      timestamp: new Date().toISOString(),
      action: 'Dossier clôturé',
      userId: 'system'
    });

    this.saveToStorage();
    return workflow;
  }

  /**
   * Helper: Obtenir le label de l'action
   */
  getActionLabel(stateKey) {
    const labels = {
      REGISTERED: 'PAP enregistré',
      DOCUMENTED: 'Documents validés',
      PROPERTIES_LISTED: 'Propriétés listées',
      EVALUATED: 'Biens évalués',
      REJECTED_EVALUATION: 'Évaluation rejetée',
      COMPENSATED: 'Compensation calculée',
      COMPENSATION_APPROVED: 'Compensation approuvée',
      COMPENSATION_REJECTED: 'Compensation rejetée',
      PAYMENT_INITIATED: 'Paiement initié',
      PAYMENT_CONFIRMED: 'Paiement confirmé',
      PAYMENT_COMPLETED: 'Paiement complété',
      COMPLAINTS_RESOLVED: 'Réclamations résolues',
      CLOSED: 'Dossier clôturé'
    };

    return labels[stateKey] || stateKey;
  }

  /**
   * Nettoyer le storage
   */
  clearAll() {
    localStorage.removeItem(STORAGE_KEY);
    this.workflows = {};
  }
}

export const workflowService = new WorkflowService();

/**
 * Custom hook pour utiliser les workflows
 */
export const useWorkflow = (papCode) => {
  const [workflow, setWorkflow] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const w = workflowService.getWorkflow(papCode);
    setWorkflow(w);
    setLoading(false);
  }, [papCode]);

  const updatePhase = React.useCallback((phaseNumber, stateKey, data = {}) => {
    const updated = workflowService.updateWorkflow(papCode, phaseNumber, stateKey, data);
    setWorkflow(updated);
    return updated;
  }, [papCode]);

  const reject = React.useCallback((phaseNumber, reason) => {
    const updated = workflowService.rejectPhase(papCode, phaseNumber, reason);
    setWorkflow(updated);
    return updated;
  }, [papCode]);

  const close = React.useCallback(() => {
    const updated = workflowService.closeWorkflow(papCode);
    setWorkflow(updated);
    return updated;
  }, [papCode]);

  return { workflow, loading, updatePhase, reject, close };
};

export default workflowService;
