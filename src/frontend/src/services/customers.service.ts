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
  sortOrder: SortOrder = "ASC"
): Promise<PaginatedCustomers> {
  return apiRequest<PaginatedCustomers>({
    method: "GET",
    url: `/api/customers?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
  });
}
