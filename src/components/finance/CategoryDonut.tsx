interface Slice {
  label: string;
  value: number;
  color: string; // hsl var name e.g. "var(--primary)"
}

interface CategoryDonutProps {
  slices: Slice[];
  total: string;
}

export function CategoryDonut({ slices, total }: CategoryDonutProps) {
  const sum = slices.reduce((a, s) => a + s.value, 0);
  let offset = 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-8">
      <div className="relative h-44 w-44 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
          {slices.map((s, i) => {
            const length = (s.value / sum) * circumference;
            const dasharray = `${length} ${circumference - length}`;
            const dashoffset = -offset;
            offset += length;
            return (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={`hsl(${s.color})`}
                strokeWidth="12"
                strokeDasharray={dasharray}
                strokeDashoffset={dashoffset}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Spent</span>
          <span className="font-serif text-2xl font-bold tabular-nums text-foreground">{total}</span>
        </div>
      </div>
      <ul className="flex-1 space-y-2.5">
        {slices.map((s) => {
          const pct = Math.round((s.value / sum) * 100);
          return (
            <li key={s.label} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: `hsl(${s.color})` }}
                />
                <span className="text-foreground">{s.label}</span>
              </div>
              <span className="tabular-nums text-muted-foreground">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
