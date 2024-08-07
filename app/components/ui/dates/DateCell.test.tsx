import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import DateCell from "./DateCell";

const dateAsString = "2023-04-14 16:40:45";

describe("DateCell", () => {
  it("renders date with default displays", () => {
    const date = new Date(dateAsString);
    const { container } = render(<DateCell date={date} />);
    expect(container.querySelector("div")).not.toBeNull();
    expect(container.querySelector("div")?.getAttribute("title")).toBe(dateAsString);
    expect(container.textContent).toContain("ago");
  });

  it("renders date with specific displays", () => {
    const date = new Date(dateAsString);
    const { container } = render(<DateCell date={date} displays={["dm", "ago"]} />);
    expect(container.querySelector("div")).not.toBeNull();
    expect(container.querySelector("div")?.getAttribute("title")).toBe(dateAsString);
    expect(container.textContent).toContain("ago");
    expect(container.textContent).not.toContain("ymd");
  });

  it("renders empty when date is null", () => {
    const { container } = render(<DateCell date={null} />);
    expect(container.querySelector("div")).toBeNull();
  });
});
