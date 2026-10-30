/**
 * Read the role only from an explicit string claim. Malformed session values
 * must never be coerced into a privileged or team role.
 */
function sessionRole(session: unknown): string | null {
  const value = session as {
    user?: { role?: unknown } | null;
  } | null | undefined;
  const rawRole = value?.user?.role;
  return typeof rawRole === "string" ? rawRole.trim().toUpperCase() : null;
}

/**
 * Server-side gate for APIs that power management-only admin screens.
 * Call only after auth() has returned a session.
 */
export function hasManagementRole(session: unknown): boolean {
  const role = sessionRole(session);
  return role === "ADMIN" || role === "MANAGER";
}

/**
 * Validate the role before APIs apply TEAM ownership filters. TEAM sessions
 * also need a non-empty name because current record ownership uses that field.
 */
export function hasValidApiRole(session: unknown): boolean {
  const role = sessionRole(session);
  if (role === "ADMIN" || role === "MANAGER") return true;
  if (role !== "TEAM") return false;

  const value = session as {
    user?: { name?: unknown } | null;
  } | null | undefined;
  return typeof value?.user?.name === "string" && value.user.name.trim().length > 0;
}

/** Compare persisted ownership labels safely and consistently. */
export function isRecordOwnedBy(owner: unknown, identity: unknown): boolean {
  if (typeof owner !== "string" || typeof identity !== "string") return false;
  const normalizedOwner = owner.trim().toLocaleLowerCase("en");
  const normalizedIdentity = identity.trim().toLocaleLowerCase("en");
  return normalizedOwner.length > 0 && normalizedIdentity.length > 0 && normalizedOwner === normalizedIdentity;
}


/**
 * Follow-up records may use one of several assignment fields. An explicit
 * assignment takes precedence; creator ownership is only a fallback when
 * the record has no assignment at all.
 */
export function isRecordOwnedByOrCreatedBy(record: unknown, identity: unknown): boolean {
  if (!record || typeof record !== "object") return false;
  const value = record as Record<string, unknown>;
  const assignedOwner = ["salesOwner", "assignedTo", "owner"]
    .map((field) => value[field])
    .find((owner) => typeof owner === "string" && owner.trim().length > 0);

  if (assignedOwner !== undefined) return isRecordOwnedBy(assignedOwner, identity);
  return isRecordOwnedBy(value.createdBy, identity);
}
