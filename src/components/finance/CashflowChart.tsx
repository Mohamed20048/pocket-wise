const data = [
  { m: "May", income: 2100, expense: 1450 },
  { m: "Jun", income: 1800, expense: 1620 },
  { m: "Jul", income: 2300, expense: 1380 },
  { m: "Aug", income: 1950, expense: 1720 },
  { m: "Sep", income: 2600, expense: 1480 },
  { m: "Oct", income: 2500, expense: 1652 },
];

export function CashflowChart() {
  const max = Math.max(...data.flatMap(d => [d.income, d.expense]));
  return (
    <div>
      <div className="flex items-end justify-between gap-3 h-44">
        {data.map((d) => (
          <div key={d.m} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-end justify-center gap-1 h-full">
              <div
                className="w-3 rounded-t-sm bg-success/80 transition-all hover:bg-success"
                style={{ height: `${(d.income / max) * 100}%` }}
                title={`Income $${d.income}`}
              />
              <div
                className="w-3 rounded-t-sm bg-warning/80 transition-all hover:bg-warning"
                style={{ height: `${(d.expense / max) * 100}%` }}
                title={`Expenses $${d.expense}`}
              />
            </div>
            <span className="text-[11px] text-muted-foreground tracking-wide">{d.m}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center gap-5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-success" /> Income
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-warning" /> Expenses
        </div>
      </div>
    </div>
  );
}
