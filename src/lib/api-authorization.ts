/**
 * Server-side gate for APIs that power management-only admin screens.
 * Call only after auth() has returned a session.
 *
 * Accept only explicit string role claims. Avoid coercing arbitrary values
 * into privileged roles if malformed session data reaches this boundary.
 */
export function hasManagementRole(session: unknown): boolean {
  const value = session as {
    user?: { role?: unknown } | null;
  } | null | undefined;

  const rawRole = value?.user?.role;
  if (typeof rawRole !== "string") {
    return false;
  }

  const role = rawRole.trim().toUpperCase();
  return role === "ADMIN" || role === "MANAGER";
}
