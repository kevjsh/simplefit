import axios, { AxiosRequestConfig, Method } from "axios";

function getApiBaseUrl(): string {
  if (typeof window === "undefined") return "http://localhost:4000";
  const { hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") return "http://localhost:4000";
  if (hostname.startsWith("192.168.") || hostname.startsWith("10.") || hostname.startsWith("172."))
    return `http://${hostname}:4000`;
  return `${window.location.protocol}//${hostname}`;
}

const API_BASE_URL = getApiBaseUrl();

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
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

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