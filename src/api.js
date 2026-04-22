const API = import.meta.env.VITE_API_URL;
export function resolveApiUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return `${API}${path}`;
  return path;
}

export async function api(path, opts = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {})
    }
  });
  if (!res.ok) {
    const txt = await res.text().catch(()=> '');
    const error = new Error(txt || `API error (${res.status})`);
    error.status = res.status;
    throw error;
  }
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return null;
  return res.json();
}
export const setToken = (t)=>localStorage.setItem('token', t);
export const clearToken = ()=>localStorage.removeItem('token');
