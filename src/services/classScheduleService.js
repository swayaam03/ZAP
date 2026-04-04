// FILE: src/services/classScheduleService.js
// QUESTMIND INTEGRATION: Class schedule service for protected time blocks (ZAP)
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const CLASS_SCHEDULES = (uid) => `users/${uid}/classSchedules`;

/**
 * Get user's class schedules
 */
export function getClassSchedules(uid, onSuccess, onError) {
  const q = query(
    collection(db, CLASS_SCHEDULES(uid)),
    orderBy("dayOfWeek", "asc"),
    orderBy("startTime", "asc"),
  );

  return onSnapshot(
    q,
    (snap) => {
      const schedules = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onSuccess(schedules);
    },
    (err) => onError?.(err),
  );
}

/**
 * Create a new class schedule
 */
export async function createClassSchedule(uid, data) {
  return addDoc(collection(db, CLASS_SCHEDULES(uid)), {
    courseName: data.courseName?.trim() || "",
    dayOfWeek: data.dayOfWeek, // 0-6 (Sun-Sat)
    startTime: data.startTime, // "09:00"
    endTime: data.endTime, // "10:30"
    location: data.location?.trim() || "",
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update class schedule
 */
export async function updateClassSchedule(uid, scheduleId, updates) {
  await updateDoc(doc(db, CLASS_SCHEDULES(uid), scheduleId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete class schedule
 */
export async function deleteClassSchedule(uid, scheduleId) {
  await deleteDoc(doc(db, CLASS_SCHEDULES(uid), scheduleId));
}

/**
 * Get class schedules for a specific day
 */
export function getSchedulesForDay(schedules, dayOfWeek) {
  return schedules.filter(
    (s) => s.dayOfWeek === dayOfWeek && s.isActive !== false,
  );
}

/**
 * Check if a time slot conflicts with any class
 */
export function hasClassConflict(schedules, dayOfWeek, startTime, endTime) {
  const daySchedules = getSchedulesForDay(schedules, dayOfWeek);

  for (const cls of daySchedules) {
    // Check for overlap: if start < classEnd AND end > classStart = overlap
    if (startTime < cls.endTime && endTime > cls.startTime) {
      return true;
    }
  }
  return false;
}
