// Blockchain Audit Trail - Immuable Record Keeping
// Support: Ethereum, Polygon, Hyperledger Fabric
// Usage: npm install ethers @web3-react/core

import crypto from 'crypto';

const BLOCKCHAIN_CONFIG = {
  provider: process.env.REACT_APP_BLOCKCHAIN || 'ethereum', // 'ethereum', 'polygon', 'fabric'
  rpcUrl: process.env.REACT_APP_RPC_URL,
  contractAddress: process.env.REACT_APP_AUDIT_CONTRACT,
  chainId: process.env.REACT_APP_CHAIN_ID || 1
};

// Structure Transaction Blockchain
class AuditTransaction {
  constructor(eventType, entity, data, actor) {
    this.id = crypto.randomUUID();
    this.timestamp = new Date().toISOString();
    this.eventType = eventType;
    this.entity = entity; // 'PAP', 'BIEN', 'PAIEMENT'
    this.entityId = data.id;
    this.data = data;
    this.actor = actor;
    this.hash = null;
    this.blockNumber = null;
    this.transactionHash = null;
  }

  // Calculer hash du transaction
  calculateHash() {
    const content = JSON.stringify({
      timestamp: this.timestamp,
      eventType: this.eventType,
      entity: this.entity,
      entityId: this.entityId,
      data: this.data,
      actor: this.actor
    });

    return crypto.createHash('sha256').update(content).digest('hex');
  }

  // Signer transaction
  sign(privateKey) {
    const hash = this.calculateHash();
    const signer = crypto.createSign('sha256');
    signer.update(hash);
    this.hash = hash;
    this.signature = signer.sign(privateKey, 'hex');
    return this;
  }
}

// 1. ENREGISTRER AUDIT SUR BLOCKCHAIN
export const recordAuditBlockchain = async (eventType, entity, data, actor) => {
  if (!BLOCKCHAIN_CONFIG.rpcUrl) {
    console.warn('⚠️ Blockchain désactivé');
    return { success: false, reason: 'disabled' };
  }

  try {
    const transaction = new AuditTransaction(eventType, entity, data, actor);

    const response = await fetch('/api/blockchain/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: transaction.eventType,
        entity: transaction.entity,
        entityId: transaction.entityId,
        data: transaction.data,
        actor: transaction.actor,
        timestamp: transaction.timestamp
      })
    });

    const result = await response.json();

    return {
      success: true,
      transactionHash: result.hash,
      blockNumber: result.blockNumber,
      chainId: result.chainId,
      timestamp: transaction.timestamp,
      verified: true
    };
  } catch (error) {
    console.error('❌ Erreur blockchain audit:', error);
    return { success: false, error: error.message };
  }
};

// 2. VÉRIFIER INTÉGRITÉ BLOCKCHAIN
export const verifyAuditIntegrity = async (entityId, expectedHash) => {
  try {
    const response = await fetch(`/api/blockchain/verify/${entityId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expectedHash })
    });

    const result = await response.json();

    return {
      valid: result.valid,
      currentHash: result.hash,
      blockNumber: result.blockNumber,
      timestamp: result.timestamp,
      modified: !result.valid
    };
  } catch (error) {
    console.error('❌ Erreur vérification:', error);
    return { valid: false, error: error.message };
  }
};

// 3. OBTENIR HISTORIQUE AUDIT
export const getAuditTrail = async (entityId, entityType) => {
  try {
    const response = await fetch(
      `/api/blockchain/audit-trail?entityId=${entityId}&type=${entityType}`
    );

    const result = await response.json();

    return {
      success: true,
      transactions: result.transactions || [],
      totalCount: result.total,
      chainVerified: result.chainVerified
    };
  } catch (error) {
    console.error('❌ Erreur historique:', error);
    return { success: false, transactions: [], error: error.message };
  }
};

// 4. EXPORTER PREUVE BLOCKCHAIN
export const exportBlockchainProof = async (entityId, format = 'pdf') => {
  try {
    const response = await fetch('/api/blockchain/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityId,
        format, // 'pdf', 'json', 'xml'
        includeSignatures: true
      })
    });

    if (!response.ok) throw new Error('Export failed');

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    return {
      success: true,
      downloadUrl: url,
      filename: `audit-proof-${entityId}.${format}`
    };
  } catch (error) {
    console.error('❌ Erreur export:', error);
    return { success: false, error: error.message };
  };
};

// 5. TYPES D'ÉVÉNEMENTS AUDIT
export const AUDIT_EVENTS = {
  PAP_CREATED: 'pap.created',
  PAP_UPDATED: 'pap.updated',
  PAP_DELETED: 'pap.deleted',
  BIEN_CREATED: 'bien.created',
  BIEN_UPDATED: 'bien.updated',
  PAYMENT_INITIATED: 'payment.initiated',
  PAYMENT_CONFIRMED: 'payment.confirmed',
  DOCUMENT_UPLOADED: 'document.uploaded',
  RECLAMATION_CREATED: 'reclamation.created',
  EVALUATION_COMPLETED: 'evaluation.completed',
  DATA_VERIFIED: 'data.verified',
  DATA_MODIFIED: 'data.modified'
};

// 6. MIDDLEWARE: Auto-log Audit Events
export const auditMiddleware = (action, entity, data, actor) => {
  return async (callback) => {
    try {
      // Exécuter action
      const result = await callback();

      // Enregistrer sur blockchain
      await recordAuditBlockchain(action, entity, {
        ...data,
        result: result?.id || result?.code
      }, actor);

      return result;
    } catch (error) {
      // Enregistrer l'erreur aussi
      await recordAuditBlockchain(`${action}.failed`, entity, {
        ...data,
        error: error.message
      }, actor);

      throw error;
    }
  };
};

// 7. CERTIFICAT BLOCKCHAIN
export const generateBlockchainCertificate = async (pap, bien, evaluation) => {
  try {
    const response = await fetch('/api/blockchain/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        papCode: pap.code_pap,
        bienCode: bien.code_bien,
        evaluationId: evaluation.id,
        amount: evaluation.montant,
        date: new Date().toISOString()
      })
    });

    const result = await response.json();

    return {
      success: true,
      certificateId: result.certificateId,
      blockHash: result.hash,
      qrCode: result.qrCode,
      verificationUrl: result.verificationUrl
    };
  } catch (error) {
    console.error('❌ Erreur certificat:', error);
    return { success: false, error: error.message };
  }
};

// 8. VÉRIFIER CERTIFICAT
export const verifyCertificate = async (certificateId) => {
  try {
    const response = await fetch(
      `/api/blockchain/verify-certificate/${certificateId}`
    );

    const result = await response.json();

    return {
      valid: result.valid,
      certificate: result.certificate,
      blockchain: result.blockchain,
      timestamp: result.timestamp
    };
  } catch (error) {
    console.error('❌ Erreur vérification certificat:', error);
    return { valid: false, error: error.message };
  }
};

// 9. DASHBOARD AUDIT BLOCKCHAIN
export const getBlockchainStats = async () => {
  try {
    const response = await fetch('/api/blockchain/stats');
    const result = await response.json();

    return {
      totalTransactions: result.totalTransactions,
      totalEvents: result.totalEvents,
      blockNumber: result.blockNumber,
      gasUsed: result.gasUsed,
      networkId: result.networkId,
      lastUpdate: result.lastUpdate
    };
  } catch (error) {
    console.error('❌ Erreur stats:', error);
    return { totalTransactions: 0, error: error.message };
  }
};

export default {
  AuditTransaction,
  recordAuditBlockchain,
  verifyAuditIntegrity,
  getAuditTrail,
  exportBlockchainProof,
  auditMiddleware,
  generateBlockchainCertificate,
  verifyCertificate,
  getBlockchainStats,
  AUDIT_EVENTS
};
