/** Backend API base (set in `.env` as `VITE_API_BASE_URL`). */
export function getApiBase(): string {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return (base?.replace(/\/$/, "") || "https://placementos-2q42.onrender.com") as string;
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
