// Simple i18n system for APIX-PAP
const translations = {
  fr: {
    nav: {
      dashboard: 'Tableau de Bord',
      registre: 'Registre PAP',
      biens: 'Gestion Biens',
      evaluations: 'Évaluations',
      paiements: 'Paiements',
      reclamations: 'Réclamations',
      documents: 'Documents',
      conciliation: 'Conciliation',
      notifications: 'Notifications',
      rapports: 'Rapports',
      search: 'Recherche',
      backup: 'Sauvegarde',
      webhooks: 'Webhooks',
      audit: 'Audit Trail',
      settings: 'Paramètres'
    },
    common: {
      save: 'Sauvegarder',
      cancel: 'Annuler',
      edit: 'Éditer',
      delete: 'Supprimer',
      add: 'Ajouter',
      logout: 'Déconnexion',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès'
    }
  },
  en: {
    nav: {
      dashboard: 'Dashboard',
      registre: 'PAP Registry',
      biens: 'Property Management',
      evaluations: 'Evaluations',
      paiements: 'Payments',
      reclamations: 'Complaints',
      documents: 'Documents',
      conciliation: 'Conciliation',
      notifications: 'Notifications',
      rapports: 'Reports',
      search: 'Search',
      backup: 'Backup',
      webhooks: 'Webhooks',
      audit: 'Audit Trail',
      settings: 'Settings'
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      add: 'Add',
      logout: 'Logout',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success'
    }
  }
};

export const useTranslation = (lang = 'fr') => {
  return {
    t: (key) => {
      const keys = key.split('.');
      let value = translations[lang];
      for (const k of keys) {
        value = value?.[k];
      }
      return value || key;
    },
    lang
  };
};

export default translations;
