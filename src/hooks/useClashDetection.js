// FILE: src/hooks/useClashDetection.js
// QUESTMIND INTEGRATION: DEBUG VERSION - shows logs in console
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { useTasks } from "./useTasks";
import { useClassSchedules } from "./useClassSchedules";
import { detectClashes, generateSuggestion } from "../utils/clashResolver";

export function useClashDetection() {
  const { user, profile } = useAuth();
  const { tasks } = useTasks();
  const { schedules: classSchedules } = useClassSchedules();
  const [clashes, setClashes] = useState([]);
  const [suggestions, setSuggestions] = useState({});

  // ✅ CRITICAL: Vite env vars use import.meta.env
  const ZAP_ENABLED = import.meta.env?.VITE_ZAP_ENABLED === "true";
  const maxDailyHours = parseInt(
    import.meta.env?.VITE_ZAP_MAX_DAILY_HOURS || "6",
    10,
  );

  useEffect(() => {
    // DEBUG LOGS
    console.log("[ZAP DEBUG] useClashDetection running");
    console.log("[ZAP DEBUG] ZAP_ENABLED:", ZAP_ENABLED);
    console.log("[ZAP DEBUG] user?.uid:", user?.uid);
    console.log("[ZAP DEBUG] tasks count:", tasks?.length);
    console.log(
      "[ZAP DEBUG] tasks sample:",
      tasks?.slice(0, 2).map((t) => ({
        id: t.id?.slice(0, 8),
        title: t.title,
        priority: t.priority,
        priority_tier: t.priority_tier,
        deadline: t.deadline,
        deadlineType: typeof t.deadline,
      })),
    );

    if (!ZAP_ENABLED) {
      console.log("[ZAP DEBUG] ZAP disabled via env flag");
      setClashes([]);
      setSuggestions({});
      return;
    }
    if (!user?.uid) {
      console.log("[ZAP DEBUG] No user UID");
      setClashes([]);
      setSuggestions({});
      return;
    }
    if (!tasks?.length) {
      console.log("[ZAP DEBUG] No tasks to analyze");
      setClashes([]);
      setSuggestions({});
      return;
    }

    try {
      const detected = detectClashes(
        tasks,
        classSchedules || [],
        profile || {},
        maxDailyHours,
      );
      console.log("[ZAP DEBUG] Clashes detected:", detected.length);
      console.log(
        "[ZAP DEBUG] Clash details:",
        detected.map((c) => ({
          id: c.id,
          type: c.type,
          severity: c.severity,
          message: c.message,
          affected: c.affectedTasks?.map((t) => t.title),
        })),
      );

      setClashes(detected);

      const newSuggestions = {};
      detected.forEach((clash) => {
        newSuggestions[clash.id] = generateSuggestion(
          clash,
          tasks,
          classSchedules || [],
          profile || {},
        );
      });
      setSuggestions(newSuggestions);
    } catch (err) {
      console.error("[ZAP DEBUG] Error in clash detection:", err);
      setClashes([]);
      setSuggestions({});
    }
  }, [tasks, classSchedules, profile, user?.uid, ZAP_ENABLED, maxDailyHours]);

  const getClashesForTask = (taskId) => {
    if (!ZAP_ENABLED) return [];
    return clashes.filter((c) => c.affectedTasks?.some((t) => t.id === taskId));
  };

  const getSuggestionForClash = (clashId) => {
    if (!ZAP_ENABLED) return null;
    return suggestions[clashId] || null;
  };

  return {
    clashes,
    suggestions,
    hasClashes: ZAP_ENABLED && clashes.length > 0,
    getClashesForTask,
    getSuggestionForClash,
    ZAP_ENABLED,
  };
}
