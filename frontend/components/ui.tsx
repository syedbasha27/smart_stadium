"use client";

import { motion } from "framer-motion";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl2 border border-line bg-surface p-6 shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mb-8"
    >
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-pitch">{eyebrow}</p>
      <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink md:text-[32px]">
        {title}
      </h1>
      {description && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink/65">{description}</p>}
    </motion.div>
  );
}

export function StatCard({
  label,
  value,
  suffix,
  tone = "default",
}: {
  label: string;
  value: string | number;
  suffix?: string;
  tone?: "default" | "pitch" | "gold" | "alert";
}) {
  const toneClass = {
    default: "text-ink",
    pitch: "text-pitch",
    gold: "text-gold",
    alert: "text-alert-critical",
  }[tone];

  return (
    <Card className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium uppercase tracking-wide text-ink/63">{label}</span>
      <span className={`font-display text-[26px] font-semibold ${toneClass}`}>
        {value}
        {suffix && <span className="ml-1 text-[14px] font-medium text-ink/62">{suffix}</span>}
      </span>
    </Card>
  );
}

export function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "low" | "moderate" | "high" | "critical" }) {
  const toneClass = {
    default: "bg-line text-ink/65",
    low: "bg-pitch-soft text-pitch-deep",
    moderate: "bg-[#E7F0F8] text-[#2C5D82]",
    high: "bg-[#FBEFDF] text-[#9A611F]",
    critical: "bg-[#FBE7E2] text-[#9A3520]",
  }[tone];

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${toneClass}`}>
      {children}
    </span>
  );
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
  disabled?: boolean;
  className?: string;
}) {
  const base =
    "focus-ring inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-ink text-white hover:bg-pitch-deep",
    secondary: "bg-paper text-ink border border-line hover:border-ink/30",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  as = "input",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  as?: "input" | "textarea";
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink/70">{label}</span>
      {as === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="focus-ring w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-[14px] outline-none placeholder:text-ink/55"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="focus-ring w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-[14px] outline-none placeholder:text-ink/55"
        />
      )}
    </label>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink/70">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-[14px] outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
