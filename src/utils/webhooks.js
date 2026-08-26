// Webhooks Externes - SMS/Email/Slack Notifications
// Services: Twilio (SMS), Resend (Email), Slack (Chat)

const WEBHOOK_CONFIG = {
  twilio: {
    enabled: process.env.REACT_APP_TWILIO_ENABLED === 'true',
    accountSid: process.env.REACT_APP_TWILIO_SID,
    authToken: process.env.REACT_APP_TWILIO_TOKEN,
    fromNumber: process.env.REACT_APP_TWILIO_FROM
  },
  resend: {
    enabled: process.env.REACT_APP_RESEND_ENABLED === 'true',
    apiKey: process.env.REACT_APP_RESEND_KEY,
    fromEmail: process.env.REACT_APP_RESEND_FROM || 'noreply@apix-pap.com'
  },
  slack: {
    enabled: process.env.REACT_APP_SLACK_ENABLED === 'true',
    webhookUrl: process.env.REACT_APP_SLACK_WEBHOOK
  }
};

// Types d'événements
export const WEBHOOK_EVENTS = {
  PAP_CREATED: 'pap.created',
  PAP_UPDATED: 'pap.updated',
  PAYMENT_CONFIRMED: 'payment.confirmed',
  DOCUMENT_UPLOADED: 'document.uploaded',
  RISK_HIGH: 'risk.high',
  SLA_WARNING: 'sla.warning',
  RECLAMATION_CREATED: 'reclamation.created',
  EVALUATION_COMPLETED: 'evaluation.completed'
};

// 1. TWILIO SMS
export const sendSMSNotification = async (phoneNumber, message, event) => {
  if (!WEBHOOK_CONFIG.twilio.enabled) {
    console.warn('⚠️ Twilio SMS désactivé');
    return { success: false, reason: 'disabled' };
  }

  try {
    const response = await fetch('/api/webhooks/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: phoneNumber,
        message: message,
        event: event,
        timestamp: new Date().toISOString()
      })
    });

    const result = await response.json();
    return {
      success: result.success,
      messageId: result.messageId,
      cost: result.cost
    };
  } catch (error) {
    console.error('❌ Erreur SMS:', error);
    return { success: false, error: error.message };
  }
};

// 2. RESEND EMAIL
export const sendEmailNotification = async (to, subject, htmlContent, event) => {
  if (!WEBHOOK_CONFIG.resend.enabled) {
    console.warn('⚠️ Resend Email désactivé');
    return { success: false, reason: 'disabled' };
  }

  try {
    const response = await fetch('/api/webhooks/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: to,
        subject: subject,
        html: htmlContent,
        event: event,
        from: WEBHOOK_CONFIG.resend.fromEmail,
        timestamp: new Date().toISOString()
      })
    });

    const result = await response.json();
    return {
      success: result.success,
      emailId: result.id
    };
  } catch (error) {
    console.error('❌ Erreur Email:', error);
    return { success: false, error: error.message };
  }
};

// 3. SLACK NOTIFICATIONS
export const sendSlackNotification = async (channel, message, event, blocks = []) => {
  if (!WEBHOOK_CONFIG.slack.enabled) {
    console.warn('⚠️ Slack désactivé');
    return { success: false, reason: 'disabled' };
  }

  try {
    const response = await fetch('/api/webhooks/slack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: channel,
        text: message,
        event: event,
        blocks: blocks || [],
        timestamp: new Date().toISOString()
      })
    });

    const result = await response.json();
    return { success: result.success };
  } catch (error) {
    console.error('❌ Erreur Slack:', error);
    return { success: false, error: error.message };
  }
};

// Templates de notifications
export const NOTIFICATION_TEMPLATES = {
  PAP_CREATED: {
    sms: (pap) => `PAP créé: ${pap.nom} ${pap.prenom} - Code: ${pap.code_pap}`,
    email: (pap) => ({
      subject: `Nouveau PAP - ${pap.code_pap}`,
      html: `
        <h2>Nouveau PAP enregistré</h2>
        <p><strong>Nom:</strong> ${pap.nom} ${pap.prenom}</p>
        <p><strong>Code:</strong> ${pap.code_pap}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
      `
    }),
    slack: (pap) => ({
      text: `📝 Nouveau PAP: ${pap.nom} ${pap.prenom}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Nouveau PAP Créé*\n• Code: \`${pap.code_pap}\`\n• Nom: ${pap.nom} ${pap.prenom}`
          }
        }
      ]
    })
  },

  PAYMENT_CONFIRMED: {
    sms: (pap, montant) => `Paiement confirmé pour ${pap.nom}: ${montant}M FCFA`,
    email: (pap, montant) => ({
      subject: `Paiement Confirmé - ${montant}M FCFA`,
      html: `
        <h2>Paiement Confirmé</h2>
        <p><strong>PAP:</strong> ${pap.nom} ${pap.prenom}</p>
        <p><strong>Montant:</strong> ${montant}M FCFA</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
      `
    }),
    slack: (pap, montant) => ({
      text: `✅ Paiement: ${pap.nom} - ${montant}M FCFA`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Paiement Confirmé* 💰\n• PAP: ${pap.nom}\n• Montant: *${montant}M FCFA*`
          }
        }
      ]
    })
  },

  RISK_HIGH: {
    sms: (pap, score) => `⚠️ Risque élevé: ${pap.nom} - Score ${score}%`,
    email: (pap, score) => ({
      subject: `Alerte Risque Élevé - ${pap.code_pap}`,
      html: `
        <h2 style="color: #f44336;">Alerte Risque Élevé</h2>
        <p><strong>PAP:</strong> ${pap.nom} ${pap.prenom}</p>
        <p><strong>Score Risque:</strong> <span style="color: #f44336; font-weight: bold;">${score}%</span></p>
        <p>Action recommandée: Examen détaillé requis</p>
      `
    }),
    slack: (pap, score) => ({
      text: `🔴 Risque Élevé: ${pap.nom} - ${score}%`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*⚠️ RISQUE ÉLEVÉ DÉTECTÉ* 🔴\n• PAP: ${pap.nom}\n• Score: *${score}%*\n• Action: Examen recommandé`
          }
        }
      ]
    })
  },

  SLA_WARNING: {
    sms: (pap, days) => `⏰ Alerte SLA: ${pap.nom} - ${days} jours restants`,
    email: (pap, days) => ({
      subject: `Alerte SLA - ${days} jours restants`,
      html: `
        <h2>Alerte Deadline SLA</h2>
        <p><strong>PAP:</strong> ${pap.nom}</p>
        <p><strong>Jours restants:</strong> <strong>${days}</strong></p>
        <p style="color: #f44336;">Action urgente requise</p>
      `
    }),
    slack: (pap, days) => ({
      text: `⏰ SLA Alert: ${days} jours pour ${pap.nom}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*⏰ ALERTE SLA*\n• PAP: ${pap.nom}\n• Deadline: *${days} jours*`
          }
        }
      ]
    })
  }
};

// Dispatcher - Envoyer notification multi-canal
export const sendMultiChannelNotification = async (event, data, channels = ['sms', 'email', 'slack']) => {
  const template = NOTIFICATION_TEMPLATES[event];
  if (!template) {
    console.warn(`⚠️ Template non trouvé: ${event}`);
    return { success: false, error: 'Template not found' };
  }

  const results = {
    event,
    timestamp: new Date().toISOString(),
    channels: {}
  };

  // SMS
  if (channels.includes('sms') && data.phoneNumber) {
    const smsMessage = template.sms(...Object.values(data));
    results.channels.sms = await sendSMSNotification(data.phoneNumber, smsMessage, event);
  }

  // EMAIL
  if (channels.includes('email') && data.email) {
    const emailData = template.email(...Object.values(data));
    results.channels.email = await sendEmailNotification(
      data.email,
      emailData.subject,
      emailData.html,
      event
    );
  }

  // SLACK
  if (channels.includes('slack')) {
    const slackData = template.slack(...Object.values(data));
    results.channels.slack = await sendSlackNotification(
      data.slackChannel || '#apix-notifications',
      slackData.text,
      event,
      slackData.blocks
    );
  }

  return results;
};

// Webhook Registry - Enregistrer webhooks custom
export const registerWebhook = async (event, url, secret) => {
  return fetch('/api/webhooks/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event,
      url,
      secret,
      active: true,
      createdAt: new Date().toISOString()
    })
  }).then(r => r.json());
};

// List webhooks
export const listWebhooks = async () => {
  return fetch('/api/webhooks/list')
    .then(r => r.json())
    .then(data => data.webhooks || []);
};

// Test webhook
export const testWebhook = async (webhookId) => {
  return fetch(`/api/webhooks/${webhookId}/test`, { method: 'POST' })
    .then(r => r.json());
};

export default {
  sendSMSNotification,
  sendEmailNotification,
  sendSlackNotification,
  sendMultiChannelNotification,
  registerWebhook,
  listWebhooks,
  testWebhook,
  WEBHOOK_EVENTS,
  WEBHOOK_CONFIG
};
