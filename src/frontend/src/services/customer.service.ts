import { apiRequest } from "./api.config";

export interface NIDLookupResponse {
  nid: string;
  name: string | null;
}

export async function lookupCustomerByNID(nid: string): Promise<NIDLookupResponse> {
  return apiRequest<NIDLookupResponse>({
    method: "GET",
    url: `/api/customer/lookup/${nid}`,
  });
}
