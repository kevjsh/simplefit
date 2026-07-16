import { Request } from "express";

export interface IPaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface IPaginatedResult<T> {
  data: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

const DEFAULT_PAGE_SIZE = 10;

/**
 * Reads `page` and `limit` from the request query string and normalizes them
 * into safe, positive integers ready to be used with Sequelize's `limit`/`offset`.
 */
export function getPaginationParams(req: Request, pageSize: number = DEFAULT_PAGE_SIZE): IPaginationParams {
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
  const limit = Math.max(1, parseInt(String(req.query.limit ?? pageSize), 10) || pageSize);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Wraps a page of rows (e.g. from `findAndCountAll`) into a consistent
 * paginated response shape.
 */
export function buildPaginatedResult<T>(rows: T[], totalItems: number, params: IPaginationParams): IPaginatedResult<T> {
  return {
    data: rows,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / params.limit),
      currentPage: params.page,
      pageSize: params.limit,
    },
  };
}

export type SortOrder = "ASC" | "DESC";

export interface ISortParams {
  sortBy: string;
  sortOrder: SortOrder;
}

/**
 * Reads `sortBy` and `sortOrder` from the request query string. Falls back to
 * `defaultField`/`defaultOrder` whenever the requested field isn't in
 * `allowedFields` or the order isn't a valid direction — this keeps sortable
 * columns to an explicit allowlist per endpoint and avoids arbitrary column
 * sorting from user input.
 */
export function getSortParams(
  req: Request,
  allowedFields: string[],
  defaultField: string,
  defaultOrder: SortOrder = "ASC"
): ISortParams {
  const requestedField = String(req.query.sortBy ?? "");
  const sortBy = allowedFields.includes(requestedField) ? requestedField : defaultField;

  const requestedOrder = String(req.query.sortOrder ?? "").toUpperCase();
  const sortOrder: SortOrder = requestedOrder === "ASC" || requestedOrder === "DESC" ? requestedOrder : defaultOrder;

  return { sortBy, sortOrder };
}

/**
 * Reads an optional `search` query string and trims it. Returns `null` when
 * empty so callers can skip applying a filter.
 */
export function getSearchQuery(req: Request, paramName = "search"): string | null {
  const raw = req.query[paramName];
  if (raw === undefined || raw === null) return null;

  const value = String(Array.isArray(raw) ? raw[0] : raw).trim();
  return value.length > 0 ? value : null;
}
