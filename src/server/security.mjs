import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";

export const roles = ["READER", "AUTHOR", "REVIEWER", "ADMIN"];

export const rolePermissions = Object.freeze({
  READER: Object.freeze(["VIEW_DOCUMENT", "SEARCH_DOCUMENTS", "ASK_AI"]),
  AUTHOR: Object.freeze(["VIEW_DOCUMENT", "SEARCH_DOCUMENTS", "ASK_AI", "CREATE_DOCUMENT", "EDIT_DOCUMENT", "SUBMIT_REVIEW"]),
  REVIEWER: Object.freeze(["VIEW_DOCUMENT", "SEARCH_DOCUMENTS", "ASK_AI", "READ_REVIEW_QUEUE", "APPROVE_REVIEW", "REJECT_REVIEW", "READ_VERSION_HISTORY"]),
  ADMIN: Object.freeze(["VIEW_DOCUMENT", "SEARCH_DOCUMENTS", "ASK_AI", "READ_REVIEW_QUEUE", "APPROVE_REVIEW", "REJECT_REVIEW", "PUBLISH_DOCUMENT", "READ_VERSION_HISTORY", "MANAGE_USERS", "READ_AUDIT"]),
});

export function hasPermission(role, permission) {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const digest = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${digest}`;
}

export function verifyPassword(password, encodedHash) {
  const [algorithm, salt, expectedHex] = encodedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !expectedHex) return false;

  const expected = Buffer.from(expectedHex, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function signSession(sessionId, expiresAt, secret) {
  const payload = Buffer.from(JSON.stringify({ sid: sessionId, exp: expiresAt.getTime() })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function readSessionToken(token, secret, now = Date.now()) {
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;

  const expected = createHmac("sha256", secret).update(payload).digest();
  let supplied;
  try {
    supplied = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;

  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof claims.sid !== "string" || typeof claims.exp !== "number" || claims.exp <= now) return null;
    return { sessionId: claims.sid, expiresAt: new Date(claims.exp) };
  } catch {
    return null;
  }
}