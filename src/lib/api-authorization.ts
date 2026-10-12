type SessionLike = {
  user?: {
    role?: string | null;
  } | null;
} | null | undefined;

/**
 * Server-side gate for APIs that power management-only admin screens.
 * Call only after auth() has returned a session.
 */
export function hasManagementRole(session: SessionLike): boolean {
  const role = String(session?.user?.role || "TEAM").trim().toUpperCase();
  return role === "ADMIN" || role === "MANAGER";
}
