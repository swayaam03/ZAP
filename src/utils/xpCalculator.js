const PRIORITY_XP = { high: 15, medium: 10, low: 5 }

const TIME_BONUS = {
  '15 min': 0, '30 min': 2, '1 hour': 5,
  '2 hours': 10, '3+ hours': 15,
}

const streakBonus = (days) => {
  if (days >= 30) return 2.0
  if (days >= 14) return 1.5
  if (days >= 7)  return 1.25
  if (days >= 3)  return 1.1
  return 1.0
}

export function calculateTaskXP({ priority = 'medium', estimatedTime = '30 min', streakDays = 0 }) {
  const base  = PRIORITY_XP[priority] ?? 10
  const time  = TIME_BONUS[estimatedTime] ?? 0
  const mult  = streakBonus(streakDays)
  return Math.round((base + time) * mult)
}

export function xpToLevel(xp)        { return Math.floor(xp / 100) + 1 }
export function xpInLevel(xp)        { return xp % 100 }
export function levelProgress(xp)    { return Math.round((xpInLevel(xp) / 100) * 100) }
export function xpToNextLevel(xp)    { return 100 - xpInLevel(xp) }

export function getLevelTitle(level) {
  if (level >= 50)  return 'Legend'
  if (level >= 30)  return 'Master'
  if (level >= 20)  return 'Expert'
  if (level >= 10)  return 'Disciplined'
  if (level >= 5)   return 'Consistent'
  if (level >= 2)   return 'Apprentice'
  return 'Newcomer'
}
const FOCUS_SESSION_XP = 12;

export function calculateFocusXP({ streakDays = 0 }) {
  const mult = streakBonus(streakDays);
  return Math.round(FOCUS_SESSION_XP * mult);
}
