import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Card, PageHeader, StatCard, Badge, Button, TextInput, Select } from "@/components/ui";
import NavRail from "@/components/NavRail";

expect.extend(toHaveNoViolations);

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("Accessibility (jest-axe)", () => {
  it("PageHeader has no detectable a11y violations", async () => {
    const { container } = render(
      <PageHeader eyebrow="Fan Experience" title="Smart Wayfinding" description="Turn-by-turn directions." />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("A form built from the shared UI kit has no detectable a11y violations", async () => {
    const Noop = () => {};
    const { container } = render(
      <Card>
        <TextInput label="Current location" value="Gate C" onChange={Noop as any} />
        <Select label="Destination" value="Seat Z1-114" onChange={Noop as any} options={["Seat Z1-114", "Gate A"]} />
        <Button onClick={Noop as any}>Get directions</Button>
      </Card>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("Stat cards and badges have no detectable a11y violations", async () => {
    const { container } = render(
      <div>
        <StatCard label="Stadium occupancy" value="72%" tone="pitch" />
        <Badge tone="critical">critical</Badge>
        <Badge tone="low">low</Badge>
      </div>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("NavRail has no detectable a11y violations and every link has an accessible name", async () => {
    const { container } = render(<NavRail />);
    expect(await axe(container)).toHaveNoViolations();

    // Regression test: icon-only nav items on mobile must keep an accessible
    // name (previously lost because the label span used display:none).
    expect(screen.getByRole("link", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Crowd Control" })).toBeInTheDocument();
  });
});
