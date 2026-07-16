import { apiRequest } from "./api.config";
import { CustomerProfile } from "./customer.service";

export interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface PaginatedCustomers {
  data: CustomerProfile[];
  pagination: PaginationMeta;
}

export type CustomersSortField = "Name" | "RegistrationDate";
export type SortOrder = "ASC" | "DESC";

export async function getCustomers(
  page = 1,
  limit = 10,
  sortBy: CustomersSortField = "Name",
  sortOrder: SortOrder = "ASC",
  search = ""
): Promise<PaginatedCustomers> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder,
  });
  const trimmed = search.trim();
  if (trimmed) params.set("search", trimmed);

  return apiRequest<PaginatedCustomers>({
    method: "GET",
    url: `/api/customers?${params.toString()}`,
  });
}

export type CustomerStatus = "ACTIVE" | "INACTIVE";

export interface UpdateCustomerStatusResponse {
  message: string;
  customerId: string;
  status: CustomerStatus;
}

export async function updateCustomerStatus(
  customerId: string,
  status: CustomerStatus
): Promise<UpdateCustomerStatusResponse> {
  return apiRequest<UpdateCustomerStatusResponse>({
    method: "PATCH",
    url: `/api/customers/${customerId}/status`,
    body: { status },
  });
}

export interface UpdateCustomerDetailsResponse {
  message: string;
  customerId: string;
  details: string | null;
}

export async function updateCustomerDetails(
  customerId: string,
  details: string | null
): Promise<UpdateCustomerDetailsResponse> {
  return apiRequest<UpdateCustomerDetailsResponse>({
    method: "PATCH",
    url: `/api/customers/${customerId}/details`,
    body: { details },
  });
}
