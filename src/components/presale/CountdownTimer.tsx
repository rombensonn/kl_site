import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate: Date;
  label?: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function CountdownTimer({ targetDate, label = "До окончания пресейла" }: CountdownTimerProps) {
  const calc = () => {
    const diff = Math.max(0, targetDate.getTime() - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const units = [
    { value: pad(time.days), label: "дней" },
    { value: pad(time.hours), label: "часов" },
    { value: pad(time.minutes), label: "минут" },
    { value: pad(time.seconds), label: "секунд" },
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      {label && (
        <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--dfl-text-subtle)" }}>
          {label}
        </p>
      )}
      <div className="flex items-center gap-2">
        {units.map((u, i) => (
          <div key={u.label} className="flex items-center gap-2">
            <div
              className="rounded-xl px-3 py-2 min-w-[52px] text-center"
              style={{
                background: "var(--dfl-surface-2)",
                border: "1px solid var(--dfl-border-1)",
              }}
            >
              <span
                className="font-display font-bold text-xl block"
                style={{ color: "var(--dfl-text-hi)" }}
              >
                {u.value}
              </span>
              <span
                className="block text-[10px] uppercase tracking-widest mt-0.5"
                style={{ color: "var(--dfl-text-subtle)" }}
              >
                {u.label}
              </span>
            </div>
            {i < units.length - 1 && (
              <span className="font-bold text-lg" style={{ color: "var(--dfl-text-placeholder)" }}>:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
