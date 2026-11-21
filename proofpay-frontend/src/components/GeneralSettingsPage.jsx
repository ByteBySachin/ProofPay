import { useState } from 'react'
import { Settings2, Globe2, Clock3, CalendarDays, Palette, Save, CheckCircle2 } from 'lucide-react'

const defaults = { language: 'English', timezone: 'Asia/Kolkata', dateFormat: 'DD MMM YYYY', appearance: 'Light' }

export default function GeneralSettingsPage() {
  const [form, setForm] = useState(() => {
    try { return { ...defaults, ...JSON.parse(localStorage.getItem('proofpay-general-settings') || '{}') } }
    catch { return defaults }
  })
  const [saved, setSaved] = useState(false)
  function update(event) { setForm(current => ({ ...current, [event.target.name]: event.target.value })); setSaved(false) }
  function submit(event) { event.preventDefault(); localStorage.setItem('proofpay-general-settings', JSON.stringify(form)); setSaved(true) }
  const selectClass = 'mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50'
  const fields = [
    { name: 'language', label: 'Language', icon: Globe2, options: [['English','English'],['Hindi','Hindi']] },
    { name: 'timezone', label: 'Time zone', icon: Clock3, options: [['Asia/Kolkata','India Standard Time (IST)'],['UTC','Coordinated Universal Time (UTC)']] },
    { name: 'dateFormat', label: 'Date format', icon: CalendarDays, options: [['DD MMM YYYY','20 Oct 2026'],['DD/MM/YYYY','20/10/2026'],['MM/DD/YYYY','10/20/2026']] },
    { name: 'appearance', label: 'Appearance', icon: Palette, options: [['Light','Light'],['Dark','Dark'],['System','Use system preference']] },
  ]
  return (
    <section className="mx-auto w-full max-w-[1000px] space-y-6 pb-8">
      <header><p className="mb-2 text-[12px] font-medium text-slate-400">Workspace / Settings / General Settings</p><h1 className="text-[26px] sm:text-[28px] font-semibold tracking-tight text-slate-900">General Settings</h1><p className="mt-1.5 text-sm leading-6 text-slate-500">Set your preferred language, time zone, date format, and display appearance.</p></header>
      <form onSubmit={submit} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:px-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><Settings2 size={20} /></span><div><h2 className="text-[16px] font-semibold text-slate-900">Workspace preferences</h2><p className="mt-1 text-sm text-slate-500">These options are separate from your profile and notifications.</p></div></div>
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          {fields.map(({ name, label, icon: Icon, options }) => <label key={name} className="text-sm font-medium text-slate-700"><span className="flex items-center gap-2"><Icon size={16} className="text-slate-400" />{label}</span><select className={selectClass} name={name} value={form[name]} onChange={update}>{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>)}
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><p className="text-[12px] text-slate-400">Preferences are saved locally in this browser demo.</p><button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700" type="submit">{saved ? <CheckCircle2 size={17} /> : <Save size={17} />}{saved ? 'General settings saved' : 'Save general settings'}</button></div>
      </form>
    </section>
  )
}
