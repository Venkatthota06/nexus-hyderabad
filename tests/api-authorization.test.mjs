import test from "node:test";
import assert from "node:assert/strict";
import { hasManagementRole, hasValidApiRole, isRecordOwnedBy } from "../src/lib/api-authorization.ts";

test("ADMIN and MANAGER have management access", () => {
  assert.equal(hasManagementRole({ user: { role: "ADMIN" } }), true);
  assert.equal(hasManagementRole({ user: { role: "MANAGER" } }), true);
  assert.equal(hasManagementRole({ user: { role: "manager" } }), true);
  assert.equal(hasManagementRole({ user: { role: "  admin  " } }), true);
});

test("TEAM and unknown string roles do not have management access", () => {
  assert.equal(hasManagementRole({ user: { role: "TEAM" } }), false);
  assert.equal(hasManagementRole({ user: { role: "UNKNOWN" } }), false);
  assert.equal(hasManagementRole({ user: { role: "" } }), false);
  assert.equal(hasManagementRole({ user: { role: "   " } }), false);
});

test("missing sessions and malformed role claims fail closed", () => {
  assert.equal(hasManagementRole(null), false);
  assert.equal(hasManagementRole(undefined), false);
  assert.equal(hasManagementRole({}), false);
  assert.equal(hasManagementRole({ user: null }), false);
  assert.equal(hasManagementRole({ user: {} }), false);
  assert.equal(hasManagementRole({ user: { role: null } }), false);
  assert.equal(hasManagementRole({ user: { role: 1 } }), false);
  assert.equal(hasManagementRole({ user: { role: ["ADMIN"] } }), false);
  assert.equal(hasManagementRole({ user: { role: { toString: () => "ADMIN" } } }), false);
});

test("API role validation accepts only recognized roles and requires a TEAM identity", () => {
  assert.equal(hasValidApiRole({ user: { role: "ADMIN" } }), true);
  assert.equal(hasValidApiRole({ user: { role: "manager" } }), true);
  assert.equal(hasValidApiRole({ user: { role: "TEAM", name: "Venkat" } }), true);
  assert.equal(hasValidApiRole({ user: { role: "TEAM", name: "  " } }), false);
  assert.equal(hasValidApiRole({ user: { role: "GUEST", name: "Venkat" } }), false);
  assert.equal(hasValidApiRole({ user: { role: 1, name: "Venkat" } }), false);
  assert.equal(hasValidApiRole({ user: { role: ["ADMIN"], name: "Venkat" } }), false);
  assert.equal(hasValidApiRole(null), false);
});

test("record ownership comparison trims labels, ignores case, and rejects empty or malformed identities", () => {
  assert.equal(isRecordOwnedBy(" Venkat ", "venkat"), true);
  assert.equal(isRecordOwnedBy("VENKAT", " Venkat"), true);
  assert.equal(isRecordOwnedBy("Venkat", "Other"), false);
  assert.equal(isRecordOwnedBy(" ", "Venkat"), false);
  assert.equal(isRecordOwnedBy("Venkat", " "), false);
  assert.equal(isRecordOwnedBy(null, "Venkat"), false);
  assert.equal(isRecordOwnedBy("Venkat", 42), false);
});


test("follow-up ownership honors explicit assignment before creator fallback", async () => {
  const { isRecordOwnedByOrCreatedBy } = await import("../src/lib/api-authorization.ts");
  assert.equal(isRecordOwnedByOrCreatedBy({ salesOwner: " Venkat ", createdBy: "Other" }, "venkat"), true);
  assert.equal(isRecordOwnedByOrCreatedBy({ salesOwner: "Other", createdBy: "Venkat" }, "Venkat"), false);
  assert.equal(isRecordOwnedByOrCreatedBy({ assignedTo: "Venkat" }, "venkat"), true);
  assert.equal(isRecordOwnedByOrCreatedBy({ owner: "Other", createdBy: "Venkat" }, "Venkat"), false);
  assert.equal(isRecordOwnedByOrCreatedBy({ createdBy: " Venkat " }, "venkat"), true);
  assert.equal(isRecordOwnedByOrCreatedBy({ createdBy: " " }, "venkat"), false);
  assert.equal(isRecordOwnedByOrCreatedBy(null, "venkat"), false);
});
