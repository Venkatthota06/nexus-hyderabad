import test from "node:test";
import assert from "node:assert/strict";
import { hasManagementRole, hasValidApiRole } from "../src/lib/api-authorization.ts";

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
