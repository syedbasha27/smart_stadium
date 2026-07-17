"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Users } from "lucide-react";
import { PageHeader, Card, Button, TextInput } from "@/components/ui";
import api from "@/lib/api";

export default function SustainabilityPage() {
  const [origin, setOrigin] = useState("Downtown Transit Hub");
  const [distance, setDistance] = useState("14");
  const [group, setGroup] = useState("2");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ recommendation: string; ranked_options: any[] } | null>(null);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await api.sustainabilityPlan(origin, parseFloat(distance) || 1, parseInt(group) || 1);
      setResult(res);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Sustainability"
        title="Sustainable Travel Planner"
        description="Compare match-day transport options and see the estimated CO2 impact before you travel."
      />

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <Card className="flex flex-col gap-4">
          <TextInput label="Travelling from" value={origin} onChange={setOrigin} />
          <TextInput label="Distance to stadium (km)" value={distance} onChange={setDistance} />
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-ink/70">
              <Users size={14} /> Group size
            </span>
            <input
              type="number"
              min={1}
              max={20}
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="focus-ring w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-[14px] outline-none"
            />
          </label>
          <Button onClick={submit} disabled={loading}>
            <Leaf size={16} /> {loading ? "Comparing options…" : "Compare options"}
          </Button>
        </Card>

        <Card className="min-h-[320px]">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="r" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="mb-5 rounded-lg bg-pitch-soft px-4 py-3.5">
                  <p className="text-[14px] leading-relaxed text-pitch-deep">{result.recommendation}</p>
                </div>
                <div className="space-y-2.5">
                  {result.ranked_options.map((o: any, i: number) => (
                    <motion.div
                      key={o.mode}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.06 }}
                      className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                        i === 0 ? "border-pitch/40 bg-pitch-soft/40" : "border-line bg-paper"
                      }`}
                    >
                      <div>
                        <p className="text-[13.5px] font-medium text-ink/80">
                          {o.mode} {i === 0 && <span className="ml-1.5 text-[11px] font-semibold text-pitch">GREENEST</span>}
                        </p>
                        <p className="text-[12px] text-ink/63">{o.notes}</p>
                      </div>
                      <p className="font-mono text-[13px] font-medium text-ink/70">{Math.round(o.estimated_co2_g)}g CO2</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center text-ink/62">
                <Leaf size={28} strokeWidth={1.5} className="mb-3" />
                <p className="text-[14px]">Enter your trip details to compare transport options.</p>
              </div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
