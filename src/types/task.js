// FILE: src/types/task.js
// ACTION: Create New
// QUESTMIND INTEGRATION: Extends existing task structure with optional ZAP fields

/**
 * @typedef {Object} TaskSchedule
 * @property {'once'|'daily'|'weekdays'|'weekly'|'custom'} type
 * @property {string[]} days - e.g., ['Mon','Wed','Fri']
 * @property {string} time - HH:mm
 */

/**
 * @typedef {Object} ZapTaskExtension
 * // ── Academic fields (ZAP Block 1) ─────────────────────────────────────
 * @property {string} [subject] - Course/subject name
 * @property {string} [subjectColor] - Hex color for subject tag
 * @property {string} [deadline] - ISO date "2025-12-01" (hard deadline)
 * @property {number} [estimatedDuration] - Minutes to complete
 * @property {number} [actualDuration] - Minutes actually spent (set on completion)
 * @property {'critical'|'high'|'medium'|'low'} [priorityTier] - ZAP priority
 * @property {string} [groupId] - Group project ID (Block 3)
 * @property {string[]} [allowedUsers] - UIDs who can view/edit (Block 3)
 * @property {string} [noteId] - Linked note ID (Block 3)
 */

/**
 * @typedef {Object} Task
 * // ── QuestMind core fields (existing) ─────────────────────────────────
 * @property {string} id
 * @property {string} uid
 * @property {string} title
 * @property {string} [description]
 * @property {string} focusArea
 * @property {'high'|'medium'|'low'} priority
 * @property {string} estimatedTime - Legacy ZAP field ("30 min")
 * @property {TaskSchedule} schedule
 * @property {string} startDate
 * @property {number} streak
 * @property {string[]} completedDates
 * @property {boolean} isAiGenerated
 * @property {any} createdAt
 * @property {any} updatedAt
 * // ── ZAP extension fields (optional) ───────────────────────────────────
 * @property {ZapTaskExtension} [zap] - All ZAP fields nested here
 */

/**
 * Build a new task payload — safe for both QuestMind and ZAP modes
 * @param {string} uid
 * @param {Partial<Task>} data
 * @param {boolean} zapEnabled
 * @returns {Omit<Task,'id'>}
 */
export function buildTaskPayload(uid, data, zapEnabled = false) {
  const base = {
    uid,
    title: data.title?.trim() || '',
    description: data.description?.trim() || '',
    focusArea: data.focusArea || 'deepWork',
    priority: data.priority || 'medium',
    estimatedTime: data.estimatedTime || '30 min',
    schedule: data.schedule || { type: 'once', days: [], time: '' },
    startDate: data.startDate || new Date().toISOString().split('T')[0],
    streak: 0,
    completedDates: [],
    isAiGenerated: data.isAiGenerated || false,
  }

  if (zapEnabled && data.zap) {
    base.zap = {
      subject: data.zap.subject || '',
      subjectColor: data.zap.subjectColor || '#64748b',
      deadline: data.zap.deadline || null,
      estimatedDuration: data.zap.estimatedDuration || null,
      actualDuration: null,
      priorityTier: data.zap.priorityTier || data.priority || 'medium',
      groupId: data.zap.groupId || null,
      allowedUsers: data.zap.allowedUsers || [],
      noteId: data.zap.noteId || null,
    }
  }

  return base
}