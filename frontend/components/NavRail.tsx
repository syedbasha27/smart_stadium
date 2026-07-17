"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  MessageCircleMore,
  Compass,
  Activity,
  Accessibility,
  Leaf,
  ShieldAlert,
} from "lucide-react";

const ITEMS = [
  { href: "/", label: "Overview", icon: LayoutGrid },
  { href: "/assistant", label: "Fan Assistant", icon: MessageCircleMore },
  { href: "/navigation", label: "Wayfinding", icon: Compass },
  { href: "/crowd", label: "Crowd Control", icon: Activity },
  { href: "/accessibility", label: "Accessibility", icon: Accessibility },
  { href: "/sustainability", label: "Sustainability", icon: Leaf },
  { href: "/operations", label: "Operations", icon: ShieldAlert },
];

export default function NavRail() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-around border-t border-line bg-surface/95 backdrop-blur
                 md:top-0 md:h-full md:w-20 md:flex-col md:justify-start md:gap-1 md:border-r md:border-t-0 md:py-6"
    >
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            aria-label={label}
            className={`focus-ring group relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-medium tracking-wide transition-colors
              md:my-0.5 md:w-16
              ${active ? "text-pitch" : "text-ink/63 hover:text-ink/80"}`}
          >
            {active && (
              <span aria-hidden="true" className="absolute inset-0 -z-10 rounded-xl bg-pitch-soft md:inset-x-1" />
            )}
            <Icon size={20} strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
            <span className="sr-only md:not-sr-only md:block">{label.split(" ")[0]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
