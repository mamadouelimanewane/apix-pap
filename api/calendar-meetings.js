// API Handlers - Calendrier & Gestion Réunions
import { Database } from '@neon/serverless';

const db = new Database(process.env.DATABASE_URL);

// ============================================================================
// CALENDRIER
// ============================================================================

export const getCalendar = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const { userId } = req.query;

    const result = await db.query(
      `SELECT * FROM calendar WHERE user_id = $1`,
      [userId || req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Calendar not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur récupération calendrier:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateCalendarAvailability = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { workingHours, timeOff, blocked } = req.body;

    const updated = await db.query(
      `UPDATE calendar SET
        working_hours = $1, time_off = $2, blocked = $3,
        updated_at = $4
      WHERE user_id = $5
      RETURNING *`,
      [
        JSON.stringify(workingHours),
        JSON.stringify(timeOff),
        JSON.stringify(blocked),
        new Date().toISOString(),
        req.user.id
      ]
    );

    res.status(200).json(updated.rows[0]);
  } catch (error) {
    console.error('Erreur mise à jour calendrier:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// RÉUNIONS - CRUD
// ============================================================================

export const getMeetings = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const { date, view, type } = req.query;

    let query = `
      SELECT * FROM meetings
      WHERE (organizer_id = $1 OR $1 = ANY(participant_ids))
    `;
    const params = [req.user.id];

    if (date) {
      const queryDate = new Date(date);
      if (view === 'week') {
        const startOfWeek = new Date(queryDate);
        startOfWeek.setDate(queryDate.getDate() - queryDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        query += ` AND start_time >= $${params.length + 1} AND start_time < $${params.length + 2}`;
        params.push(startOfWeek.toISOString(), endOfWeek.toISOString());
      } else if (view === 'month') {
        const startOfMonth = new Date(queryDate.getFullYear(), queryDate.getMonth(), 1);
        const endOfMonth = new Date(queryDate.getFullYear(), queryDate.getMonth() + 1, 1);

        query += ` AND start_time >= $${params.length + 1} AND start_time < $${params.length + 2}`;
        params.push(startOfMonth.toISOString(), endOfMonth.toISOString());
      }
    }

    if (type) {
      query += ` AND type = $${params.length + 1}`;
      params.push(type);
    }

    query += ` ORDER BY start_time ASC`;

    const result = await db.query(query, params);

    const meetings = result.rows.map(m => ({
      ...m,
      participants: m.participants_json ? JSON.parse(m.participants_json) : []
    }));

    res.status(200).json({ meetings });
  } catch (error) {
    console.error('Erreur récupération réunions:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createMeeting = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const {
      title, type, participants, startTime, endTime,
      location, agenda, meetingLink
    } = req.body;

    // Vérifier conflits horaires
    const conflicts = await checkScheduleConflicts(
      participants,
      new Date(startTime),
      new Date(endTime)
    );

    if (conflicts.length > 0) {
      return res.status(409).json({
        error: 'Schedule conflict detected',
        conflicts
      });
    }

    const meetingId = generateID();
    const meeting = await db.query(
      `INSERT INTO meetings (
        meeting_id, organizer_id, title, type,
        participant_ids, participants_json,
        start_time, end_time, location, agenda, meeting_link,
        status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        meetingId, req.user.id, title, type,
        participants,
        JSON.stringify(
          participants.map(pid => ({ userId: pid, status: 'PENDING' }))
        ),
        new Date(startTime).toISOString(),
        new Date(endTime).toISOString(),
        location, agenda, meetingLink || null,
        'SCHEDULED',
        new Date().toISOString()
      ]
    );

    // Envoyer invitations
    await sendMeetingInvitations(meetingId, meeting.rows[0], participants);

    // Blockchain
    await recordAuditBlockchain('MEETING_SCHEDULED', 'MEETING', {
      meetingId,
      type,
      participantsCount: participants.length
    }, req.user.email);

    res.status(201).json({
      success: true,
      meetingId,
      status: 'SCHEDULED'
    });
  } catch (error) {
    console.error('Erreur création réunion:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateMeetingStatus = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { meetingId, status } = req.body;
    // status: SCHEDULED, ONGOING, COMPLETED, CANCELLED

    const updated = await db.query(
      `UPDATE meetings SET status = $1, updated_at = $2
      WHERE meeting_id = $3
      RETURNING *`,
      [status, new Date().toISOString(), meetingId]
    );

    // Notifications selon nouveau status
    if (status === 'COMPLETED') {
      await notifyMeetingCompleted(updated.rows[0]);
    } else if (status === 'CANCELLED') {
      await notifyMeetingCancelled(updated.rows[0]);
    }

    res.status(200).json({ success: true, status });
  } catch (error) {
    console.error('Erreur mise à jour réunion:', error);
    res.status(500).json({ error: error.message });
  }
};

export const respondToMeetingInvite = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { meetingId, response } = req.body;
    // response: ACCEPTED, DECLINED, TENTATIVE

    const meeting = await db.query(
      `SELECT * FROM meetings WHERE meeting_id = $1`,
      [meetingId]
    );

    if (meeting.rows.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Mettre à jour participant status
    const participants = JSON.parse(meeting.rows[0].participants_json);
    const updatedParticipants = participants.map(p =>
      p.userId === req.user.id ? { ...p, status: response } : p
    );

    await db.query(
      `UPDATE meetings SET participants_json = $1
      WHERE meeting_id = $2`,
      [JSON.stringify(updatedParticipants), meetingId]
    );

    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error('Erreur réponse invite:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// SMART SCHEDULING
// ============================================================================

export const findOptimalSlots = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { participants, duration, type, earliestDate } = req.body;

    // Récupérer calendriers
    const calendars = await Promise.all(
      participants.map(pid =>
        db.query('SELECT * FROM calendar WHERE user_id = $1', [pid])
      )
    );

    // Trouver slots communs libres
    const slots = findCommonFreeSlots(
      calendars.map(c => c.rows[0]),
      duration,
      new Date(earliestDate)
    );

    // Scorer slots
    const scored = slots.map(slot => ({
      startTime: slot.start.toISOString(),
      endTime: slot.end.toISOString(),
      availabilityScore: scoreSlot(slot, type)
    }));

    res.status(200).json({
      slots: scored.sort((a, b) => b.availabilityScore - a.availabilityScore).slice(0, 5)
    });
  } catch (error) {
    console.error('Erreur recherche slots:', error);
    res.status(500).json({ error: error.message });
  }
};

function findCommonFreeSlots(calendars, durationMinutes, startDate, maxDays = 7) {
  const slots = [];
  const dayStart = 8 * 60; // 8 AM en minutes
  const dayEnd = 18 * 60;  // 6 PM en minutes

  for (let dayOffset = 0; dayOffset < maxDays; dayOffset++) {
    const day = new Date(startDate);
    day.setDate(day.getDate() + dayOffset);

    if (day.getDay() === 0) continue; // Skip Sunday
    if (day.getDay() === 6) continue; // Skip Saturday (ou adapter)

    // Vérifier chaque slot de 30 minutes
    for (let time = dayStart; time <= dayEnd - durationMinutes; time += 30) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;

      const slotStart = new Date(day);
      slotStart.setHours(hours, minutes, 0);

      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

      // Vérifier disponibilité pour TOUS participants
      const allFree = calendars.every(cal => isSlotFree(cal, slotStart, slotEnd));

      if (allFree) {
        slots.push({ start: slotStart, end: slotEnd });
      }
    }
  }

  return slots;
}

function isSlotFree(calendar, start, end) {
  // Vérifier blocked time
  const blocked = JSON.parse(calendar.blocked || '[]');
  for (const block of blocked) {
    const blockStart = new Date(block.start);
    const blockEnd = new Date(block.end);
    if (!(end <= blockStart || start >= blockEnd)) {
      return false; // Overlap
    }
  }

  // Vérifier time off
  const timeOff = JSON.parse(calendar.time_off || '[]');
  for (const off of timeOff) {
    const offStart = new Date(off.start);
    const offEnd = new Date(off.end);
    if (!(end <= offStart || start >= offEnd)) {
      return false;
    }
  }

  return true;
}

function scoreSlot(slot, type) {
  let score = 50;

  const hour = slot.start.getHours();
  const day = slot.start.getDay();

  // Bonus morning (9-11)
  if (hour >= 9 && hour <= 11) score += 20;
  // Good afternoon (14-16)
  else if (hour >= 14 && hour <= 16) score += 15;
  // Penalty late afternoon
  else if (hour >= 16) score -= 10;

  // Bonus weekday morning
  if (day >= 1 && day <= 5) score += 5;

  // Type-specific
  if (type === 'BRIEFING' && hour === 8) score += 10;
  if (type === 'PAP_APPOINTMENT' && hour >= 10 && hour <= 15) score += 10;

  return Math.min(100, Math.max(0, score));
}

async function checkScheduleConflicts(participants, startTime, endTime) {
  const conflicts = [];

  for (const pid of participants) {
    const result = await db.query(
      `SELECT * FROM meetings
      WHERE $1 = ANY(participant_ids)
      AND (start_time < $3 AND end_time > $2)
      AND status != 'CANCELLED'`,
      [pid, startTime.toISOString(), endTime.toISOString()]
    );

    if (result.rows.length > 0) {
      conflicts.push({
        participantId: pid,
        conflictingMeetings: result.rows
      });
    }
  }

  return conflicts;
}

// ============================================================================
// MINUTES DE RÉUNION
// ============================================================================

export const createMeetingMinutes = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { meetingId, agenda, decisions, actionItems, nextSteps, notes } = req.body;

    // Récupérer meeting
    const meeting = await db.query(
      `SELECT * FROM meetings WHERE meeting_id = $1`,
      [meetingId]
    );
    if (meeting.rows.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Créer minutes
    const minutes = await db.query(
      `INSERT INTO meeting_minutes (
        meeting_id, agenda, decisions, next_steps, notes,
        created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        meetingId, agenda, decisions, nextSteps, notes,
        req.user.id, new Date().toISOString()
      ]
    );

    // Créer action items
    const actionItemIds = await Promise.all(
      actionItems.map(item =>
        db.query(
          `INSERT INTO action_items (
            action_id, meeting_id, assignee_id,
            description, due_date, priority, status,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *`,
          [
            generateID(), meetingId, item.assignee,
            item.description, item.dueDate, item.priority, 'PENDING',
            new Date().toISOString()
          ]
        )
      )
    );

    // Notifications aux assignés
    for (const item of actionItems) {
      await sendNotification('ACTION_ITEM_ASSIGNED', {
        actionId: item.id,
        description: item.description,
        dueDate: item.dueDate
      }, ['email', 'push']);
    }

    // Blockchain
    await recordAuditBlockchain('MEETING_MINUTES_CREATED', 'MEETING', {
      meetingId,
      actionItemsCount: actionItems.length
    }, req.user.email);

    res.status(201).json({
      success: true,
      minutesId: minutes.rows[0].minutes_id,
      actionItems: actionItemIds
    });
  } catch (error) {
    console.error('Erreur création minutes:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateActionItemStatus = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { actionItemId, status, notes } = req.body;

    const updated = await db.query(
      `UPDATE action_items SET status = $1, notes = $2, updated_at = $3
      WHERE action_id = $4
      RETURNING *`,
      [status, notes, new Date().toISOString(), actionItemId]
    );

    res.status(200).json({ success: true, status });
  } catch (error) {
    console.error('Erreur mise à jour action item:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// NOTIFICATIONS
// ============================================================================

async function sendMeetingInvitations(meetingId, meeting, participants) {
  for (const pid of participants) {
    await sendNotification('MEETING_INVITATION', {
      meetingId,
      title: meeting.title,
      startTime: meeting.start_time,
      location: meeting.location
    }, ['email', 'push', 'slack']);
  }
}

async function notifyMeetingCompleted(meeting) {
  const participants = JSON.parse(meeting.participants_json);
  for (const p of participants) {
    await sendNotification('MEETING_COMPLETED', {
      meetingId: meeting.meeting_id,
      title: meeting.title
    }, ['email', 'push']);
  }
}

async function notifyMeetingCancelled(meeting) {
  const participants = JSON.parse(meeting.participants_json);
  for (const p of participants) {
    await sendNotification('MEETING_CANCELLED', {
      meetingId: meeting.meeting_id,
      title: meeting.title
    }, ['email', 'slack']);
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function generateID() {
  return Math.random().toString(36).substring(2, 11);
}

async function sendNotification(type, data, channels) {
  console.log(`[NOTIFICATION] ${type}:`, data);
}

async function recordAuditBlockchain(eventType, entity, data, actor) {
  console.log(`[BLOCKCHAIN] ${eventType} for ${entity}`);
}

export default {
  getCalendar,
  updateCalendarAvailability,
  getMeetings,
  createMeeting,
  updateMeetingStatus,
  respondToMeetingInvite,
  findOptimalSlots,
  createMeetingMinutes,
  updateActionItemStatus
};
