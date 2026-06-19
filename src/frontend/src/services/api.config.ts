import axios, { AxiosRequestConfig, Method } from "axios";
import { tokenStore } from "../lib/tokenStore";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const ensureLeadingSlash = (p: string) => (p.startsWith("/") ? p : `/${p}`);

export const buildApiUrl = (path: string): string => {
  const p = ensureLeadingSlash(path);
  if (p.startsWith("/api")) return `${API_BASE_URL}${p}`;
  return `${API_BASE_URL}/api${p}`;
};

const stripApiPrefix = (path: string) =>
  path.startsWith("/api") ? path.slice(4) : path;

type ApiRequestOptions<TBody = unknown> = {
  method: Method;
  url: string;
  body?: TBody;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  config?: AxiosRequestConfig;
};

export async function apiRequest<TResponse = unknown, TBody = unknown>(
  options: ApiRequestOptions<TBody>
): Promise<TResponse> {
  const token = tokenStore.get();

  const normalizedUrl = stripApiPrefix(options.url || "");

  const axiosConfig: AxiosRequestConfig = {
    method: options.method,
    url: buildApiUrl(normalizedUrl),
    data: options.body,
    withCredentials: options.withCredentials,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
      ...(options.headers ?? {}),
    },
    ...(options.config ?? {}),
  };

  const response = await axios(axiosConfig);
  return response.data as TResponse;
}
