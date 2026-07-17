"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Accessibility as AccessibilityIcon, MapPin } from "lucide-react";
import { PageHeader, Card, Button, TextInput } from "@/components/ui";
import api from "@/lib/api";

const QUICK_NEEDS = [
  "I use a wheelchair and need step-free access",
  "I'm hard of hearing — is there an induction loop?",
  "I need a quiet sensory space, I'm overstimulated",
  "Travelling with an infant, need a baby care room",
];

export default function AccessibilityPage() {
  const [need, setNeed] = useState("");
  const [location, setLocation] = useState("Main Concourse");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ reply: string; suggested_amenities: any[] } | null>(null);

  const submit = async (n?: string) => {
    const query = n ?? need;
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api.accessibilityAssist(query, location, "English");
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
        eyebrow="Fan Experience"
        title="Accessibility Concierge"
        description="Describe what you need in your own words — the assistant finds the nearest suitable facility and clear guidance to reach it."
      />

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card className="flex flex-col gap-4">
          <TextInput label="Current location" value={location} onChange={setLocation} />
          <TextInput
            as="textarea"
            label="Describe your need"
            value={need}
            onChange={setNeed}
            placeholder="e.g. I use a mobility scooter and need the nearest accessible restroom"
          />
          <Button onClick={() => submit()} disabled={loading || !need.trim()}>
            <AccessibilityIcon size={16} /> {loading ? "Finding help…" : "Get guidance"}
          </Button>

          <div className="mt-1">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink/62">Quick examples</p>
            <div className="flex flex-col gap-2">
              {QUICK_NEEDS.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setNeed(q);
                    submit(q);
                  }}
                  className="focus-ring rounded-lg border border-line bg-paper px-3 py-2.5 text-left text-[12.5px] text-ink/65 transition-colors hover:border-pitch/40"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="min-h-[320px]">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="r" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <p className="mb-5 text-[15px] leading-relaxed text-ink/80">{result.reply}</p>
                <p className="mb-2.5 text-[12px] font-semibold uppercase tracking-wide text-ink/62">Nearby facilities</p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {result.suggested_amenities.map((a, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-lg border border-line bg-paper px-3.5 py-3">
                      <MapPin size={16} className="mt-0.5 shrink-0 text-pitch" />
                      <div>
                        <p className="text-[13.5px] font-medium text-ink/80">{a.name}</p>
                        <p className="font-mono text-[11px] text-ink/62">Zone {a.zone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center text-ink/62">
                <AccessibilityIcon size={28} strokeWidth={1.5} className="mb-3" />
                <p className="text-[14px]">Describe a need on the left to get personalised guidance.</p>
              </div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
