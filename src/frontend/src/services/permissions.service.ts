import { apiRequest } from "./api.config";

export interface Permission {
  Id: number;
  PermissionKey: string;
  Description: string | null;
}

export interface Role {
  Id: string;
  RoleType: string;
  Description: string | null;
  CreatedAt: string;
}

export interface RolePermission {
  RoleId: string;
  PermissionId: number;
  role?: Role;
  permission?: Permission;
}

export async function getAllPermissions(): Promise<Permission[]> {
  return apiRequest<Permission[]>({
    method: "GET",
    url: "/api/permissions",
  });
}

export async function getAllRolePermissions(): Promise<RolePermission[]> {
  return apiRequest<RolePermission[]>({
    method: "GET",
    url: "/api/role-permissions",
  });
}

export async function createPermission(
  permissionKey: string,
  description?: string
): Promise<Permission> {
  return apiRequest<Permission>({
    method: "POST",
    url: "/api/permissions",
    body: {
      PermissionKey: permissionKey,
      Description: description || null,
    },
  });
}

export async function deletePermission(permissionId: number): Promise<void> {
  return apiRequest<void>({
    method: "DELETE",
    url: `/api/permissions/${permissionId}`,
  });
}

export async function createRolePermission(
  roleId: string,
  permissionId: number
): Promise<RolePermission> {
  return apiRequest<RolePermission>({
    method: "POST",
    url: "/api/role-permissions",
    body: {
      RoleId: roleId,
      PermissionId: permissionId,
    },
  });
}

export async function deleteRolePermission(
  roleId: string,
  permissionId: number
): Promise<void> {
  return apiRequest<void>({
    method: "DELETE",
    url: `/api/role-permissions/${roleId}/${permissionId}`,
  });
}

export async function getAllRoles(): Promise<Role[]> {
  return apiRequest<Role[]>({
    method: "GET",
    url: "/api/roles",
  });
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }
  return fallback;
}

export { getErrorMessage };
