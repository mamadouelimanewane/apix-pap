// Définition des rôles et permissions APIX-PAP

export const ROLES = {
  ADMIN: 'admin',
  CHEF_PROJET: 'chef_projet',
  GESTIONNAIRE: 'gestionnaire',
  AGENT_TERRAIN: 'agent_terrain',
  PAP: 'pap'
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrateur',
  [ROLES.CHEF_PROJET]: 'Chef Projet',
  [ROLES.GESTIONNAIRE]: 'Gestionnaire PAP',
  [ROLES.AGENT_TERRAIN]: 'Agent Terrain',
  [ROLES.PAP]: 'Personne Affectée'
};

export const PERMISSIONS = {
  // Gestion PAP
  PAP_CREATE: 'pap:create',
  PAP_READ: 'pap:read',
  PAP_UPDATE: 'pap:update',
  PAP_DELETE: 'pap:delete',
  PAP_LIST: 'pap:list',

  // Évaluation & Biens
  BIEN_CREATE: 'bien:create',
  BIEN_READ: 'bien:read',
  BIEN_UPDATE: 'bien:update',
  BIEN_DELETE: 'bien:delete',
  EVALUATION_CREATE: 'evaluation:create',
  EVALUATION_APPROVE: 'evaluation:approve',

  // Compensation & Paiement
  COMPENSATION_CREATE: 'compensation:create',
  COMPENSATION_REVIEW: 'compensation:review',
  COMPENSATION_APPROVE: 'compensation:approve',
  PAYMENT_CREATE: 'payment:create',
  PAYMENT_CONFIRM: 'payment:confirm',
  PAYMENT_DISBURSE: 'payment:disburse',

  // Réclamations
  RECLAMATION_CREATE: 'reclamation:create',
  RECLAMATION_TREAT: 'reclamation:treat',
  RECLAMATION_RESOLVE: 'reclamation:resolve',

  // Admin & Audit
  AUDIT_VIEW: 'audit:view',
  REPORTS_VIEW: 'reports:view',
  ANALYTICS_VIEW: 'analytics:view',
  SYSTEM_CONFIG: 'system:config',
  USER_MANAGEMENT: 'user:management'
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // Tous les permissions
    ...Object.values(PERMISSIONS)
  ],

  [ROLES.CHEF_PROJET]: [
    // Gestion PAP
    PERMISSIONS.PAP_CREATE,
    PERMISSIONS.PAP_READ,
    PERMISSIONS.PAP_UPDATE,
    PERMISSIONS.PAP_LIST,

    // Évaluation & Biens
    PERMISSIONS.BIEN_CREATE,
    PERMISSIONS.BIEN_READ,
    PERMISSIONS.BIEN_UPDATE,
    PERMISSIONS.EVALUATION_CREATE,

    // Compensation
    PERMISSIONS.COMPENSATION_CREATE,
    PERMISSIONS.COMPENSATION_REVIEW,
    PERMISSIONS.COMPENSATION_APPROVE,

    // Paiement
    PERMISSIONS.PAYMENT_CREATE,
    PERMISSIONS.PAYMENT_CONFIRM,

    // Réclamations
    PERMISSIONS.RECLAMATION_CREATE,
    PERMISSIONS.RECLAMATION_TREAT,

    // Rapports
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW
  ],

  [ROLES.GESTIONNAIRE]: [
    // Gestion PAP (lecture/mise à jour)
    PERMISSIONS.PAP_READ,
    PERMISSIONS.PAP_UPDATE,
    PERMISSIONS.PAP_LIST,

    // Biens
    PERMISSIONS.BIEN_READ,
    PERMISSIONS.BIEN_UPDATE,
    PERMISSIONS.EVALUATION_CREATE,

    // Compensation
    PERMISSIONS.COMPENSATION_CREATE,
    PERMISSIONS.COMPENSATION_REVIEW,

    // Paiement
    PERMISSIONS.PAYMENT_CREATE,
    PERMISSIONS.PAYMENT_CONFIRM,

    // Réclamations
    PERMISSIONS.RECLAMATION_CREATE,
    PERMISSIONS.RECLAMATION_TREAT,

    // Rapports
    PERMISSIONS.REPORTS_VIEW
  ],

  [ROLES.AGENT_TERRAIN]: [
    // PAP - lecture seule
    PERMISSIONS.PAP_READ,
    PERMISSIONS.PAP_LIST,

    // Biens - créer et lire
    PERMISSIONS.BIEN_CREATE,
    PERMISSIONS.BIEN_READ,
    PERMISSIONS.BIEN_UPDATE,

    // Évaluation
    PERMISSIONS.EVALUATION_CREATE,

    // Réclamations
    PERMISSIONS.RECLAMATION_CREATE,

    // Rapports
    PERMISSIONS.REPORTS_VIEW
  ],

  [ROLES.PAP]: [
    // Consultable: propre profil et documents
    PERMISSIONS.PAP_READ,
    PERMISSIONS.REPORTS_VIEW
  ]
};

export const hasPermission = (userRole, permission) => {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
};

export const hasAnyPermission = (userRole, permissions) => {
  return permissions.some(perm => hasPermission(userRole, perm));
};

export const hasAllPermissions = (userRole, permissions) => {
  return permissions.every(perm => hasPermission(userRole, perm));
};

// Demo users
export const DEMO_USERS = {
  'admin@apix.sn': {
    nom: 'Administrateur Système',
    email: 'admin@apix.sn',
    role: ROLES.ADMIN,
    department: 'IT',
    password: 'password'
  },
  'chef@apix.sn': {
    nom: 'Alioune Diallo',
    email: 'chef@apix.sn',
    role: ROLES.CHEF_PROJET,
    department: 'Projet Principal',
    password: 'password'
  },
  'gestionnaire@apix.sn': {
    nom: 'Fatou Sow',
    email: 'gestionnaire@apix.sn',
    role: ROLES.GESTIONNAIRE,
    department: 'Gestion PAP',
    password: 'password'
  },
  'agent@apix.sn': {
    nom: 'Mamadou Ba',
    email: 'agent@apix.sn',
    role: ROLES.AGENT_TERRAIN,
    department: 'Terrain Dakar',
    password: 'password'
  }
};
