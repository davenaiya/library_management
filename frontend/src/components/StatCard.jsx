const iconMap = {
  dark: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M6 16V8m6 8V5m6 11v-6" />
    </svg>
  ),
  light: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M7 4v16m10-8H7" />
    </svg>
  ),
  brand: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12.5 10 17l9-10M7 7.5h10M7 12h4"
      />
    </svg>
  ),
  amber: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6l4 2m4-2a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
      />
    </svg>
  )
};

function StatCard({ label, value, tone = "dark" }) {
  const icon = iconMap[tone] || iconMap.light;

  return (
    <div className="card-surface p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#5C3A21]/55">{label}</p>
          <p className="mt-4 text-5xl font-extrabold tracking-tight text-[#6B4527]">{value}</p>
        </div>
        <div className="rounded-lg bg-[#F5EDE6] p-2 text-[#8B5E3C]">{icon}</div>
      </div>
    </div>
  );
}

export default StatCard;
