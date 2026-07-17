"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircleMore, Compass, Activity, Accessibility, Leaf, ShieldAlert, ArrowUpRight } from "lucide-react";
import { PageHeader, StatCard, Card } from "@/components/ui";
import api, { CrowdStatusResponse } from "@/lib/api";

const MODULES = [
  {
    href: "/assistant",
    icon: MessageCircleMore,
    title: "Multilingual Fan Assistant",
    description: "Gemini-powered chat that answers fan questions in their own language, instantly.",
  },
  {
    href: "/navigation",
    icon: Compass,
    title: "Smart Wayfinding",
    description: "Turn-by-turn indoor directions between gates, seats, and amenities.",
  },
  {
    href: "/crowd",
    icon: Activity,
    title: "Crowd Control Room",
    description: "Live zone occupancy with AI-generated redistribution recommendations.",
  },
  {
    href: "/accessibility",
    icon: Accessibility,
    title: "Accessibility Concierge",
    description: "Personalised guidance to the nearest accessible facilities and routes.",
  },
  {
    href: "/sustainability",
    icon: Leaf,
    title: "Sustainable Travel Planner",
    description: "Compares transport options and estimates CO2 saved per trip.",
  },
  {
    href: "/operations",
    icon: ShieldAlert,
    title: "Operations Intelligence",
    description: "AI triage for steward incident reports — category, severity, next action.",
  },
];

export default function OverviewPage() {
  const [status, setStatus] = useState<CrowdStatusResponse | null>(null);
  const [opsStats, setOpsStats] = useState<any>(null);

  useEffect(() => {
    api.getCrowdStatus().then(setStatus).catch(() => {});
    api.getOpsDashboard().then(setOpsStats).catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Command Center"
        title="One platform for every match-day decision."
        description="StadiumIQ layers Generative AI over live stadium data so fans get instant, multilingual help and control-room staff get real-time recommendations — built for FIFA World Cup 2026 host venues."
      />

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Stadium occupancy"
          value={status ? `${status.totals.total_pct}%` : "—"}
          tone="pitch"
        />
        <StatCard
          label="Fans inside"
          value={status ? status.totals.total_occupancy.toLocaleString() : "—"}
        />
        <StatCard
          label="Zones at high density"
          value={status ? status.totals.zones_at_high_or_above : "—"}
          tone={status && status.totals.zones_at_high_or_above > 0 ? "alert" : "default"}
        />
        <StatCard
          label="Staff & volunteers on duty"
          value={opsStats ? (opsStats.staff_on_duty + opsStats.volunteers_on_duty).toLocaleString() : "—"}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m, i) => (
          <motion.div
            key={m.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05, ease: "easeOut" }}
          >
            <Link href={m.href} className="focus-ring block h-full">
              <Card className="group flex h-full flex-col justify-between transition-shadow hover:shadow-lg">
                <div>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-pitch-soft text-pitch-deep">
                    <m.icon size={19} strokeWidth={1.9} />
                  </div>
                  <h3 className="mb-1.5 font-display text-[16px] font-semibold text-ink">{m.title}</h3>
                  <p className="text-[13.5px] leading-relaxed text-ink/68">{m.description}</p>
                </div>
                <div className="mt-5 flex items-center gap-1 text-[13px] font-semibold text-pitch">
                  Open
                  <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
