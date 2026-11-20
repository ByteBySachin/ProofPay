import { useState } from "react";
import { Building2, UserRound, Mail, LockKeyhole, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export default function SignupPage({ onNavigate, onSwitchPage }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", businessName: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.businessName.trim()) return setError("Complete all fields to create your account.");
    if (form.password.length < 8) return setError("Use a password with at least 8 characters.");

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password, businessName: form.businessName.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !data.token) throw new Error(data.message || "Signup failed. Please try again.");

      // For local development. For production, prefer secure HttpOnly cookies.
      localStorage.setItem("proofpay_token", data.token);
      if (data.user) localStorage.setItem("proofpay_user", JSON.stringify(data.user));
      setSuccess("Your account is ready. Opening your workspace…");
      if (onNavigate) onNavigate("Dashboard");
      else window.location.assign("/?page=Dashboard");
    } catch (err) {
      setError(err.message || "Unable to connect. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  const goToLogin = () => onSwitchPage ? onSwitchPage("Login") : window.location.assign("/?page=Login");
  const goHome = () => onNavigate ? onNavigate("Landing") : window.location.assign("/");

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl md:grid-cols-2">
          <section className="hidden flex-col justify-between bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-10 text-white md:flex">
            <button type="button" onClick={goHome} className="flex w-fit items-center gap-2 text-xl font-bold"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">✓</span>ProofPay</button>
            <div><p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">GET STARTED</p><h1 className="max-w-md text-4xl font-bold leading-tight">A clearer way to run your business.</h1><p className="mt-5 max-w-md leading-7 text-blue-100">Create your workspace to organize customers, invoices, payments, and outstanding balances.</p></div>
            <p className="text-sm text-blue-100">One workspace for your business records.</p>
          </section>
          <section className="p-6 sm:p-10 lg:p-12">
            <button type="button" onClick={goHome} className="mb-8 flex items-center gap-2 text-lg font-bold text-slate-900 md:hidden"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">✓</span>ProofPay</button>
            <div className="mx-auto max-w-md">
              <div className="mb-7"><p className="text-sm font-semibold text-blue-600">CREATE YOUR WORKSPACE</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Create an account</h2><p className="mt-2 text-sm leading-6 text-slate-500">Start with your details and business name.</p></div>
              {error && <div role="alert" className="mb-5 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={18} className="mt-0.5 shrink-0" />{error}</div>}
              {success && <div role="status" className="mb-5 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"><CheckCircle2 size={18} className="mt-0.5 shrink-0" />{success}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label htmlFor="signup-name" className="mb-2 block text-sm font-medium text-slate-700">Your full name</label><div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100"><UserRound size={18} className="text-slate-400" /><input id="signup-name" name="name" type="text" autoComplete="name" required value={form.name} onChange={update} placeholder="Your name" className="w-full bg-transparent py-3 text-sm outline-none" /></div></div>
                <div><label htmlFor="signup-business" className="mb-2 block text-sm font-medium text-slate-700">Business name</label><div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100"><Building2 size={18} className="text-slate-400" /><input id="signup-business" name="businessName" type="text" autoComplete="organization" required value={form.businessName} onChange={update} placeholder="Your business name" className="w-full bg-transparent py-3 text-sm outline-none" /></div></div>
                <div><label htmlFor="signup-email" className="mb-2 block text-sm font-medium text-slate-700">Email address</label><div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100"><Mail size={18} className="text-slate-400" /><input id="signup-email" name="email" type="email" autoComplete="email" required value={form.email} onChange={update} placeholder="you@business.com" className="w-full bg-transparent py-3 text-sm outline-none" /></div></div>
                <div><label htmlFor="signup-password" className="mb-2 block text-sm font-medium text-slate-700">Password</label><div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100"><LockKeyhole size={18} className="text-slate-400" /><input id="signup-password" name="password" type="password" autoComplete="new-password" minLength={8} required value={form.password} onChange={update} placeholder="At least 8 characters" className="w-full bg-transparent py-3 text-sm outline-none" /></div><p className="mt-1.5 text-xs text-slate-400">Use at least 8 characters.</p></div>
                <button disabled={loading} type="submit" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Creating account…" : "Create account"}{!loading && <ArrowRight size={17} />}</button>
              </form>
              <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <button type="button" onClick={goToLogin} className="font-semibold text-blue-600 hover:text-blue-700">Sign in</button></p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
