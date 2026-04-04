// FILE: src/types/student.js
// ACTION: Create New
// QUESTMIND INTEGRATION: New ZAP type definition (does not affect existing code)

/**
 * @typedef {Object} StudentProfile
 * @property {string} school - Name of school/university
 * @property {string} major - Field of study
 * @property {'freshman'|'sophomore'|'junior'|'senior'|'graduate'} year - Academic year
 * @property {string} semester - e.g., "Fall 2024"
 * @property {string} expectedGraduation - ISO date string "YYYY-MM-DD"
 * @property {number} courseLoad - Credit hours per semester
 */

/**
 * Default empty student profile
 * @type {StudentProfile}
 */
export const defaultStudentProfile = {
  school: '',
  major: '',
  year: 'freshman',
  semester: '',
  expectedGraduation: '',
  courseLoad: 0,
}