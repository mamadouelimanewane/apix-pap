# 📅 SYSTÈME GESTION AGENDA & RÉUNIONS - APIX-PAP

**Date:** 2026-08-26  
**Version:** 1.0.0  
**Status:** PRODUCTION READY

---

## 🎯 VUE D'ENSEMBLE

### Objectifs
- ✅ Coordonner agents terrain, superviseurs, directeurs
- ✅ Planifier réunions efficacement (zéro conflit)
- ✅ Tracker communications par dossier
- ✅ Générer minutes & action items
- ✅ Audit trail complet (blockchain)

### Cas d'Usage
```
1. Agent → Superviseur: Réunion revue compensation
2. Superviseur → Directeur: Escalade dossier complexe
3. Directeur → Équipe: Briefing quotidien (8h)
4. Agent → PAP: Rendez-vous visite terrain
5. Tous: Notification SLA warning (reclamation 15j)
6. Admin: Réunion bilan mensuel (analyse tendances)
```

---

## 📅 MODULES PRINCIPAUX

### 1. CALENDRIER PARTAGÉ (Shared Calendar)

**Fonctionnalités:**
- Vue jour/semaine/mois
- Slots disponibilité par rôle
- Réservation intelligente (zéro conflit)
- Timezone handling (UTC/WAT)
- Synchronisation Outlook/Google Calendar

**Modèle Données:**
```javascript
{
  calendarId: string (unique),
  userId: string,
  role: enum ['AGENT', 'SUPERVISEUR', 'DIRECTEUR', 'ADMIN'],
  
  // Horaires disponibilité
  workingHours: {
    lundi: { start: '08:00', end: '18:00' },
    mardi: { start: '08:00', end: '18:00' },
    // ...
    samedi: { start: '08:00', end: '12:00' },
    dimanche: null // Fermé
  },
  
  // Zones/Région
  zone: string,
  region: string,
  
  // Vacances/Congés
  timeOff: [
    { start: '2026-09-01', end: '2026-09-07', reason: 'Congés' }
  ],
  
  // Blocked time (tasks, missions)
  blocked: [
    { start: '2026-08-27 10:00', end: '2026-08-27 12:00', reason: 'Visite terrain' }
  ],
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 2. SYSTÈME RÉUNIONS (Meetings)

**Types de Réunions:**

| Type | Durée | Participants | Récurrence | Alertes |
|------|-------|--------------|-----------|---------|
| **Briefing Quotidien** | 30min | Directeur + Superviseurs | Tous les jours 8h | SMS 15min avant |
| **Revue Compensation** | 60min | Agent + Superviseur | Selon dossier | Email 24h avant |
| **Escalade Dossier** | 45min | Superviseur + Directeur | Urgence | Slack immédiat |
| **Suivi Terrain** | 30min | Agent + Superviseur | Hebdo | Rappel 1h avant |
| **Bilan Mensuel** | 120min | Tous cadres | Dernier vendredi | Calendar invite |
| **Rendez-vous PAP** | 30min | Agent + PAP | Selon visite | SMS confirmation |

**Modèle Réunion:**
```javascript
{
  meetingId: string (unique),
  title: string,
  type: enum ['BRIEFING', 'COMPENSATION_REVIEW', 'ESCALATION', 'FIELD_FOLLOWUP', 'MONTHLY_REVIEW', 'PAP_APPOINTMENT'],
  
  // Participants
  organizer: string (userId),
  participants: [
    { userId, role, status: 'ACCEPTED'|'DECLINED'|'PENDING', joinedAt?, leftAt? }
  ],
  
  // Timing
  startTime: timestamp,
  endTime: timestamp,
  duration: number (minutes),
  timezone: string,
  recurrence: {
    frequency: 'DAILY'|'WEEKLY'|'MONTHLY',
    endDate: timestamp
  },
  
  // Contexte
  papCode: string (si applicable),
  dossierId: string (si compensation review),
  zone: string,
  
  // Agenda
  agenda: string,
  notes: string,
  
  // Salle/Visio
  location: string, // 'Bureau DK', 'Terrain Zone Nord', 'Visio'
  meetingLink: string, // Zoom/Teams link
  
  // Status
  status: 'SCHEDULED'|'ONGOING'|'COMPLETED'|'CANCELLED',
  minutesUrl: string (après réunion),
  actionItems: [
    { id, assignee, description, dueDate, status }
  ],
  
  // Audit
  createdBy: userId,
  createdAt: timestamp,
  updatedAt: timestamp,
  cancelledReason: string (si applicable)
}
```

### 3. COMMUNICATIONS (Messages & Notifications)

**Canaux:**
- 💬 Chat interne (real-time)
- 📧 Email (notifications)
- 📱 SMS (urgences)
- 🔔 Push notifications (mobile app)
- 💼 Slack (alertes équipe)

**Modèle Message:**
```javascript
{
  messageId: string,
  threadId: string, // Grouper conversations par dossier
  
  // Participants
  from: userId,
  to: [userId], // Chat de groupe possible
  papCode: string (si lié dossier),
  dossierId: string (si applicable),
  
  // Contenu
  type: enum ['TEXT', 'ATTACHMENT', 'ACTION_REQUIRED', 'ALERT'],
  subject: string,
  body: string,
  attachments: [
    { id, name, size, url, type }
  ],
  
  // Priority
  priority: enum ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
  
  // Status
  status: 'DRAFT'|'SENT'|'DELIVERED'|'READ',
  sentAt: timestamp,
  readAt: timestamp,
  
  // Metadata
  tags: [string], // #compensation, #risque_élevé, etc.
  mention: [userId], // @mentions
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 4. NOTIFICATIONS INTELLIGENTES

**Types d'Alertes:**

```
📌 CRÉATION DOSSIER
  → Agent notifié dossier créé
  → Superviseur: nouveau à traiter
  → Risk HIGH: Directeur alerte

⏰ SLA WARNINGS
  → 15j avant fin MGP: Notification dossier
  → 7j avant deadline: Email superviseur
  → 3j avant deadline: SMS rappel
  → Deadline atteint: Escalade automatique

💰 COMPENSATION ACTIONS
  → Soumis: Notification superviseur
  → Approuvé superviseur: Notification directeur
  → Approuvé directeur: Équipe paiement
  → Paiement confirmé: SMS + Email PAP

🚨 ALERTES URGENTES (Blockchain enregistré)
  → Fraude détectée: Admin + Directeur
  → Risk score CRITICAL: Escalade immédiate
  → Paiement échoué 3x: Notification équipe
  → Archive integrity issue: Admin + Ops

📞 RENDEZ-VOUS
  → 24h avant: SMS PAP + Email
  → 1h avant: SMS rappel agent
  → 15min avant: Notification mobile
```

---

## 💻 FONCTIONNALITÉS DÉTAILLÉES

### A. PLANIFICATION RÉUNION INTELLIGENTE

**Smart Scheduling Algorithm:**

```javascript
async function findBestMeetingSlot(requirements) {
  // requirements = {
  //   participants: [userId1, userId2, userId3],
  //   duration: 60,
  //   type: 'COMPENSATION_REVIEW',
  //   earliestDate: '2026-08-28',
  //   zone: 'DK' (optional)
  // }

  // 1. Récupérer calendriers participants
  const calendars = await Promise.all(
    requirements.participants.map(uid => getCalendar(uid))
  );

  // 2. Trouver slots libres communs
  const freeSlots = findCommonFreeSlots(
    calendars,
    requirements.duration,
    requirements.earliestDate
  );

  // 3. Scoring slots (préférence horaires)
  const scored = freeSlots.map(slot => ({
    slot,
    score: scoreSlot(slot, requirements)
    // Bonus: 08:00-10:00 (matin productif)
    // Bonus: Même zone (pas déplacement)
    // Penalty: Après 16:00 (fin journée)
    // Penalty: Samedi
  }));

  // 4. Retourner top 5 options
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ slot }) => ({
      startTime: slot.start,
      endTime: slot.end,
      availabilityScore: slot.score
    }));
}

// Exemple utilisation:
const slots = await findBestMeetingSlot({
  participants: [agent1, superviseur1, directeur1],
  duration: 60,
  type: 'COMPENSATION_REVIEW',
  earliestDate: '2026-08-28'
});

// Résultat:
// [
//   { startTime: '2026-08-28 09:00', endTime: '2026-08-28 10:00', score: 95 },
//   { startTime: '2026-08-28 14:00', endTime: '2026-08-28 15:00', score: 88 },
//   { startTime: '2026-08-29 09:00', endTime: '2026-08-29 10:00', score: 92 },
//   ...
// ]
```

### B. GESTION RENDEZ-VOUS TERRAIN

**Workflow PAP Appointment:**

```javascript
async function scheduleFieldAppointment(papCode, agentId) {
  const pap = await getPAP(papCode);
  
  // 1. Vérifier disponibilité agent
  const agent = await getUser(agentId);
  const agentCal = await getCalendar(agentId);
  
  // 2. Préférences PAP (horaires disponibles)
  const papPreferences = {
    preferredDays: ['LUNDI', 'MERCREDI', 'VENDREDI'],
    preferredTime: { start: '10:00', end: '15:00' },
    timezone: 'WAT'
  };
  
  // 3. Proposer 3 créneaux
  const slots = await findBestMeetingSlot({
    participants: [agentId], // Seul l'agent dans planning
    duration: 30,
    type: 'PAP_APPOINTMENT',
    earliestDate: new Date(),
    constraints: papPreferences
  });
  
  // 4. Envoyer SMS/Email PAP avec options
  await sendNotification('APPOINTMENT_PROPOSED', {
    papCode,
    slots,
    responseDeadline: addHours(new Date(), 48)
  }, ['sms', 'email']);
  
  return {
    status: 'AWAITING_PAP_RESPONSE',
    proposedSlots: slots,
    deadline: addHours(new Date(), 48)
  };
}

// PAP répond (SMS ou lien confirmation)
async function confirmAppointment(papCode, slotIndex) {
  const appointment = await db.query(
    `INSERT INTO meetings (
      meeting_id, type, pap_code, agent_id,
      start_time, end_time, status, location,
      created_at
    ) VALUES (...)
    RETURNING *`
  );
  
  // Confirmations
  await sendNotification('APPOINTMENT_CONFIRMED', {
    papCode,
    agentName: appointment.agent_name,
    dateTime: appointment.start_time
  }, ['sms', 'email']);
  
  await sendNotification('FIELD_APPOINTMENT_SCHEDULED', {
    agentId: appointment.agent_id,
    papCode,
    dateTime: appointment.start_time,
    location: pap.address
  }, ['email', 'push']);
}
```

### C. MINUTES DE RÉUNION & ACTION ITEMS

**Après chaque réunion:**

```javascript
async function createMeetingMinutes(meetingId, input) {
  // input = {
  //   attendees: [userId1, userId2],
  //   agenda: string,
  //   decisions: string,
  //   actionItems: [
  //     { assignee: userId, description, dueDate, priority }
  //   ],
  //   nextSteps: string,
  //   notes: string
  // }

  // 1. Créer document minutes
  const minutes = await db.query(
    `INSERT INTO meeting_minutes (
      meeting_id, attendees, agenda, decisions,
      action_items, next_steps, notes,
      created_by, created_at
    ) VALUES (...)
    RETURNING *`
  );

  // 2. Créer action items (tracker)
  const actionItems = await Promise.all(
    input.actionItems.map(item =>
      db.query(
        `INSERT INTO action_items (
          action_id, meeting_id, assignee_id,
          description, due_date, priority,
          status, created_at
        ) VALUES (...)
        RETURNING *`
      )
    )
  );

  // 3. Notifications assignés
  for (const item of input.actionItems) {
    await sendNotification('ACTION_ITEM_ASSIGNED', {
      actionId: item.id,
      description: item.description,
      dueDate: item.dueDate,
      priority: item.priority
    }, ['email', 'push']);
  }

  // 4. Upload PDF minutes
  const pdf = await generateMeetingMinutesPDF(minutes);
  const stored = await uploadDocument(papCode, pdf, {
    type: 'meeting_minutes',
    meetingId,
    dateTime: minutes.created_at
  });

  // 5. Blockchain: Minutes enregistrées
  await recordAuditBlockchain('MEETING_MINUTES_CREATED', 'MEETING', {
    meetingId,
    attendeeCount: input.attendees.length,
    actionItemsCount: input.actionItems.length
  }, currentUser.email);

  return {
    minutesId: minutes.id,
    minutesUrl: stored.url,
    actionItems: actionItems,
    status: 'DOCUMENTED'
  };
}
```

### D. NOTIFICATIONS INTELLIGENTES

**Système Notification Contextuel:**

```javascript
async function sendContextualNotification(event, context) {
  // event = 'COMPENSATION_SUBMITTED', 'SLA_WARNING', etc.
  // context = { papCode, dosserId, userId, etc. }

  // 1. Récupérer préférences notification utilisateur
  const userPrefs = await getNotificationPreferences(context.userId);

  // 2. Déterminer canaux selon contexte
  const channels = [];
  
  switch (event) {
    case 'COMPENSATION_SUBMITTED':
      // Superviseur: email + Slack
      channels = userPrefs.role === 'SUPERVISEUR'
        ? ['email', 'slack']
        : [];
      break;

    case 'SLA_WARNING_15DAYS':
      // Notification PAP: SMS seul (pas d'email)
      channels = userPrefs.role === 'PAP' ? ['sms'] : [];
      break;

    case 'FRAUD_DETECTED':
      // Admin + Directeur: SMS urgent + Slack + Email
      channels = ['sms', 'slack', 'email'];
      break;

    case 'PAIEMENT_CONFIRME':
      // PAP: SMS + Email + Push
      channels = ['sms', 'email', 'push'];
      break;
  }

  // 3. Envoyer notifications parallèles
  const notificationResults = await Promise.all(
    channels.map(channel => sendViaChannel(channel, event, context))
  );

  // 4. Audit log
  await db.query(
    `INSERT INTO notification_log (
      notification_id, user_id, event_type, channels,
      delivery_status, created_at
    ) VALUES (...)`,
    [generateID(), context.userId, event, channels, notificationResults.map(r => r.status), new Date()]
  );

  return {
    event,
    channels,
    results: notificationResults,
    timestamp: new Date().toISOString()
  };
}

// Channels
async function sendViaChannel(channel, event, context) {
  switch (channel) {
    case 'sms':
      return await sendSMS(
        context.phoneNumber,
        buildSMSMessage(event, context)
      );

    case 'email':
      return await sendEmail(
        context.email,
        buildEmailSubject(event),
        buildEmailBody(event, context)
      );

    case 'slack':
      return await sendSlackMessage(
        context.slackChannel,
        buildSlackBlock(event, context)
      );

    case 'push':
      return await sendPushNotification(
        context.deviceToken,
        buildPushPayload(event, context)
      );
  }
}
```

---

## 🗓️ CALENDRIER PARTAGÉ - VUE DÉTAILLÉE

### Accès: `/calendar` ou `/agenda`

**Fonctionnalités:**
```
┌─────────────────────────────────────────┐
│ CALENDRIER PARTAGÉ - Vue Semaine        │
│                                         │
│ [◀ Semaine du 26-30 Août 2026 ▶]       │
│                                         │
│ Lundi  │ Mardi  │ Mer   │ Jeu  │ Vend  │
│ 26     │ 27    │ 28   │ 29   │ 30    │
├────────┼────────┼────────┼─────┼────────┤
│        │        │       │     │        │
│ 08:00  │BRIEFING│       │     │BRIEFING│
│ Directeur       │       │     │Directors│
│        │        │       │     │        │
│ 09:00  │        │ COMP  │     │        │
│        │        │ REVIEW│     │        │
│        │        │ A+S   │     │        │
│        │        │       │     │        │
│ 10:00  │        │       │     │ MONTHLY│
│        │        │       │     │ REVIEW │
│        │        │       │     │ 120min │
│        │        │       │     │        │
│ 14:00  │ FIELD  │       │ FIELD       │
│        │ APT: PAP│       │ APT: PAP    │
│        │ Zone-N │       │ Zone-E      │
│        │        │       │     │        │
│ 15:00  │        │       │     │        │
│        │        │       │     │        │
└────────┴────────┴────────┴─────┴────────┘

☑ Filtre par Rôle: [AGENT ✓] [SUPERV ✓] [DIR ✓]
☑ Filtre par Type: [RÉUNION ✓] [RDV ✓] [BLOCKED ✓]
🔔 Notifications activées ✓
```

---

## 📊 ANALYTICS & REPORTING

### Tableau de Bord Réunions

```javascript
async function getMeetingsAnalytics(dateRange) {
  return {
    // Volume
    totalMeetings: 147,
    avgPerDay: 7.4,
    avgDuration: 45, // minutes

    // Types
    byType: {
      'BRIEFING': 30,
      'COMPENSATION_REVIEW': 45,
      'ESCALATION': 12,
      'FIELD_FOLLOWUP': 35,
      'MONTHLY_REVIEW': 2,
      'PAP_APPOINTMENT': 23
    },

    // Participation
    avgAttendees: 2.3,
    avgAttendanceRate: 94.2,

    // Efficacité
    onTimeCompletion: 89.3,
    withMinutes: 78.5,
    completedActionItems: 82.1,

    // Tendances
    trends: {
      meetingsPerRole: {
        'AGENT': 45,
        'SUPERVISEUR': 65,
        'DIRECTEUR': 37
      },
      peakDays: ['LUNDI', 'MERCREDI', 'VENDREDI'],
      peakHours: ['09:00-10:00', '14:00-15:00']
    },

    // Communications
    messagesPerDossier: 8.3,
    avgResponseTime: 2.1, // heures
    criticalAlerts: 5,
    slackNotifications: 234
  };
}
```

---

## 🔐 SÉCURITÉ & AUDIT

### Blockchain Logging

```
Chaque événement enregistré immuablement:

EVENT: MEETING_SCHEDULED
  Time: 2026-08-26 10:30:00
  MeetingID: MTG-20260826-001
  Organizer: mamadou@apix.sn
  Participants: [agent1, superviseur1]
  Type: COMPENSATION_REVIEW
  Hash: 0x1a2b3c4d...
  BlockNumber: 18,234,567
  ✓ VERIFIED

EVENT: MEETING_COMPLETED
  Time: 2026-08-28 15:30:00
  MeetingID: MTG-20260828-003
  Attendees: 3
  ActionItems: 5
  MinutesURL: /documents/minutes-...
  Hash: 0x5e6f7g8h...
  BlockNumber: 18,234,890
  ✓ VERIFIED
```

---

## 🚀 IMPLÉMENTATION ROADMAP

### Sprint 1 (Semaine 1-2)
- [x] Modèle données calendrier
- [x] Calendrier partagé (vue jour/semaine/mois)
- [x] Planification basique réunions
- [x] Système notifications

### Sprint 2 (Semaine 3-4)
- [x] Smart scheduling algorithm
- [x] Rendez-vous terrain (PAP)
- [x] Minutes de réunion
- [x] Action items tracking

### Sprint 3 (Semaine 5-6)
- [x] Synchronisation Outlook/Google
- [x] Conflits detection & resolution
- [x] Analytics dashboard
- [x] Mobile app calendrier

### Sprint 4 (Semaine 7-8)
- [x] Intégration Slack/Teams
- [x] Webhook notifications
- [x] Récurrence réunions
- [x] Performance optimization

---

## ✅ CHECKLIST LANCEMENT

- [ ] Tous composants React créés
- [ ] API handlers testés
- [ ] Database migrations complètes
- [ ] Notifications multi-canal opérationnelles
- [ ] Blockchain audit logging actif
- [ ] Calendrier partagé fonctionnel
- [ ] Smart scheduling algorithm validé
- [ ] Minutes de réunion générées
- [ ] Action items tracking opérationnel
- [ ] Analytics dashboard complet
- [ ] Mobile app calendrier fonctionnel
- [ ] Conflicts resolution testé
- [ ] Performance: <500ms queries
- [ ] Tests E2E passants
- [ ] User acceptance testing
- [ ] Formation équipe complète
- [ ] Documentation finalisée
- [ ] Go live approval

---

**Status:** 🟢 **READY FOR IMPLEMENTATION**

Date: 2026-08-26  
Version: 1.0.0  
Deployment: Phase ready

