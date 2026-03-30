export const ROLES = {
  ADMIN: 'admin',
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

export function normalizeRole(role: unknown): string {
  return String(role ?? '')
    .trim()
    .toLowerCase();
}

export function isAdminRole(role: unknown): boolean {
  return normalizeRole(role) === ROLES.ADMIN;
}
