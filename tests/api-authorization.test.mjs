import test from "node:test";
import assert from "node:assert/strict";
import { hasManagementRole } from "../src/lib/api-authorization.ts";

test("ADMIN and MANAGER have management access", () => {
  assert.equal(hasManagementRole({ user: { role: "ADMIN" } }), true);
  assert.equal(hasManagementRole({ user: { role: "MANAGER" } }), true);
  assert.equal(hasManagementRole({ user: { role: "manager" } }), true);
});

test("TEAM and missing sessions do not have management access", () => {
  assert.equal(hasManagementRole({ user: { role: "TEAM" } }), false);
  assert.equal(hasManagementRole({ user: { role: "UNKNOWN" } }), false);
  assert.equal(hasManagementRole({ user: {} }), false);
  assert.equal(hasManagementRole(null), false);
  assert.equal(hasManagementRole(undefined), false);
});
