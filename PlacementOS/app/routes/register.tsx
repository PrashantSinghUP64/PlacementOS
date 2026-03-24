import { useState } from "react";
import type { Route } from "./+types/register";
import { Link, useNavigate } from "react-router";
import { apiFetch } from "~/lib/api";
import { useAppAuthStore } from "~/lib/app-auth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Create account" },
    { name: "description", content: "Register for Resume AI Checker" },
  ];
}

function isValidEmail(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function Register() {
  const navigate = useNavigate();
  const setSession = useAppAuthStore((s) => s.setSession);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  /** Field errors — only set on submit (avoids “invalid email” while fields are empty). */
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
  }>({});

  function validate(): boolean {
    const next: typeof fieldErrors = {};
    if (!name.trim()) next.name = "Username is required";
    if (!email.trim()) {
      next.email = "Email is required";
    } else if (!isValidEmail(email)) {
      next.email = "Please enter a valid email address";
    }
    if (!password) {
      next.password = "Password is required";
    } else if (password.length < 8) {
      next.password = "Password must be at least 8 characters";
    }
    if (password !== confirm) {
      next.confirm = "Passwords do not match";
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        token?: string;
        user?: { id: string; name: string; email: string };
      };
      if (!res.ok) {
        setServerError(data.message || "Registration failed");
        return;
      }
      if (data.token && data.user) {
        setSession(data.token, data.user);
        navigate("/");
      } else {
        setServerError("Unexpected response from server");
      }
    } catch {
      setServerError("Could not reach the server. Is the API running on port 5000?");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover bg-center bg-no-repeat min-h-screen flex items-center justify-center p-4">
      <div className="gradient-border-shadow-lg w-full max-w-md">
        <section className="flex flex-col gap-6 bg-white rounded-2xl p-8 md:p-10">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
            <p className="text-gray-600 text-sm">
              Use your own email and password — no third-party signup modal.
            </p>
          </div>

          {serverError && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {serverError}
            </div>
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="reg-name"
                autoComplete="username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs px-1"
                  onClick={() => setShowPw((v) => !v)}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs px-1"
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
              {fieldErrors.confirm && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.confirm}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="auth-button disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Log in
            </Link>
          </p>

          <p className="text-xs text-gray-500 text-center border-t border-gray-100 pt-4">
            The Puter “Create Free Account” popup is hosted by Puter — use this form instead to avoid
            its validation quirks.
          </p>
        </section>
      </div>
    </main>
  );
}
