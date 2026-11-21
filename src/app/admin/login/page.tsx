"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Email atau password salah");
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch {
      setError("Terjadi kesalahan pada server");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-cream">
      <div className="border-brutal p-8 sm:p-12 shadow-hard bg-warm-cream w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-mono font-bold text-2xl tracking-tighter text-black flex items-center justify-center gap-2">
            GENSA<span className="text-acid-lime">.</span>
          </div>
          <h1 className="font-grotesk font-black text-3xl sm:text-4xl tracking-tighter text-black mt-2">
            Admin Login
          </h1>
          <p className="text-sm sm:text-base text-black/70 mt-2">
            Masuk ke dashboard administrator GENSA
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 border-2 border-orange bg-orange/10 text-orange text-sm font-mono text-center rounded-none">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-mono font-bold text-black mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border-brutal px-4 py-2 text-black focus:outline-none transition-all"
              placeholder="admin@gensa.id"
            />
          </div>

          <div>
            <label className="block text-sm font-mono font-bold text-black mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border-brutal px-4 py-2 text-black focus:outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full border-brutal px-4 py-3 font-grotesk font-black text-base shadow-hard hover:shadow-hard-hover transition-all uppercase tracking-wider text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t-2 border-black text-center">
          <p className="text-xs sm:text-sm text-black/70">
            Belum punya akun admin? Hubungi administrator sistem.
          </p>
        </div>
      </div>
    </div>
  );
}
