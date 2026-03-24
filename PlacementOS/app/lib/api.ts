/** Backend API base (set in `.env` as `VITE_API_URL`). */
export function getApiBase(): string {
  const base = import.meta.env.VITE_API_URL as string | undefined;
  return (base?.replace(/\/$/, "") || "http://localhost:5000") as string;
}

export async function apiFetch(
  path: string,
  init: RequestInit & { token?: string | null } = {}
): Promise<Response> {
  const { token, headers: hdrs, ...rest } = init;
  const headers = new Headers(hdrs);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && rest.body && typeof rest.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${getApiBase()}${path.startsWith("/") ? path : `/${path}`}`, {
    ...rest,
    headers,
  });
}
