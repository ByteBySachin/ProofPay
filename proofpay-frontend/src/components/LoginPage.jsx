import { useState } from "react";
import { LockKeyhole, Mail, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export default function LoginPage({ onNavigate, onSwitchPage }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!form.email.trim() || !form.password) return setError("Enter your email and password.");

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase(), password: form.password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !data.token) throw new Error(data.message || "Login failed. Check your details and try again.");

      // For local development. For production, prefer secure HttpOnly cookies.
      localStorage.setItem("proofpay_token", data.token);
      if (data.user) localStorage.setItem("proofpay_user", JSON.stringify(data.user));
      setSuccess("Login successful. Opening your workspace…");
      if (onNavigate) onNavigate("Dashboard");
      else window.location.assign("/?page=Dashboard");
    } catch (err) {
      setError(err.message || "Unable to connect. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  const goToSignup = () => onSwitchPage ? onSwitchPage("Signup") : window.location.assign("/?page=Signup");
  const goHome = () => onNavigate ? onNavigate("Landing") : window.location.assign("/");

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl md:grid-cols-2">
          <section className="hidden flex-col justify-between bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-10 text-white md:flex">
            <button type="button" onClick={goHome} className="flex w-fit items-center gap-2 text-xl font-bold"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">✓</span>ProofPay</button>
            <div><p className="mb-3 text-[12px] font-semibold uppercase tracking-widest text-blue-100">Welcome back</p><h1 className="max-w-md text-[32px] font-bold leading-tight tracking-tight">Know what’s paid. Know what’s next.</h1><p className="mt-5 max-w-md text-[15px] leading-7 text-blue-100">Bring customer records, invoices, payments, and outstanding balances into one clear workspace.</p></div>
            <p className="text-[13px] text-blue-100">A clearer way to manage your business.</p>
          </section>
          <section className="p-6 sm:p-10 lg:p-12">
            <button type="button" onClick={goHome} className="mb-8 flex items-center gap-2 text-lg font-bold text-slate-900 md:hidden"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">✓</span>ProofPay</button>
            <div className="mx-auto max-w-md">
              <div className="mb-8"><p className="text-[12px] font-semibold uppercase tracking-wider text-blue-600">YOUR WORKSPACE</p><h2 className="mt-2 text-[26px] font-bold tracking-tight text-slate-900">Sign in to ProofPay</h2><p className="mt-2 text-[14px] leading-relaxed text-slate-500">Enter your account details to continue.</p></div>
              {error && <div role="alert" className="mb-5 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={18} className="mt-0.5 shrink-0" />{error}</div>}
              {success && <div role="status" className="mb-5 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"><CheckCircle2 size={18} className="mt-0.5 shrink-0" />{success}</div>}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div><label htmlFor="login-email" className="mb-2 block text-sm font-medium text-slate-700">Email address</label><div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100"><Mail size={18} className="text-slate-400" /><input id="login-email" name="email" type="email" autoComplete="email" required value={form.email} onChange={update} placeholder="you@business.com" className="w-full bg-transparent py-3.5 text-sm outline-none" /></div></div>
                <div><label htmlFor="login-password" className="mb-2 block text-sm font-medium text-slate-700">Password</label><div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100"><LockKeyhole size={18} className="text-slate-400" /><input id="login-password" name="password" type="password" autoComplete="current-password" required value={form.password} onChange={update} placeholder="Enter your password" className="w-full bg-transparent py-3.5 text-sm outline-none" /></div></div>
                <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Signing in…" : "Sign in"}{!loading && <ArrowRight size={17} />}</button>
              </form>
              <p className="mt-7 text-center text-sm text-slate-500">New to ProofPay? <button type="button" onClick={goToSignup} className="font-semibold text-blue-600 hover:text-blue-700">Create an account</button></p>
              <p className="mt-8 text-center text-[12px] leading-5 text-slate-400">For production, use secure HttpOnly cookie-based authentication and appropriate account protections.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
