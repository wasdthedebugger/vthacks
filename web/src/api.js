const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4100";

const TOKEN_KEY = "persist_health_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/api${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));

  // A 401 from the login call means "wrong credentials" — surface the server's
  // message. A 401 from /me means "nobody is signed in", which is the normal
  // state of a public visitor: App decides what to render from it, so redirecting
  // here would bounce every visitor off the landing page. A 401 from anything
  // else means the session died mid-use, so drop the token and send them to sign
  // in rather than half-rendering a clinical page.
  if (res.status === 401 && !path.startsWith("/auth/login")) {
    clearToken();
    if (path !== "/me" && !location.pathname.startsWith("/login")) location.href = "/login";
    throw new ApiError(401, body.error || "Your session expired — please sign in again");
  }
  if (!res.ok) {
    throw new ApiError(res.status, body.error || body.errors?.join(", ") || res.statusText, body.errors);
  }
  return body;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
};
