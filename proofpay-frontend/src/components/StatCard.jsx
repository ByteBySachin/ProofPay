export default function StatCard({
  title,
  amount,
  subtitle,
  icon: Icon,
  color = 'bg-blue-50 text-blue-600',
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={21} />
        </div>
      </div>

      <h2 className="mt-4 break-words text-[26px] font-bold tracking-tight text-slate-900">
        {amount}
      </h2>

      <p className="mt-2 text-[13px] text-slate-500">{subtitle}</p>
    </article>
  )
}