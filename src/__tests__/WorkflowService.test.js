import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { workflowService, WORKFLOW_STATES, WORKFLOW_PHASES } from '../services/WorkflowService';

describe('WorkflowService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    workflowService.clearAll();
  });

  afterEach(() => {
    workflowService.clearAll();
  });

  describe('createWorkflow', () => {
    it('should create a new workflow for a PAP', () => {
      const papCode = 'PAP-2024-001';
      const papData = { nom: 'Jean Dupont', zone: 'Zone A' };

      const workflow = workflowService.createWorkflow(papCode, papData);

      expect(workflow).toBeDefined();
      expect(workflow.papCode).toBe(papCode);
      expect(workflow.papName).toBe('Jean Dupont');
      expect(workflow.currentPhase).toBe(1);
      expect(workflow.currentState).toBe(WORKFLOW_STATES.REGISTERED);
      expect(workflow.status).toBe('in_progress');
    });

    it('should initialize workflow with phase 1 data', () => {
      const papCode = 'PAP-2024-002';
      const papData = { nom: 'Marie Martin', zone: 'Zone B' };

      const workflow = workflowService.createWorkflow(papCode, papData);

      expect(workflow.data.phase1).toEqual(expect.objectContaining(papData));
      expect(workflow.history.length).toBe(1);
      expect(workflow.history[0].state).toBe(WORKFLOW_STATES.REGISTERED);
    });
  });

  describe('updateWorkflow', () => {
    let papCode;
    let workflow;

    beforeEach(() => {
      papCode = 'PAP-2024-003';
      const papData = { nom: 'Ahmed Hassan' };
      workflow = workflowService.createWorkflow(papCode, papData);
    });

    it('should update workflow to phase 2 - Evaluated', () => {
      const bienData = { nombreBiens: 3, valeurEstimee: 150000 };
      const updated = workflowService.updateWorkflow(papCode, 2, 'EVALUATED', bienData);

      expect(updated.currentPhase).toBe(2);
      expect(updated.currentState).toBe(WORKFLOW_STATES.EVALUATED);
      expect(updated.data.phase2).toEqual(expect.objectContaining(bienData));
      expect(updated.history.length).toBe(2);
    });

    it('should transition through multiple phases correctly', () => {
      // Phase 1 -> 2
      workflowService.updateWorkflow(papCode, 2, 'EVALUATED', { biens: 3 });
      // Phase 2 -> 3
      workflowService.updateWorkflow(papCode, 3, 'COMPENSATED', { montant: 100000 });
      // Phase 3 -> 4
      workflowService.updateWorkflow(papCode, 4, 'PAYMENT_COMPLETED', { modePayement: 'OrangeMoney' });

      const workflow = workflowService.getWorkflow(papCode);
      expect(workflow.currentPhase).toBe(4);
      expect(workflow.currentState).toBe(WORKFLOW_STATES.PAYMENT_COMPLETED);
      expect(workflow.history.length).toBe(4); // 1 initial + 3 updates
    });

    it('should reject a phase and add to history', () => {
      workflowService.updateWorkflow(papCode, 2, 'EVALUATED', { biens: 3 });
      const rejected = workflowService.rejectPhase(papCode, 2, 'Évaluation incomplète');

      expect(rejected.currentState).toContain('rejected');
      expect(rejected.history.length).toBe(3); // 1 initial + 1 evaluated + 1 rejected
      expect(rejected.history[2].action).toContain('Évaluation incomplète');
    });
  });

  describe('getWorkflow', () => {
    it('should retrieve an existing workflow', () => {
      const papCode = 'PAP-2024-004';
      const papData = { nom: 'Fatou Ndiaye' };
      workflowService.createWorkflow(papCode, papData);

      const workflow = workflowService.getWorkflow(papCode);
      expect(workflow).toBeDefined();
      expect(workflow.papCode).toBe(papCode);
    });

    it('should return null for non-existent workflow', () => {
      const workflow = workflowService.getWorkflow('NONEXISTENT');
      expect(workflow).toBeNull();
    });
  });

  describe('listWorkflows', () => {
    beforeEach(() => {
      workflowService.createWorkflow('PAP-001', { nom: 'User 1' });
      workflowService.createWorkflow('PAP-002', { nom: 'User 2' });
      workflowService.createWorkflow('PAP-003', { nom: 'User 3' });

      // Update some workflows to different phases
      workflowService.updateWorkflow('PAP-002', 2, 'EVALUATED', {});
      workflowService.updateWorkflow('PAP-003', 3, 'COMPENSATED', {});
    });

    it('should list all workflows', () => {
      const workflows = workflowService.listWorkflows();
      expect(workflows.length).toBe(3);
    });

    it('should filter workflows by phase', () => {
      const phase2 = workflowService.listWorkflows({ phase: 2 });
      expect(phase2.length).toBe(1);
      expect(phase2[0].papCode).toBe('PAP-002');
    });

    it('should filter workflows by state', () => {
      const evaluated = workflowService.listWorkflows({ state: WORKFLOW_STATES.EVALUATED });
      expect(evaluated.length).toBe(1);
      expect(evaluated[0].currentPhase).toBe(2);
    });
  });

  describe('getStats', () => {
    beforeEach(() => {
      for (let i = 1; i <= 5; i++) {
        workflowService.createWorkflow(`PAP-00${i}`, { nom: `User ${i}` });
      }

      workflowService.updateWorkflow('PAP-002', 2, 'EVALUATED', {});
      workflowService.updateWorkflow('PAP-003', 3, 'COMPENSATED', {});
      workflowService.closeWorkflow('PAP-004');
    });

    it('should return correct total count', () => {
      const stats = workflowService.getStats();
      expect(stats.total).toBe(5);
    });

    it('should count workflows by status', () => {
      const stats = workflowService.getStats();
      expect(stats.byStatus.in_progress).toBe(3);
      expect(stats.byStatus.completed).toBe(1);
    });

    it('should calculate progress by phase', () => {
      const stats = workflowService.getStats();
      expect(stats.progress[1]).toBe(5); // All started
      expect(stats.progress[2]).toBe(4); // Phase 2+
      expect(stats.progress[3]).toBe(2); // Phase 3+
    });
  });

  describe('closeWorkflow', () => {
    it('should mark workflow as completed', () => {
      const papCode = 'PAP-2024-005';
      workflowService.createWorkflow(papCode, { nom: 'Test User' });

      const closed = workflowService.closeWorkflow(papCode);

      expect(closed.status).toBe('completed');
      expect(closed.currentPhase).toBe(6);
      expect(closed.currentState).toBe(WORKFLOW_STATES.CLOSED);
      expect(closed.closedAt).toBeDefined();
    });

    it('should add closure to history', () => {
      const papCode = 'PAP-2024-006';
      workflowService.createWorkflow(papCode, { nom: 'Test User' });
      workflowService.closeWorkflow(papCode);

      const workflow = workflowService.getWorkflow(papCode);
      const lastEntry = workflow.history[workflow.history.length - 1];
      expect(lastEntry.state).toBe(WORKFLOW_STATES.CLOSED);
      expect(lastEntry.action).toBe('Dossier clôturé');
    });
  });

  describe('storage persistence', () => {
    it('should persist workflows to localStorage', () => {
      const papCode = 'PAP-2024-007';
      workflowService.createWorkflow(papCode, { nom: 'Persistence Test' });

      // Create new instance to simulate page reload
      const newService = require('../services/WorkflowService').default;
      const retrieved = newService.getWorkflow(papCode);

      expect(retrieved).toBeDefined();
      expect(retrieved.papCode).toBe(papCode);
    });
  });

  describe('exportWorkflow', () => {
    it('should export workflow as JSON string', () => {
      const papCode = 'PAP-2024-008';
      workflowService.createWorkflow(papCode, { nom: 'Export Test' });

      const exported = workflowService.exportWorkflow(papCode);
      const parsed = JSON.parse(exported);

      expect(parsed.papCode).toBe(papCode);
      expect(parsed.currentPhase).toBe(1);
    });

    it('should throw error for non-existent workflow', () => {
      expect(() => {
        workflowService.exportWorkflow('NONEXISTENT');
      }).toThrow();
    });
  });
});
