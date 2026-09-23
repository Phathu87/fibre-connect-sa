const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function apiGet(path, params) {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' || value === false) return;
      url.searchParams.set(key, Array.isArray(value) ? value.join(',') : String(value));
    });
  }

  const response = await fetch(url, { credentials: 'include', headers: { accept: 'application/json' } });
  if (response.status === 404) return null;
  if (!response.ok) throw await apiError(response);
  return response.json();
}

export async function apiPost(path, body) {
  return apiMutation('POST', path, body);
}

export function apiPatch(path, body) { return apiMutation('PATCH', path, body); }
export function apiPut(path, body) { return apiMutation('PUT', path, body); }
export function apiDelete(path, body) { return apiMutation('DELETE', path, body); }

async function apiMutation(method, path, body) {
  const csrf = document.cookie.split('; ').find(item => item.startsWith('fc_csrf='))?.split('=')[1];
  const response = await fetch(`${API_BASE_URL}${path}`, { method, credentials: 'include', headers: { accept: 'application/json', 'content-type': 'application/json', ...(csrf ? { 'x-csrf-token': decodeURIComponent(csrf) } : {}) }, body: JSON.stringify(body ?? {}) });
  if (!response.ok) throw await apiError(response);
  return response.json();
}

async function apiError(response) {
  const payload = await response.json().catch(() => null);
  return new ApiError(
    payload?.error?.message || `API request failed with status ${response.status}`,
    response.status,
    payload?.error?.code,
  );
}
