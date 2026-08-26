// API Service - Integration couche données
// Centralise tous les appels API + caching + retry logic

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000/api';

// Configuration Axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Cache en mémoire
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Intercepteur: Ajouter JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur: Gestion erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Retry sur 5xx ou timeout
    const config = error.config;
    if (!config.retry) {
      config.retry = 0;
    }

    config.retry += 1;

    if ((error.response?.status >= 500 || error.code === 'ECONNABORTED') && config.retry < 3) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * config.retry));
      return api(config);
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// DASHBOARD MÉTIER - Stats globales
// ============================================================================

export const dashboardAPI = {
  // Récupérer tous les stats (cached)
  getMetierStats: async () => {
    const cacheKey = 'metier_stats';

    if (cache.has(cacheKey)) {
      const { data, timestamp } = cache.get(cacheKey);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }

    try {
      const response = await api.get('/dashboard/metier-stats');
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      return response.data;
    } catch (error) {
      console.error('Erreur chargement stats métier:', error);
      throw error;
    }
  },

  // Récupérer stats par phase
  getPhaseStats: async (phase) => {
    try {
      const response = await api.get(`/dashboard/phase/${phase}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur stats phase ${phase}:`, error);
      throw error;
    }
  },

  // Récupérer KPIs synthèse
  getSynthesisKPIs: async () => {
    try {
      const response = await api.get('/dashboard/synthesis-kpis');
      return response.data;
    } catch (error) {
      console.error('Erreur KPIs:', error);
      throw error;
    }
  },

  // Récupérer trending (derniers 7j)
  getTrendingData: async (period = '7d') => {
    try {
      const response = await api.get('/dashboard/trending', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur trending:', error);
      throw error;
    }
  }
};

// ============================================================================
// PAP - Gestion personnnes affectées
// ============================================================================

export const papAPI = {
  // Lister PAPs avec filtres
  list: async (filters = {}) => {
    const { page = 1, limit = 20, status, risk, zone, search } = filters;

    try {
      const response = await api.get('/pap/list', {
        params: { page, limit, status, risk, zone, search }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur liste PAP:', error);
      throw error;
    }
  },

  // Détail PAP
  getById: async (papCode) => {
    try {
      const response = await api.get(`/pap/${papCode}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur PAP ${papCode}:`, error);
      throw error;
    }
  },

  // Créer PAP
  create: async (data) => {
    try {
      const response = await api.post('/pap/create', data);
      return response.data;
    } catch (error) {
      console.error('Erreur création PAP:', error);
      throw error;
    }
  },

  // Update PAP
  update: async (papCode, data) => {
    try {
      const response = await api.put(`/pap/${papCode}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur update PAP ${papCode}:`, error);
      throw error;
    }
  },

  // Recherche globale
  search: async (query) => {
    try {
      const response = await api.get('/pap/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur recherche PAP:', error);
      throw error;
    }
  }
};

// ============================================================================
// BIENS - Propriétés
// ============================================================================

export const bienAPI = {
  list: async (papCode, filters = {}) => {
    try {
      const response = await api.get(`/bien/list/${papCode}`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Erreur liste biens:', error);
      throw error;
    }
  },

  getById: async (bienCode) => {
    try {
      const response = await api.get(`/bien/${bienCode}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur bien ${bienCode}:`, error);
      throw error;
    }
  },

  create: async (papCode, data) => {
    try {
      const response = await api.post(`/bien/create/${papCode}`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur création bien:', error);
      throw error;
    }
  },

  update: async (bienCode, data) => {
    try {
      const response = await api.put(`/bien/${bienCode}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur update bien ${bienCode}:`, error);
      throw error;
    }
  }
};

// ============================================================================
// ÉVALUATION & DÉDOMMAGEMENT
// ============================================================================

export const evaluationAPI = {
  createEvaluation: async (bienCode, data) => {
    try {
      const response = await api.post(`/evaluation/create/${bienCode}`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur création évaluation:', error);
      throw error;
    }
  },

  submitCompensation: async (bienCode, data) => {
    try {
      const response = await api.post(`/compensation/submit/${bienCode}`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur soumission compensation:', error);
      throw error;
    }
  },

  reviewCompensation: async (dossierId, review) => {
    try {
      const response = await api.post(`/compensation/review/${dossierId}`, review);
      return response.data;
    } catch (error) {
      console.error('Erreur revue compensation:', error);
      throw error;
    }
  },

  approveCompensation: async (dossierId, approval) => {
    try {
      const response = await api.post(`/compensation/approve/${dossierId}`, approval);
      return response.data;
    } catch (error) {
      console.error('Erreur approbation compensation:', error);
      throw error;
    }
  }
};

// ============================================================================
// PAIEMENT
// ============================================================================

export const paymentAPI = {
  initiate: async (compensationId, data) => {
    try {
      const response = await api.post(`/payment/initiate/${compensationId}`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur initiation paiement:', error);
      throw error;
    }
  },

  confirm: async (paiementId, data) => {
    try {
      const response = await api.post(`/payment/confirm/${paiementId}`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur confirmation paiement:', error);
      throw error;
    }
  },

  getStatus: async (paiementId) => {
    try {
      const response = await api.get(`/payment/status/${paiementId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur statut paiement:', error);
      throw error;
    }
  }
};

// ============================================================================
// RÉCLAMATIONS
// ============================================================================

export const reclamationAPI = {
  list: async (papCode) => {
    try {
      const response = await api.get(`/reclamation/list/${papCode}`);
      return response.data;
    } catch (error) {
      console.error('Erreur liste réclamations:', error);
      throw error;
    }
  },

  create: async (papCode, data) => {
    try {
      const response = await api.post(`/reclamation/create/${papCode}`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur création réclamation:', error);
      throw error;
    }
  },

  treat: async (reclamationId, data) => {
    try {
      const response = await api.post(`/reclamation/treat/${reclamationId}`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur traitement réclamation:', error);
      throw error;
    }
  }
};

// ============================================================================
// NOTIFICATIONS & COMMUNICATIONS
// ============================================================================

export const communicationAPI = {
  getMessages: async (papCode) => {
    try {
      const response = await api.get(`/communications/messages/${papCode}`);
      return response.data;
    } catch (error) {
      console.error('Erreur messages:', error);
      throw error;
    }
  },

  getNotifications: async () => {
    try {
      const response = await api.get('/communications/notifications');
      return response.data;
    } catch (error) {
      console.error('Erreur notifications:', error);
      throw error;
    }
  },

  sendMessage: async (papCode, data) => {
    try {
      const response = await api.post(`/communications/message/${papCode}`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur envoi message:', error);
      throw error;
    }
  },

  markNotificationRead: async (notificationId) => {
    try {
      const response = await api.put(`/communications/notification/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Erreur marquage notification:', error);
      throw error;
    }
  }
};

// ============================================================================
// CALENDRIER & RÉUNIONS
// ============================================================================

export const calendarAPI = {
  getMeetings: async (filters = {}) => {
    try {
      const response = await api.get('/calendar/meetings', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Erreur meetings:', error);
      throw error;
    }
  },

  createMeeting: async (data) => {
    try {
      const response = await api.post('/calendar/meetings', data);
      return response.data;
    } catch (error) {
      console.error('Erreur création meeting:', error);
      throw error;
    }
  },

  findOptimalSlots: async (data) => {
    try {
      const response = await api.post('/calendar/find-slots', data);
      return response.data;
    } catch (error) {
      console.error('Erreur recherche slots:', error);
      throw error;
    }
  }
};

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

export const analyticsAPI = {
  trackEvent: async (event, data) => {
    try {
      await api.post('/analytics/track', {
        event,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur tracking:', error);
      // Non-blocking
    }
  },

  getPhaseAnalytics: async (phase, period = '30d') => {
    try {
      const response = await api.get(`/analytics/phase/${phase}`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur analytics phase ${phase}:`, error);
      throw error;
    }
  },

  getComplianceReport: async (period = '30d') => {
    try {
      const response = await api.get('/analytics/compliance', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur compliance report:', error);
      throw error;
    }
  }
};

export default api;
