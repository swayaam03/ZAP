import { startOfDay, differenceInCalendarDays, parseISO } from 'date-fns'

export function calculateStreak(completionDates = []) {
  if (!completionDates.length) {
    return { current: 0, longest: 0, isOnIce: false, iceExpiresAt: null }
  }

  // Deduplicate dates → unique day timestamps, sorted descending
  const days = [...new Set(
    completionDates.map(d => {
      const date = typeof d === 'string' ? parseISO(d) : new Date(d)
      return startOfDay(date).getTime()
    })
  )].sort((a, b) => b - a)

  const today     = startOfDay(new Date()).getTime()
  const yesterday = today - 86_400_000

  // Walk backwards building the streak
  let streak = 0
  let prev   = today

  for (let i = 0; i < days.length; i++) {
    const diff = differenceInCalendarDays(new Date(prev), new Date(days[i]))

    if (diff === 0) {
      // Same day as prev (today on first iteration)
      if (i === 0) { streak++; prev = days[i] }
      else continue
    } else if (diff === 1) {
      // Consecutive day
      streak++
      prev = days[i]
    } else if (diff === 2 && i === 0) {
      // Ice streak: most recent completion was yesterday, today not done yet
      streak++
      prev = days[i]
    } else {
      break
    }
  }

  // Recalculate longest by going through all days
  let longest    = streak
  let tempStreak = 1
  for (let i = 1; i < days.length; i++) {
    const diff = differenceInCalendarDays(new Date(days[i - 1]), new Date(days[i]))
    if (diff === 1) {
      tempStreak++
      longest = Math.max(longest, tempStreak)
    } else {
      tempStreak = 1
    }
  }

  // Ice streak: last completion was yesterday (haven't done today yet)
  const mostRecent   = days[0]
  const isOnIce      = mostRecent === yesterday
  const iceExpiresAt = isOnIce
    ? new Date(yesterday + 2 * 86_400_000).toISOString()
    : null

  return { current: streak, longest, isOnIce, iceExpiresAt }
}

export function getStreakMilestone(days) {
  if (days >= 365) return { label: '1 Year',   icon: '🏆', color: '#d97706' }
  if (days >= 100) return { label: '100 Days',  icon: '💎', color: '#7c3aed' }
  if (days >= 30)  return { label: '30 Days',   icon: '🔥', color: '#ea580c' }
  if (days >= 7)   return { label: '7 Days',    icon: '⚡', color: '#0d9488' }
  return null
}

export function formatStreak(days) {
  if (!days) return 'No streak'
  if (days === 1) return '1 day'
  return `${days} days`
}