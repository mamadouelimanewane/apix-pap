import { useState, useEffect, useCallback } from 'react';

/**
 * Service API V2 - Intégration complète avec mock data
 * Prêt pour basculer vers backend réel (Node/Express, FastAPI, etc.)
 */

const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000/api';

class ApiServiceV2 {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('jwtToken');
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  async makeRequest(endpoint, options = {}) {
    const { method = 'GET', data = null, useCache = true } = options;

    // Check cache for GET requests
    if (method === 'GET' && useCache) {
      const cacheKey = `${method}:${endpoint}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` })
      };

      const config = {
        method,
        headers,
        ...(data && { body: JSON.stringify(data) })
      };

      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();

      // Cache GET responses
      if (method === 'GET') {
        const cacheKey = `${method}:${endpoint}`;
        this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      }

      return result;
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // ============= PAP Management =============
  async getPAPs(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.makeRequest(`/pap/list?${params}`);
  }

  async getPAPById(papCode) {
    return this.makeRequest(`/pap/${papCode}`);
  }

  async createPAP(data) {
    return this.makeRequest('/pap/create', { method: 'POST', data });
  }

  async updatePAP(papCode, data) {
    return this.makeRequest(`/pap/${papCode}`, { method: 'PUT', data });
  }

  async searchPAP(query) {
    return this.makeRequest(`/pap/search?q=${encodeURIComponent(query)}`);
  }

  async getPAPStats() {
    return this.makeRequest('/pap/stats');
  }

  // ============= Authentication =============
  async login(email, password) {
    const result = await this.makeRequest('/auth/login', {
      method: 'POST',
      data: { email, password },
      useCache: false
    });

    if (result.token) {
      this.token = result.token;
      localStorage.setItem('jwtToken', result.token);
    }

    return result;
  }

  async getProfile() {
    return this.makeRequest('/auth/profile');
  }

  async logout() {
    this.token = null;
    localStorage.removeItem('jwtToken');
    return this.makeRequest('/auth/logout', { method: 'POST' });
  }

  // ============= Biens (Properties) =============
  async getBiens(papCode, filters = {}) {
    const params = new URLSearchParams(filters);
    return this.makeRequest(`/bien/list/${papCode}?${params}`);
  }

  async getBienById(bienCode) {
    return this.makeRequest(`/bien/${bienCode}`);
  }

  async createBien(papCode, data) {
    return this.makeRequest(`/bien/create/${papCode}`, { method: 'POST', data });
  }

  async updateBien(bienCode, data) {
    return this.makeRequest(`/bien/${bienCode}`, { method: 'PUT', data });
  }

  async deleteBien(bienCode) {
    return this.makeRequest(`/bien/${bienCode}`, { method: 'DELETE' });
  }

  async getBienStats(papCode) {
    return this.makeRequest(`/bien/stats/${papCode}`);
  }

  // ============= Evaluations =============
  async getEvaluationsByPAP(papCode, filters = {}) {
    const params = new URLSearchParams(filters);
    return this.makeRequest(`/evaluation/list/${papCode}?${params}`);
  }

  async getEvaluationById(evaluationCode) {
    return this.makeRequest(`/evaluation/${evaluationCode}`);
  }

  async createEvaluation(papCode, bienCode, data) {
    return this.makeRequest(`/evaluation/create/${papCode}/${bienCode}`, { method: 'POST', data });
  }

  async approveEvaluation(evaluationCode, data = {}) {
    return this.makeRequest(`/evaluation/approve/${evaluationCode}`, { method: 'POST', data });
  }

  async rejectEvaluation(evaluationCode, data = {}) {
    return this.makeRequest(`/evaluation/reject/${evaluationCode}`, { method: 'POST', data });
  }

  async getEvaluationStats(papCode) {
    return this.makeRequest(`/evaluation/stats/${papCode}`);
  }

  // ============= Compensation =============
  async getCompensationsByPAP(papCode, filters = {}) {
    const params = new URLSearchParams(filters);
    return this.makeRequest(`/compensation/list/${papCode}?${params}`);
  }

  async getCompensationById(compensationCode) {
    return this.makeRequest(`/compensation/${compensationCode}`);
  }

  async proposeCompensation(papCode, bienCode, data) {
    return this.makeRequest(`/compensation/propose/${papCode}/${bienCode}`, { method: 'POST', data });
  }

  async reviewCompensation(compensationCode, data) {
    return this.makeRequest(`/compensation/review/${compensationCode}`, { method: 'POST', data });
  }

  async approveCompensation(compensationCode, data) {
    return this.makeRequest(`/compensation/approve/${compensationCode}`, { method: 'POST', data });
  }

  async rejectCompensation(compensationCode, data = {}) {
    return this.makeRequest(`/compensation/reject/${compensationCode}`, { method: 'POST', data });
  }

  async getCompensationStats(papCode) {
    return this.makeRequest(`/compensation/stats/${papCode}`);
  }

  // ============= Payments =============
  async getPaymentsByPAP(papCode, filters = {}) {
    const params = new URLSearchParams(filters);
    return this.makeRequest(`/payment/list/${papCode}?${params}`);
  }

  async getPaymentById(paymentCode) {
    return this.makeRequest(`/payment/${paymentCode}`);
  }

  async initiatePayment(papCode, compensationCode, data) {
    return this.makeRequest(`/payment/initiate/${papCode}/${compensationCode}`, { method: 'POST', data });
  }

  async confirmPayment(paymentCode, data = {}) {
    return this.makeRequest(`/payment/confirm/${paymentCode}`, { method: 'POST', data });
  }

  async completePayment(paymentCode, data = {}) {
    return this.makeRequest(`/payment/complete/${paymentCode}`, { method: 'POST', data });
  }

  async failPayment(paymentCode, data = {}) {
    return this.makeRequest(`/payment/fail/${paymentCode}`, { method: 'POST', data });
  }

  async getPaymentStats(papCode) {
    return this.makeRequest(`/payment/stats/${papCode}`);
  }

  // ============= Reclamations =============
  async getReclamationsByPAP(papCode, filters = {}) {
    const params = new URLSearchParams(filters);
    return this.makeRequest(`/reclamation/list/${papCode}?${params}`);
  }

  async getReclamationById(reclamationCode) {
    return this.makeRequest(`/reclamation/${reclamationCode}`);
  }

  async createReclamation(papCode, data) {
    return this.makeRequest(`/reclamation/create/${papCode}`, { method: 'POST', data });
  }

  async reviewReclamation(reclamationCode, data = {}) {
    return this.makeRequest(`/reclamation/review/${reclamationCode}`, { method: 'POST', data });
  }

  async resolveReclamation(reclamationCode, data) {
    return this.makeRequest(`/reclamation/resolve/${reclamationCode}`, { method: 'POST', data });
  }

  async rejectReclamation(reclamationCode, data = {}) {
    return this.makeRequest(`/reclamation/reject/${reclamationCode}`, { method: 'POST', data });
  }

  async getReclamationStats(papCode) {
    return this.makeRequest(`/reclamation/stats/${papCode}`);
  }

  // ============= Communications =============
  async getMessages(papCode, filters = {}) {
    const params = new URLSearchParams(filters);
    return this.makeRequest(`/communication/messages/${papCode}?${params}`);
  }

  async getMessageById(messageCode) {
    return this.makeRequest(`/communication/${messageCode}`);
  }

  async sendMessage(papCode, data) {
    return this.makeRequest(`/communication/send/${papCode}`, { method: 'POST', data });
  }

  async markMessageAsRead(messageCode) {
    return this.makeRequest(`/communication/read/${messageCode}`, { method: 'POST' });
  }

  async deleteMessage(messageCode) {
    return this.makeRequest(`/communication/${messageCode}`, { method: 'DELETE' });
  }

  async getNotifications(papCode, filters = {}) {
    const params = new URLSearchParams(filters);
    return this.makeRequest(`/communication/notifications/${papCode}?${params}`);
  }

  async createNotification(papCode, data) {
    return this.makeRequest(`/communication/notify/${papCode}`, { method: 'POST', data });
  }

  async getCommunicationStats(papCode) {
    return this.makeRequest(`/communication/stats/${papCode}`);
  }

  // ============= Workflow =============
  async getWorkflowByPAP(papCode) {
    return this.makeRequest(`/workflow/${papCode}`);
  }

  async startPhase(papCode, phase, data = {}) {
    return this.makeRequest(`/workflow/start/${papCode}/${phase}`, { method: 'POST', data });
  }

  async completePhase(papCode, phase, data = {}) {
    return this.makeRequest(`/workflow/complete/${papCode}/${phase}`, { method: 'POST', data });
  }

  async rejectPhase(papCode, phase, data = {}) {
    return this.makeRequest(`/workflow/reject/${papCode}/${phase}`, { method: 'POST', data });
  }

  async getWorkflowHistory(papCode) {
    return this.makeRequest(`/workflow/history/${papCode}`);
  }

  async getWorkflowStats() {
    return this.makeRequest('/workflow/stats/all');
  }

  // ============= Analytics & Reports =============
  async getDashboard() {
    return this.makeRequest('/analytics/dashboard');
  }

  async getPhaseProgress() {
    return this.makeRequest('/analytics/phase-progress');
  }

  async getZoneReport() {
    return this.makeRequest('/analytics/zone-report');
  }

  async getSectorReport() {
    return this.makeRequest('/analytics/sector-report');
  }

  async getPropertyReport() {
    return this.makeRequest('/analytics/property-report');
  }

  async getTrendData(period = '30') {
    return this.makeRequest(`/analytics/trend-data?period=${period}`);
  }

  async getAlerts() {
    return this.makeRequest('/analytics/alerts');
  }

  clearCache() {
    this.cache.clear();
  }
}

export const apiService = new ApiServiceV2();

/**
 * Custom hooks pour intégration API
 */

export const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await apiService.makeRequest(endpoint, options);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
};

export const useGetPAPs = (filters = {}) => {
  const [paps, setPaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPAPs = async () => {
      try {
        setLoading(true);
        const result = await apiService.getPAPs(filters);
        setPaps(result || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPAPs();
  }, [JSON.stringify(filters)]);

  return { paps, loading, error };
};

export const useGetBiens = (papCode, filters = {}) => {
  const [biens, setBiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!papCode) return;

    const fetchBiens = async () => {
      try {
        setLoading(true);
        const result = await apiService.getBiens(papCode, filters);
        setBiens(result || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBiens();
  }, [papCode, JSON.stringify(filters)]);

  return { biens, loading, error };
};

export const useCreatePAP = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.createPAP(data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
};

export const useUpdatePAP = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = useCallback(async (papCode, data) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.updatePAP(papCode, data);
      apiService.clearCache(); // Clear cache after update
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading, error };
};

// Analytics & Dashboard Hooks
export const useDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const result = await apiService.getDashboard();
        setData(result?.data || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return { data, loading, error };
};

// Workflow Hooks
export const useWorkflow = (papCode) => {
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!papCode) return;

    const fetchWorkflow = async () => {
      try {
        setLoading(true);
        const result = await apiService.getWorkflowByPAP(papCode);
        setWorkflow(result?.data || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflow();
  }, [papCode]);

  return { workflow, loading, error };
};

// Communication Hooks
export const useMessages = (papCode, filters = {}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!papCode) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const result = await apiService.getMessages(papCode, filters);
        setMessages(result?.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [papCode, JSON.stringify(filters)]);

  return { messages, loading, error };
};

export const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const send = useCallback(async (papCode, data) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.sendMessage(papCode, data);
      apiService.clearCache();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { send, loading, error };
};

// Reclamation Hooks
export const useReclamations = (papCode, filters = {}) => {
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!papCode) return;

    const fetchReclamations = async () => {
      try {
        setLoading(true);
        const result = await apiService.getReclamationsByPAP(papCode, filters);
        setReclamations(result?.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReclamations();
  }, [papCode, JSON.stringify(filters)]);

  return { reclamations, loading, error };
};

export const useCreateReclamation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (papCode, data) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.createReclamation(papCode, data);
      apiService.clearCache();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
};

export default apiService;
