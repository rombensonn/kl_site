import { Users } from "lucide-react";
import { motion } from "framer-motion";

interface SeatCounterProps {
  seatsLeft: number;
  total?: number;
}

export default function SeatCounter({ seatsLeft, total = 100 }: SeatCounterProps) {
  const filledPercent = ((total - seatsLeft) / total) * 100;

  return (
    <div
      className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl"
      style={{
        background: "var(--dfl-surface-2)",
        border: "1px solid var(--dfl-border-2)",
      }}
    >
      <Users size={14} style={{ color: "var(--dfl-accent-bright)", flexShrink: 0 }} />
      <span className="text-sm font-medium" style={{ color: "var(--dfl-text-mid)" }}>
        Осталось{" "}
        <span className="font-bold" style={{ color: "var(--dfl-accent-bright)" }}>
          {seatsLeft}
        </span>{" "}
        мест из {total}
      </span>
      <div className="seat-track">
        <motion.div
          className="seat-fill"
          initial={{ width: 0 }}
          animate={{ width: `${filledPercent}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
}
