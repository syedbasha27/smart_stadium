import NavRail from "@/components/NavRail";
import StadiumPulse from "@/components/StadiumPulse";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <NavRail />
      <div className="md:pl-20">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-surface/90 px-5 backdrop-blur md:px-8">
          <div className="flex items-center gap-2.5">
            <div aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink font-display text-sm font-bold text-white">
              S
            </div>
            <div className="leading-tight">
              <p className="font-display text-[15px] font-semibold tracking-tight">StadiumIQ</p>
              <p className="hidden text-[11px] text-ink/63 sm:block">FIFA World Cup 2026 · Ops Platform</p>
            </div>
          </div>
          <StadiumPulse />
        </header>
        <main id="main-content" className="mx-auto max-w-6xl px-5 pb-24 pt-8 md:px-8 md:pb-10">{children}</main>
      </div>
    </div>
  );
}
