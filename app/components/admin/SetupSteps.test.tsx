import { vi, describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import SetupSteps from "./SetupSteps";

vi.mock("react-i18next", () => ({
  useTranslation: () => {
    return { t: (str: string) => str };
  },
}));

describe("SetupSteps component", () => {
  const mockItems = [
    { title: "Step 1", description: "Description 1", path: "/step1", completed: true },
    { title: "Step 2", description: "Description 2", path: "/step2", completed: false },
    { title: "Step 3", description: "Description 3", path: "/step3", completed: false },
  ];

  it("renders a list of setup steps with correct details", () => {
    const { getAllByRole, getByText } = render(
      <Router>
        <SetupSteps items={mockItems} />
      </Router>
    );

    const stepItems = getAllByRole("listitem");

    expect(stepItems).toHaveLength(mockItems.length);

    stepItems.forEach((stepItem, index) => {
      const item = mockItems[index];
      const title = getByText(item.title);
      const description = getByText(item.description);
      expect(title).toBeInTheDocument();
      expect(description).toBeInTheDocument();
    });
  });
});
