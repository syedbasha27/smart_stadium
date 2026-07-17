import api from "@/lib/api";

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  }) as jest.Mock;
}

describe("api client", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("fetches crowd status from the correct endpoint", async () => {
    const mockResponse = {
      zones: [{ id: "Z1", name: "North Stand", capacity: 100, occupancy: 50, occupancy_pct: 50, level: "moderate", gates: ["A"] }],
      totals: { total_capacity: 100, total_occupancy: 50, total_pct: 50, zones_at_high_or_above: 0 },
    };
    mockFetchOnce(mockResponse);

    const result = await api.getCrowdStatus();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/crowd/status"),
      expect.objectContaining({ cache: "no-store" })
    );
    expect(result).toEqual(mockResponse);
  });

  it("sends chat messages as a POST with JSON body", async () => {
    mockFetchOnce({ reply: "Hello!", detected_intent: "general_query", language: "English" });

    await api.chat("Hi there", "English", []);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/chat"),
      expect.objectContaining({ method: "POST" })
    );
    const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
    const parsedBody = JSON.parse(callArgs.body);
    expect(parsedBody).toEqual({ message: "Hi there", language: "English", history: [] });
  });

  it("throws a descriptive error when the response is not ok", async () => {
    mockFetchOnce({ detail: "Something broke" }, false, 500);

    await expect(api.getCrowdStatus()).rejects.toThrow(/failed \(500\)/);
  });

  it("builds the sustainability plan request with numeric fields", async () => {
    mockFetchOnce({ recommendation: "Take the metro", ranked_options: [] });

    await api.sustainabilityPlan("Downtown", 12.5, 3);

    const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
    const parsedBody = JSON.parse(callArgs.body);
    expect(parsedBody).toEqual({ origin: "Downtown", distance_km: 12.5, group_size: 3 });
  });
});
