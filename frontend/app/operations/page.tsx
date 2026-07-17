"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Send } from "lucide-react";
import { PageHeader, Card, Button, TextInput, Badge } from "@/components/ui";
import api from "@/lib/api";

const ZONES = ["Z1", "Z2", "Z3", "Z4", "Z5", "Z6", "Z7"];
const SEVERITY_TONE: Record<string, "low" | "moderate" | "high" | "critical"> = {
  low: "low",
  medium: "moderate",
  high: "high",
  critical: "critical",
};

export default function OperationsPage() {
  const [zone, setZone] = useState("Z2");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [incidents, setIncidents] = useState<any[]>([]);

  const load = () => api.getIncidents().then((d) => setIncidents(d.incidents)).catch(() => {});
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!report.trim()) return;
    setLoading(true);
    try {
      await api.logIncident(zone, report);
      setReport("");
      await load();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Staff & Volunteers"
        title="Operations Intelligence"
        description="File a raw radio report and let Gemini triage it — category, severity, and a concrete next step for the duty manager, logged instantly."
      />

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card className="flex flex-col gap-4">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink/70">Zone</span>
            <select value={zone} onChange={(e) => setZone(e.target.value)} className="focus-ring w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-[14px] outline-none">
              {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </label>
          <TextInput
            as="textarea"
            label="Radio / text report"
            value={report}
            onChange={setReport}
            placeholder="e.g. Long queue building at Gate G, fans getting frustrated, needs another lane opened"
          />
          <Button onClick={submit} disabled={loading || !report.trim()}>
            <Send size={16} /> {loading ? "Triaging…" : "Submit report"}
          </Button>
        </Card>

        <Card className="p-0">
          <div className="border-b border-line px-5 py-3.5">
            <p className="font-display text-[15px] font-semibold">Live incident log</p>
          </div>
          <div className="scrollbar-thin max-h-[480px] divide-y divide-line overflow-y-auto">
            {incidents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center text-ink/62">
                <ShieldAlert size={26} strokeWidth={1.5} className="mb-3" />
                <p className="text-[14px]">No incidents logged yet.</p>
              </div>
            )}
            {incidents.map((inc, i) => (
              <motion.div
                key={inc.id}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="px-5 py-4"
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-mono text-[11.5px] text-ink/62">{inc.id} · Zone {inc.zone}</span>
                  <Badge tone={SEVERITY_TONE[inc.severity] || "default"}>{inc.severity}</Badge>
                </div>
                <p className="mb-1.5 text-[14px] font-medium text-ink/85">{inc.summary}</p>
                <p className="text-[13px] text-ink/68">{inc.recommended_action}</p>
                <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wide text-ink/65">{inc.category}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
