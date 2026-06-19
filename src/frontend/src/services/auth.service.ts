import { apiRequest } from "./api.config";

/* ── Login ──────────────────────────────────────────────── */
export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  isTempPassword: boolean;
}

export async function loginCustomer(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw { response: { data } };
  }

  return data as LoginResponse;
}

/* ── Signup ─────────────────────────────────────────────── */
export interface SignupPayload {
  NID: string;
  Name: string;
  FirstLastName: string;
  SecondLastName: string;
  Birthday: string;
  Gender: string;
  FirstTelephone: string;
  SecondTelephone?: string;
  Address: string;
  Email: string;
}

interface SignupResponse {
  message: string;
  customerId: string;
}

export async function signupCustomer(payload: SignupPayload): Promise<SignupResponse> {
  return apiRequest<SignupResponse, SignupPayload>({
    method: "POST",
    url: "/api/signup",
    body: payload,
  });
}

/* ── Recovery password ──────────────────────────────────── */
export interface RecoveryPasswordPayload {
  email: string;
}

export async function recoveryPassword(payload: RecoveryPasswordPayload): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }, RecoveryPasswordPayload>({
    method: "POST",
    url: "/api/recoveryPassword",
    body: payload,
  });
}

/* ── Change password ────────────────────────────────────── */
export interface ChangePasswordPayload {
  email: string;
  password: string;
  newPassword: string;
  confirmation: string;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }, ChangePasswordPayload>({
    method: "POST",
    url: "/api/changePassword",
    body: payload,
  });
}
