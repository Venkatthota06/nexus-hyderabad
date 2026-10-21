/**
 * Server-side gate for APIs that power management-only admin screens.
 * Call only after auth() has returned a session.
 */
export function hasManagementRole(session: unknown): boolean {
  const value = session as {
    user?: { role?: unknown } | null;
  } | null | undefined;
  const role = String(value?.user?.role || "TEAM").trim().toUpperCase();
  return role === "ADMIN" || role === "MANAGER";
}
