import axios from "axios";
import { apiRequest, buildApiUrl } from "./api.config";
import { tokenStore } from "../lib/tokenStore";

export interface NIDLookupResponse {
  nid: string;
  name: string | null;
}

export interface CustomerProfile {
  Id: string;
  NID: string;
  Name: string;
  FirstLastName: string;
  SecondLastName: string;
  Birthday: string;
  Gender: string;
  FirstTelephone: string;
  SecondTelephone: string | null;
  Address: string;
  Email: string;
  Details: string | null;
  ProfilePicture: string | null;
  RegistrationDate: string | null;
  LastLogin: string | null;
  Status: string;
}

export async function lookupCustomerByNID(nid: string): Promise<NIDLookupResponse> {
  return apiRequest<NIDLookupResponse>({
    method: "GET",
    url: `/api/customer/lookup/${nid}`,
  });
}

export async function getCustomerProfile(email: string): Promise<CustomerProfile> {
  return apiRequest<CustomerProfile>({
    method: "GET",
    url: `/api/customer/profile/${encodeURIComponent(email)}`,
  });
}

export interface UploadProfilePictureResponse {
  message: string;
  profilePicture: string;
}

export async function uploadProfilePicture(file: File): Promise<UploadProfilePictureResponse> {
  const token = tokenStore.get();
  const formData = new FormData();
  formData.append("profilePicture", file);

  const response = await axios.post<UploadProfilePictureResponse>(
    buildApiUrl("/customer/profile-picture"),
    formData,
    {
      headers: {
        ...(token ? { Authorization: token } : {}),
      },
    }
  );

  return response.data;
}

export interface UpdateProfilePayload {
  Name?: string;
  FirstLastName?: string;
  SecondLastName?: string;
  FirstTelephone?: string;
  SecondTelephone?: string | null;
  Gender?: string;
  Address?: string;
}

export interface UpdateProfileResponse {
  message: string;
  customer: CustomerProfile;
}

export async function updateCustomerProfile(
  email: string,
  data: UpdateProfilePayload
): Promise<UpdateProfileResponse> {
  return apiRequest<UpdateProfileResponse>({
    method: "PUT",
    url: `/api/customer/profile/${encodeURIComponent(email)}`,
    body: data,
  });
}
