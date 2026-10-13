import { createApiServer } from "./http.mjs";

export {
  rolePermissions as ROLES,
  hasPermission,
  hashPassword,
  verifyPassword,
  signSession,
  readSessionToken,
  roles,
} from "./security.mjs";

export function createPermissionBackend(options) {
  return createApiServer(options);
}

export const createBackendServer = createPermissionBackend;
export default createPermissionBackend;
