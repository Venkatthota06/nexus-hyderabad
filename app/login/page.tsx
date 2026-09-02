"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import {
  LockKeyhole,
  Loader2,
  LogIn,
  Mail,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await signIn(
        "credentials",
        {
          email,
          password,
          redirect: false,
        }
      );

      if (!result || result.error) {
        setError(
          "Invalid email or password."
        );

        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError(
        "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5">

      <div className="w-full max-w-md">

        <div className="mb-8 text-center">

          <img
            src="/nexus-logo.png"
            alt="Nexus Test Labs"
            className="mx-auto mb-5 h-16 w-auto"
          />

          <h1 className="text-3xl font-bold text-white">
            Nexus Hyderabad CRM
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Secure administrator login
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-800 bg-slate-900 p-7 shadow-2xl"
        >

          <div className="mb-6">

            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Admin Email
            </label>

            <div className="relative">

              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                required
                autoComplete="email"
                placeholder="Enter admin email"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-slate-500"
              />

            </div>

          </div>

          <div className="mb-6">

            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Password
            </label>

            <div className="relative">

              <LockKeyhole
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                required
                autoComplete="current-password"
                placeholder="Enter password"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-slate-500"
              />

            </div>

          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}

          </button>

        </form>

        <p className="mt-5 text-center text-xs text-slate-500">
          Authorized Nexus Test Labs users only.
        </p>

      </div>

    </main>
  );
}