import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Badge, StatCard, Card, Button } from "@/components/ui";

describe("Badge", () => {
  it("renders its label text", () => {
    render(<Badge tone="critical">critical</Badge>);
    expect(screen.getByText("critical")).toBeInTheDocument();
  });

  it("defaults to the default tone when none is given", () => {
    render(<Badge>neutral</Badge>);
    expect(screen.getByText("neutral")).toBeInTheDocument();
  });
});

describe("StatCard", () => {
  it("renders a label and value", () => {
    render(<StatCard label="Stadium occupancy" value="72%" />);
    expect(screen.getByText("Stadium occupancy")).toBeInTheDocument();
    expect(screen.getByText("72%")).toBeInTheDocument();
  });

  it("renders an optional suffix", () => {
    render(<StatCard label="Fans inside" value={42000} suffix="fans" />);
    expect(screen.getByText("fans")).toBeInTheDocument();
  });
});

describe("Card", () => {
  it("renders children", () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    );
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });
});

describe("Button", () => {
  it("fires onClick when clicked", async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    screen.getByText("Click me").click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when the disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText("Disabled")).toBeDisabled();
  });
});
