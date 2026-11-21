
import { useState, useEffect } from 'react'
import {
  Settings2,
  ShieldCheck,
  Bell,
  LockKeyhole,
  Mail,
  Save,
  CheckCircle2,
  UserRound,
  Building2,
  Phone,
  MapPin,
  Globe,
} from 'lucide-react'
import { useProfile } from '../context/ProfileContext'

export default function AccountSettingsPage() {
  const {
    profile,
    updateProfile,
    preferences,
    updatePreferences,
  } = useProfile()

  const [profileForm, setProfileForm] = useState({ ...profile })
  const [preferenceForm, setPreferenceForm] = useState({
    ...preferences,
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setProfileForm({ ...profile })
  }, [profile])

  useEffect(() => {
    setPreferenceForm({ ...preferences })
  }, [preferences])

  function updateProfileField(event) {
    const { name, value } = event.target
    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }))
    setSaved(false)
  }

  function updatePreferenceField(event) {
    const { name, value, checked, type } = event.target

    setPreferenceForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setSaved(false)
  }

  function handleSave(event) {
    event.preventDefault()

    updateProfile(profileForm)
    updatePreferences(preferenceForm)
    setSaved(true)
  }

  function TextField({
    label,
    name,
    icon: Icon,
    value,
    type = 'text',
    placeholder,
  }) {
    return (
      <label className="block text-sm font-medium text-slate-700">
        {label}

        <div className="relative mt-1.5">
          {Icon && (
            <Icon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          )}

          <input
            type={type}
            name={name}
            value={value ?? ''}
            onChange={updateProfileField}
            placeholder={placeholder}
            required={name === 'fullName' || name === 'email'}
            maxLength={name === 'email' ? 254 : 120}
            className={`min-h-11 w-full rounded-xl border border-slate-200 py-2.5 pr-3 font-normal outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 ${
              Icon ? 'pl-9' : 'pl-3'
            }`}
          />
        </div>
      </label>
    )
  }

  function Toggle({ name, title, description }) {
    return (
      <label className="flex cursor-pointer items-start justify-between gap-4 py-4">
        <span>
          <span className="block text-sm font-medium text-slate-800">
            {title}
          </span>
          <span className="mt-1 block text-[13px] leading-5 text-slate-500">
            {description}
          </span>
        </span>

        <input
          type="checkbox"
          name={name}
          checked={Boolean(preferenceForm[name])}
          onChange={updatePreferenceField}
          className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
        />
      </label>
    )
  }

  return (
    <section className="mx-auto w-full max-w-[1000px] space-y-6 pb-8">
      <header>
        <div className="mb-2 flex items-center gap-2 text-[12px] font-medium text-slate-400">
          <span>Workspace</span>
          <span>/</span>
          <span className="text-blue-600">Account Settings</span>
        </div>

        <h1 className="text-[26px] sm:text-[28px] font-semibold tracking-tight text-slate-900">
          Account Settings
        </h1>

        <p className="mt-1.5 text-sm leading-6 text-slate-500">
          Manage your profile, business details, notifications, and preferences.
        </p>
      </header>

      <form onSubmit={handleSave} className="space-y-5">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserRound size={20} />
            </span>

            <div>
              <h2 className="text-[16px] font-semibold text-slate-900">
                Personal information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Update the information shown in your ProofPay profile.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <TextField
              label="Full name"
              name="fullName"
              icon={UserRound}
              value={profileForm.fullName}
              placeholder="Enter your full name"
            />

            <TextField
              label="Email address"
              name="email"
              icon={Mail}
              type="email"
              value={profileForm.email}
              placeholder="you@example.com"
            />

            <TextField
              label="Phone number"
              name="phone"
              icon={Phone}
              value={profileForm.phone}
              placeholder="Enter your phone number"
            />

            <TextField
              label="City"
              name="city"
              icon={MapPin}
              value={profileForm.city}
              placeholder="Enter your city"
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Building2 size={20} />
            </span>

            <div>
              <h2 className="text-[16px] font-semibold text-slate-900">
                Business information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Add basic details about your business.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <TextField
              label="Business name"
              name="businessName"
              icon={Building2}
              value={profileForm.businessName}
              placeholder="e.g. Sharma Traders"
            />

            <label className="block text-sm font-medium text-slate-700">
              Business type

              <select
                name="businessType"
                value={profileForm.businessType || 'Wholesale / Distribution'}
                onChange={updateProfileField}
                className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                <option>Wholesale / Distribution</option>
                <option>Retail Store</option>
                <option>Manufacturer</option>
                <option>Service Business</option>
                <option>Other</option>
              </select>
            </label>
          </div>
        </section>

        

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={20} />
            </span>

            <div>
              <h2 className="text-[16px] font-semibold text-slate-900">Security</h2>
              <p className="mt-1 text-sm text-slate-500">
                Preview your account security preferences.
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <LockKeyhole size={19} className="mt-0.5 text-slate-400" />

              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">
                  Two-factor authentication
                </p>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  This is a demo preference only. Real security requires a backend.
                </p>
              </div>

              <input
                type="checkbox"
                name="twoFactor"
                checked={Boolean(preferenceForm.twoFactor)}
                onChange={updatePreferenceField}
                aria-label="Two-factor authentication demo preference"
                className="mt-1 h-4 w-4 accent-blue-600"
              />
            </div>

            <label className="mt-5 block text-sm font-medium text-slate-700">
              Language

              <span className="relative mt-1.5 block">
                <Globe
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  name="language"
                  value={preferenceForm.language}
                  onChange={updatePreferenceField}
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </span>
            </label>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Time zone

              <select
                name="timezone"
                value={preferenceForm.timezone}
                onChange={updatePreferenceField}
                className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                <option value="Asia/Kolkata">India Standard Time (IST)</option>
                <option value="UTC">UTC</option>
              </select>
            </label>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] leading-5 text-slate-400">
            Changes are saved in this browser only. Backend synchronization is not connected yet.
          </p>

          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            {saved ? <CheckCircle2 size={17} /> : <Save size={17} />}
            {saved ? 'Changes saved' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  )
}
