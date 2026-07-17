import { apiRequest } from "./api.config";
import { Role } from "./permissions.service";
import { PaginationMeta } from "./customers.service";

export interface Branch {
  Id: number | string;
  Type: string;
  Name: string;
  ShortName: string;
  Status: string;
}

export interface UserRoleCustomer {
  Id: string;
  Name: string;
  FirstLastName: string;
  SecondLastName?: string | null;
  ProfilePicture?: string | null;
  Email?: string | null;
}

export interface UserRoleAssignment {
  Id: string;
  CustomerId: string;
  RoleId: string;
  BranchId: string | number | null;
  AssignedBy: string;
  AssignedAt: string;
  Status: string;
  Role?: Role;
  Customer?: UserRoleCustomer;
}

export interface PaginatedUserRoles {
  data: UserRoleAssignment[];
  pagination: PaginationMeta;
}

export interface CreateUserRolePayload {
  CustomerId: string;
  RoleId: string;
  BranchId?: string | number | null;
  AssignedBy: string;
  Status?: string;
}

export async function getAllUserRoles(
  page = 1,
  limit = 10,
  branchId?: string | number | null,
  customerId?: string | null
): Promise<PaginatedUserRoles> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (branchId != null && String(branchId).trim() !== "") {
    params.set("branchId", String(branchId));
  }
  if (customerId != null && customerId.trim() !== "") {
    params.set("customerId", customerId.trim());
  }

  return apiRequest<PaginatedUserRoles>({
    method: "GET",
    url: `/api/roles/users?${params.toString()}`,
  });
}

export async function createUserRole(
  payload: CreateUserRolePayload
): Promise<UserRoleAssignment> {
  return apiRequest<UserRoleAssignment>({
    method: "POST",
    url: "/api/roles/user",
    body: payload,
  });
}

export async function activateUserRole(id: string): Promise<UserRoleAssignment> {
  return apiRequest<UserRoleAssignment>({
    method: "PATCH",
    url: `/api/roles/user/${id}/activate`,
  });
}

export async function deactivateUserRole(id: string): Promise<UserRoleAssignment> {
  return apiRequest<UserRoleAssignment>({
    method: "PATCH",
    url: `/api/roles/user/${id}/deactivate`,
  });
}

export async function deleteUserRole(id: string): Promise<void> {
  return apiRequest<void>({
    method: "DELETE",
    url: `/api/roles/user/${id}`,
  });
}

export async function getAllBranches(): Promise<Branch[]> {
  return apiRequest<Branch[]>({
    method: "GET",
    url: "/api/branches",
  });
}
