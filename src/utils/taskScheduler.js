import { format, parseISO } from 'date-fns'

/**
 * Checks if a task is scheduled to be performed on a specific date.
 * 
 * @param {Object} task The task object containing schedule info
 * @param {Date} date The date to check against
 * @returns {Boolean}
 */
export const isTaskScheduledOnDate = (task, date) => {
  if (!task || !date) return false

  const dateFormat = 'yyyy-MM-dd'
  const dateStr = format(date, dateFormat)
  const taskStartStr = task.startDate || format(new Date(), dateFormat)
  
  // Task hasn't started yet
  if (dateStr < taskStartStr) return false
  
  const type = task.schedule?.type || 'once'
  const dayName = format(date, 'EEE') // 'Mon', 'Tue', 'Wed', etc.
  
  switch (type) {
    case 'daily':
      return true
    case 'weekdays':
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(dayName)
    case 'weekly':
      // Matches the same day of the week as the start date
      // We use getDay() on both objects for consistency
      return date.getDay() === parseISO(taskStartStr).getDay()
    case 'custom':
      return (task.schedule?.days || []).includes(dayName)
    case 'once':
    default:
      return dateStr === taskStartStr
  }
}
