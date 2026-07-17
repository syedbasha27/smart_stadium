"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import api, { ZoneStatus } from "@/lib/api";

const LEVEL_COLOR: Record<string, string> = {
  low: "#0E7C66",
  moderate: "#3E7CB1",
  high: "#C9862F",
  critical: "#C4432B",
};

export default function StadiumPulse({ compact = false }: { compact?: boolean }) {
  const [zones, setZones] = useState<ZoneStatus[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      try {
        const data = await api.getCrowdStatus();
        if (mounted) {
          setZones(data.zones);
          setError(false);
        }
      } catch {
        if (mounted) setError(true);
      }
    };
    fetchStatus();
    const id = setInterval(fetchStatus, 8000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  if (error) {
    return (
      <div className="text-xs font-mono text-ink/62">
        Live pulse offline — start the backend to see zone data.
      </div>
    );
  }

  if (zones.length === 0) {
    return <div className="h-2 w-40 animate-pulse rounded-full bg-line" />;
  }

  return (
    <Link
      href="/crowd"
      className="focus-ring group flex items-center gap-3 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-paper"
      aria-label="View live crowd status"
    >
      <div className={`flex items-center gap-[3px] ${compact ? "w-24" : "w-40 md:w-56"}`}>
        {zones.map((z) => (
          <div key={z.id} className="h-2 flex-1 overflow-hidden rounded-full bg-line" title={`${z.name}: ${z.occupancy_pct}%`}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: LEVEL_COLOR[z.level] }}
              initial={{ width: 0 }}
              animate={{ width: `${z.occupancy_pct}%` }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
          </div>
        ))}
      </div>
      {!compact && (
        <span className="hidden font-mono text-[11px] text-ink/65 md:inline">
          Stadium Pulse · live
        </span>
      )}
    </Link>
  );
}
