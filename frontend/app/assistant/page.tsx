"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, Languages } from "lucide-react";
import { PageHeader, Card, Button, Select } from "@/components/ui";
import api from "@/lib/api";

const LANGUAGES = ["English", "Spanish", "French", "Portuguese", "Arabic", "Hindi", "Mandarin", "German"];

type Turn = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Where's the nearest accessible restroom?",
  "How do I get to Gate C from the metro station?",
  "Is it busy near the North Stand right now?",
  "What time do gates open before kickoff?",
];

export default function AssistantPage() {
  const [language, setLanguage] = useState("English");
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: "assistant",
      content: "Hi! I'm Amiga, your match-day assistant. Ask me anything about gates, seats, transport, or accessibility — in any language.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = async (message: string) => {
    if (!message.trim() || loading) return;
    const nextTurns: Turn[] = [...turns, { role: "user", content: message }];
    setTurns(nextTurns);
    setInput("");
    setLoading(true);
    try {
      const res = await api.chat(message, language, nextTurns.map(t => ({ role: t.role, content: t.content })));
      setTurns((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch {
      setTurns((prev) => [...prev, { role: "assistant", content: "I couldn't reach the assistant service. Please make sure the backend is running." }]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Fan Experience"
        title="Multilingual Fan Assistant"
        description="A Gemini-powered concierge that understands stadium context — gates, seating, transport, accessibility — and replies fluently in the fan's own language."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <Card className="flex h-[560px] flex-col p-0">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <div className="flex items-center gap-2 text-[13px] font-medium text-ink/65">
              <Languages size={16} /> Reply language
            </div>
            <div className="w-44">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="focus-ring w-full rounded-lg border border-line bg-paper px-2.5 py-1.5 text-[13px] outline-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-5 py-4" role="log" aria-live="polite" aria-label="Conversation">
            {turns.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
                    t.role === "user" ? "bg-ink text-white" : "bg-paper text-ink border border-line"
                  }`}
                >
                  {t.content}
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl border border-line bg-paper px-4 py-3">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="h-1.5 w-1.5 rounded-full bg-ink/40"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-line px-4 py-3"
          >
            <label htmlFor="chat-input" className="sr-only">
              Message to the fan assistant
            </label>
            <input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about gates, seats, transport, accessibility…"
              className="focus-ring flex-1 rounded-lg border border-line bg-paper px-3.5 py-2.5 text-[14px] outline-none placeholder:text-ink/55"
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              <Send size={16} aria-hidden="true" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </Card>

        <div className="flex flex-col gap-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-ink/62">Try asking</p>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="focus-ring rounded-lg border border-line bg-surface px-3.5 py-3 text-left text-[13px] text-ink/70 shadow-card transition-colors hover:border-pitch/40 hover:text-ink"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
