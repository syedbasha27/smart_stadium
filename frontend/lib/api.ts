const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request to ${path} failed (${res.status}): ${text}`);
  }
  return res.json();
}

export type ZoneStatus = {
  id: string;
  name: string;
  capacity: number;
  occupancy: number;
  occupancy_pct: number;
  level: "low" | "moderate" | "high" | "critical";
  gates: string[];
};

export type CrowdStatusResponse = {
  zones: ZoneStatus[];
  totals: {
    total_capacity: number;
    total_occupancy: number;
    total_pct: number;
    zones_at_high_or_above: number;
  };
};

export const api = {
  getCrowdStatus: () => request<CrowdStatusResponse>("/api/crowd/status"),
  getCrowdInsight: (focus_zone?: string) =>
    request<{ insight: string; busiest_zone: string; quietest_zone: string }>(
      "/api/crowd/insight",
      { method: "POST", body: JSON.stringify({ focus_zone: focus_zone || null }) }
    ),
  chat: (message: string, language: string, history: { role: string; content: string }[]) =>
    request<{ reply: string; detected_intent: string; language: string }>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message, language, history }),
    }),
  getRoute: (current_location: string, destination: string, accessibility_needed: boolean, language: string) =>
    request<{ route_summary: string; steps: string[]; estimated_walk_minutes: number }>(
      "/api/navigation",
      { method: "POST", body: JSON.stringify({ current_location, destination, accessibility_needed, language }) }
    ),
  getZones: () => request<{ zones: any[]; gates: any[] }>("/api/navigation/zones"),
  accessibilityAssist: (need: string, current_location: string, language: string) =>
    request<{ reply: string; suggested_amenities: any[] }>("/api/accessibility/assist", {
      method: "POST",
      body: JSON.stringify({ need, current_location, language }),
    }),
  sustainabilityPlan: (origin: string, distance_km: number, group_size: number) =>
    request<{ recommendation: string; ranked_options: any[] }>("/api/sustainability/plan", {
      method: "POST",
      body: JSON.stringify({ origin, distance_km, group_size }),
    }),
  logIncident: (zone: string, report_text: string) =>
    request<any>("/api/operations/incident", {
      method: "POST",
      body: JSON.stringify({ zone, report_text }),
    }),
  getIncidents: () => request<{ incidents: any[] }>("/api/operations/incidents"),
  getOpsDashboard: () => request<any>("/api/operations/dashboard"),
};

export default api;
