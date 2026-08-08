/**
 * Authentication validation utilities for SRM Opportunity Intelligence Platform
 */

/**
 * Checks if an email belongs to the official SRM Institute domain (@srmist.edu.in)
 */
export function isSrmEmail(email: string): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return normalized.endsWith('@srmist.edu.in');
}

/**
 * Validates standard SRM Registration Number format (e.g., RA2111003010123 or AP2111003010123)
 */
export function isValidRegisterNumber(regNum: string): boolean {
  if (!regNum) return false;
  const regex = /^[A-Z]{2}\d{11,13}$/i;
  return regex.test(regNum.trim());
}

/**
 * Normalizes email address
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
