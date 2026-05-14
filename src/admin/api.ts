const BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:5000';

async function request(path: string, options?: RequestInit): Promise<any> {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${BASE}/api${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok && !data.message) data.message = `Request failed (${res.status})`;
    return data;
  } catch {
    return { message: 'Network error' };
  }
}

export const api = {
  get:       (path: string)              => request(path),
  post:      (path: string, body: any)   => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  patchBody: (path: string, body: any)   => request(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  del:       (path: string)              => request(path, { method: 'DELETE' }),
};
