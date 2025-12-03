// src/lib/scormApi.ts
import axios from "axios";
import type { LicenseDetailsResponse, LicenseRow } from "../types";

// new base (use env)
const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export async function fetchLicenseDetails(params?: {
  date_from?: string;
  date_to?: string;
  page?: number;
}): Promise<LicenseRow[]> {
  // call your backend proxy endpoint
  const url = `${API_BASE}/api/license-details`;

  const body = {
    date_from: params?.date_from,
    date_to: params?.date_to,
    page: params?.page ?? 1,
  };

  const res = await axios.post<{
    ok: boolean;
    license?: LicenseRow[];
    error?: string;
  }>(url, body, {
    headers: {
      "Content-Type": "application/json",
      // optionally send an auth header if you protect the endpoint:
      // Authorization: `Bearer ${import.meta.env.VITE_FRONTEND_API_KEY}`
    },
  });

  if (!res.data.ok)
    throw new Error(res.data.error ?? "failed to fetch licenses");
  return res.data.license ?? [];
}
