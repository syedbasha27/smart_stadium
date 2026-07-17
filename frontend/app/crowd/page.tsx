"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCcw } from "lucide-react";
import { PageHeader, Card, Badge, Button } from "@/components/ui";
import api, { ZoneStatus } from "@/lib/api";

export default function CrowdPage() {
  const [zones, setZones] = useState<ZoneStatus[]>([]);
  const [insight, setInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const load = () => api.getCrowdStatus().then((d) => setZones(d.zones)).catch(() => {});

  useEffect(() => {
    load();
    const id = setInterval(load, 6000);
    return () => clearInterval(id);
  }, []);

  const getInsight = async () => {
    setInsightLoading(true);
    try {
      const res = await api.getCrowdInsight();
      setInsight(res.insight);
    } catch {
      setInsight(null);
    } finally {
      setInsightLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Crowd Control Room"
        description="Live per-zone occupancy with one-tap AI recommendations for the duty manager."
      />

      <Card className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-soft text-gold">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="font-display text-[15px] font-semibold">AI Recommendation</p>
            <p className="text-[13px] text-ink/65">Ask Gemini to analyse live occupancy and suggest the next best action.</p>
          </div>
        </div>
        <Button onClick={getInsight} disabled={insightLoading} variant="secondary">
          <RefreshCcw size={15} className={insightLoading ? "animate-spin" : ""} /> {insightLoading ? "Analysing…" : "Generate insight"}
        </Button>
      </Card>

      {insight && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="mb-6 overflow-hidden rounded-xl2 border border-gold/30 bg-gold-soft px-5 py-4"
        >
          <p className="text-[14px] leading-relaxed text-[#5C4419]">{insight}</p>
        </motion.div>
      )}

      <div className="grid gap-3.5 sm:grid-cols-2">
        {zones.map((z) => (
          <Card key={z.id} className="p-5">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="font-display text-[15px] font-semibold">{z.name}</p>
                <p className="font-mono text-[11.5px] text-ink/62">Gates {z.gates.join(", ")}</p>
              </div>
              <Badge tone={z.level}>{z.level}</Badge>
            </div>
            <div className="mb-2 h-2.5 w-full overflow-hidden rounded-full bg-line">
              <motion.div
                className="h-full rounded-full"
                style={{
                  backgroundColor:
                    z.level === "critical" ? "#C4432B" : z.level === "high" ? "#C9862F" : z.level === "moderate" ? "#3E7CB1" : "#0E7C66",
                }}
                animate={{ width: `${z.occupancy_pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="flex items-center justify-between text-[12.5px] text-ink/65">
              <span>{z.occupancy.toLocaleString()} / {z.capacity.toLocaleString()} fans</span>
              <span className="font-mono font-medium text-ink/70">{z.occupancy_pct}%</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
