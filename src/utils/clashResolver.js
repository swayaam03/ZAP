// FILE: src/utils/clashResolver.js
import { format, addDays, parseISO } from "date-fns";
import {
  parseDurationToMinutes,
  toLocalTime,
  getUserTimezone,
  isSameDayLocal,
} from "./dateHelpers";

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export function detectClashes(
  tasks,
  classSchedules = [],
  profile = {},
  maxDailyHours = 6,
) {
  const timezone = getUserTimezone(profile);
  const clashes = [];

  // Group tasks by deadline
  const byDeadline = {};
  tasks.forEach((t) => {
    if (!t.deadline) return;
    const date = format(toLocalTime(t.deadline), "yyyy-MM-dd");
    if (!byDeadline[date]) byDeadline[date] = [];
    byDeadline[date].push(t);
  });

  // Check: High-priority deadline overlaps
  Object.entries(byDeadline).forEach(([date, dayTasks]) => {
    const high = dayTasks.filter((t) => {
      const tier = t.priority_tier || t.priority;
      return tier === "critical" || tier === "high";
    });
    if (high.length > 1) {
      clashes.push({
        id: `deadline_${date}`,
        type: "deadline_overlap",
        date,
        affectedTasks: high,
        message: `${high.length} high-priority tasks due ${date}`,
        severity: "high",
      });
    }
  });

  return clashes;
}

export function generateSuggestion(clash, allTasks) {
  if (clash.type === "deadline_overlap") {
    const movable = clash.affectedTasks
      .filter((t) => (t.priority_tier || t.priority) !== "critical")
      .sort(
        (a, b) =>
          (PRIORITY_ORDER[a.priority_tier || a.priority] || 2) -
          (PRIORITY_ORDER[b.priority_tier || b.priority] || 2),
      )[0];

    if (!movable) {
      return {
        type: "manual_review",
        message: "All tasks critical - manual review needed",
      };
    }

    let suggested = addDays(parseISO(clash.date), 1);
    return {
      type: "move_deadline",
      taskId: movable.id,
      taskTitle: movable.title,
      newDeadline: suggested,
      message: `Move "${movable.title}" to ${format(suggested, "MMM d")}`,
      reason: "Lowest priority in conflict",
    };
  }
  return null;
}

export async function applySuggestion(suggestion, editTask) {
  if (!suggestion || !editTask) return;
  const updates = {};
  if (suggestion.type === "move_deadline")
    updates.deadline = suggestion.newDeadline;
  await editTask(suggestion.taskId, updates);
}
