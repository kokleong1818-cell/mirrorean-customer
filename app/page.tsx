"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "https://vefcgkgnpx.us-east-1.awsapprunner.com";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email || !password) { setError("Please enter email and password"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${BACKEND}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.access_token) { setError(data.detail || "Invalid credentials"); setLoading(false); return; }
      const payload = JSON.parse(atob(data.access_token.split(".")[1]));
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("tenant_id", payload.tenant_id);
      router.push("/dashboard");
    } catch { setError("Connection error"); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-white mb-1">Mirrorean</div>
          <div className="text-gray-500 text-sm">Customer Portal</div>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Sign in to your account</h2>
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="you@company.com"
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm" />
            </div>
          </div>
          <button onClick={handleLogin} disabled={loading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors text-sm">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
        <p className="text-center text-gray-600 text-xs mt-6">Powered by Mirrorean AI</p>
      </div>
    </div>
  );
}