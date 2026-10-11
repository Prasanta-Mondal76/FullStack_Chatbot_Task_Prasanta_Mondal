const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export type UserType = 'Student' | 'Customer' | 'Other';
export type EnquiryStatus = 'New' | 'Contacted' | 'In Progress' | 'Closed';

export interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  userType: UserType;
  interest: string;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryInput {
  name: string;
  email: string;
  phone: string;
  userType: string;
  interest: string;
  message: string;
}

export interface ApiError extends Error {
  details?: { field: string; message: string }[];
  status?: number;
}

// The admin key is kept in sessionStorage (cleared when the tab closes) and
// sent as the `x-admin-key` header on admin requests. It is never stored in
// the code or bundled into the app.
const ADMIN_KEY_STORAGE = 'dronetv_admin_key';

export function getAdminKey(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_KEY_STORAGE);
  } catch {
    return null;
  }
}

export function setAdminKey(key: string): void {
  try {
    sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
  } catch {
    /* storage unavailable — key simply won't persist */
  }
}

export function clearAdminKey(): void {
  try {
    sessionStorage.removeItem(ADMIN_KEY_STORAGE);
  } catch {
    /* ignore */
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  const adminKey = getAdminKey();
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      // Default headers first; options.headers (if any) win over them.
      headers: {
        'Content-Type': 'application/json',
        ...(adminKey ? { 'x-admin-key': adminKey } : {}),
        ...(options?.headers || {}),
      },
    });
  } catch {
    throw new Error('Could not reach the server. Please check your connection and try again.');
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(
      (body && body.message) || 'Something went wrong. Please try again.'
    ) as ApiError;
    err.details = body.errors;
    err.status = res.status;
    throw err;
  }
  return body as T;
}

export const api = {
  list: (params?: { search?: string; userType?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.userType) q.set('userType', params.userType);
    if (params?.status) q.set('status', params.status);
    const qs = q.toString();
    return request<{ success: boolean; count: number; data: Enquiry[] }>(
      `/api/enquiries${qs ? `?${qs}` : ''}`
    );
  },
  get: (id: string) =>
    request<{ success: boolean; data: Enquiry }>(`/api/enquiries/${id}`),
  create: (input: EnquiryInput) =>
    request<{ success: boolean; message: string; data: Enquiry }>('/api/enquiries', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateStatus: (id: string, status: string) =>
    request<{ success: boolean; message: string; data: Enquiry }>(`/api/enquiries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  remove: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/enquiries/${id}`, {
      method: 'DELETE',
    }),
};
