// FILE: src/hooks/useClassSchedules.js
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

export function useClassSchedules() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    if (!user?.uid) {
      setSchedules([]);
      return;
    }
    // For now, return empty - class schedules come later
    setSchedules([]);
  }, [user?.uid]);

  return {
    schedules,
    loading: false,
    error: null,
    addSchedule: async () => {},
    updateSchedule: async () => {},
    removeSchedule: async () => {},
  };
}
