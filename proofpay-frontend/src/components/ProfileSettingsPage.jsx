import { useState, useEffect } from 'react'
import { UserRound, Mail, Phone, Save, CheckCircle2, Loader2 } from 'lucide-react'
import { useProfile } from '../context/ProfileContext'

export default function ProfileSettingsPage() {
  const { profile, updateProfile, loading } = useProfile()

  const [form, setForm] = useState({ fullName: profile.fullName, email: profile.email, phone: profile.phone || '' })
  const [saved, setSaved] = useState(false)

  // Sync when profile loads from backend
  useEffect(() => {
    setForm({ fullName: profile.fullName, email: profile.email, phone: profile.phone || '' })
  }, [profile.fullName, profile.email, profile.phone])

  function update(event) {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }))
    setSaved(false)
  }

  function submit(event) {
    event.preventDefault()
    updateProfile(form)
    setSaved(true)
  }

  const inputClass = 'mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50'

  if (loading) {
    return (
      <section className="mx-auto flex w-full max-w-[1000px] items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-blue-600" />
        <span className="ml-3 text-sm text-slate-500">Loading profile settings…</span>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-[1000px] space-y-6 pb-8">
      <header>
        <p className="mb-2 text-xs font-medium text-slate-400">Workspace / Settings / Profile Settings</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">Profile Settings</h1>
        <p className="mt-1.5 text-sm leading-6 text-slate-500">Edit the personal details associated with your ProofPay profile.</p>
      </header>
      <form onSubmit={submit} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:px-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><UserRound size={20} /></span>
          <div><h2 className="font-semibold text-slate-900">Personal details</h2><p className="mt-1 text-sm text-slate-500">Name and contact information only.</p></div>
        </div>
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <label className="text-sm font-medium text-slate-700">Full name
            <input className={inputClass} name="fullName" value={form.fullName} onChange={update} required maxLength={100} />
          </label>
          <label className="text-sm font-medium text-slate-700">Email address
            <span className="relative mt-1.5 block"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className={`${inputClass} pl-9`} name="email" type="email" value={form.email} onChange={update} required /></span>
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">Phone number
            <span className="relative mt-1.5 block"><Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className={`${inputClass} pl-9`} name="phone" type="tel" value={form.phone} onChange={update} placeholder="Add your phone number" /></span>
          </label>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-slate-400">Changes are saved locally for this session.</p>
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700" type="submit">{saved ? <CheckCircle2 size={17} /> : <Save size={17} />}{saved ? 'Profile settings saved' : 'Save profile settings'}</button>
        </div>
      </form>
    </section>
  )
}
