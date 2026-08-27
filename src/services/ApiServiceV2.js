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

  // ============= Evaluations =============
  async createEvaluation(bienCode, data) {
    return this.makeRequest(`/evaluation/create/${bienCode}`, { method: 'POST', data });
  }

  async getEvaluations(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.makeRequest(`/evaluation/list?${params}`);
  }

  // ============= Compensation =============
  async createCompensation(bienCode, data) {
    return this.makeRequest(`/compensation/submit/${bienCode}`, { method: 'POST', data });
  }

  async reviewCompensation(dossierId, review) {
    return this.makeRequest(`/compensation/review/${dossierId}`, { method: 'POST', data: review });
  }

  async approveCompensation(dossierId, approval) {
    return this.makeRequest(`/compensation/approve/${dossierId}`, { method: 'POST', data: approval });
  }

  async getCompensations(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.makeRequest(`/compensation/list?${params}`);
  }

  // ============= Payments =============
  async initiatePayment(compensationId, data) {
    return this.makeRequest(`/payment/initiate/${compensationId}`, { method: 'POST', data });
  }

  async confirmPayment(paiementId, data) {
    return this.makeRequest(`/payment/confirm/${paiementId}`, { method: 'POST', data });
  }

  async getPayments(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.makeRequest(`/payment/list?${params}`);
  }

  // ============= Reclamations =============
  async createReclamation(papCode, data) {
    return this.makeRequest(`/reclamation/create/${papCode}`, { method: 'POST', data });
  }

  async getReclamations(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.makeRequest(`/reclamation/list?${params}`);
  }

  async treatReclamation(reclamationId, data) {
    return this.makeRequest(`/reclamation/treat/${reclamationId}`, { method: 'POST', data });
  }

  // ============= Communications =============
  async getMessages(papCode) {
    return this.makeRequest(`/communications/messages/${papCode}`);
  }

  async sendMessage(papCode, data) {
    return this.makeRequest(`/communications/message/${papCode}`, { method: 'POST', data });
  }

  async getNotifications() {
    return this.makeRequest('/communications/notifications');
  }

  // ============= Calendrier =============
  async getMeetings(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.makeRequest(`/calendar/meetings?${params}`);
  }

  async createMeeting(data) {
    return this.makeRequest('/calendar/meetings', { method: 'POST', data });
  }

  // ============= Analytics & Reports =============
  async getAnalytics(type, period = '30d') {
    return this.makeRequest(`/analytics/${type}?period=${period}`);
  }

  async generateReport(type, options = {}) {
    return this.makeRequest(`/reports/generate/${type}`, { method: 'POST', data: options });
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

export default apiService;
