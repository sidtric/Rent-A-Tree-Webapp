const BASE = `${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api`;

const headers = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  get:       (path: string) =>
    fetch(`${BASE}${path}`, { headers: headers() }).then(r => r.json()),
  post:      (path: string, body: unknown) =>
    fetch(`${BASE}${path}`, { method: 'POST',   headers: headers(), body: JSON.stringify(body) }).then(r => r.json()),
  patch:     (path: string) =>
    fetch(`${BASE}${path}`, { method: 'PATCH',  headers: headers() }).then(r => r.json()),
  patchBody: (path: string, body: unknown) =>
    fetch(`${BASE}${path}`, { method: 'PATCH',  headers: headers(), body: JSON.stringify(body) }).then(r => r.json()),
  put:       (path: string, body: unknown) =>
    fetch(`${BASE}${path}`, { method: 'PUT',    headers: headers(), body: JSON.stringify(body) }).then(r => r.json()),
  del:       (path: string) =>
    fetch(`${BASE}${path}`, { method: 'DELETE', headers: headers() }).then(r => r.json()),
};
