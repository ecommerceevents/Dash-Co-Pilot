import { render, screen } from "@testing-library/react";
import AnalyticsPageViewsTable from "./AnalyticsPageViewsTable";
import { BrowserRouter as Router } from "react-router-dom";
import { AnalyticsPageView } from "@prisma/client";
import { vi, describe, expect, test } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => {
    return { t: (str: string) => str };
  },
}));

const d = "2023-03-21";

const items = [
  { id: "1", url: "/page1", route: "/page1", createdAt: d, uniqueVisitorId: "1" },
  { id: "2", url: "/page2", route: "/page2", createdAt: d, uniqueVisitorId: "1" },
] as unknown as AnalyticsPageView[];

describe("AnalyticsPageViewsTable", () => {
  test("renders table with correct headers and values", () => {
    const result = render(
      <Router>
        <AnalyticsPageViewsTable items={items} />
      </Router>
    );
    const table = result.container.getElementsByTagName("table")[0];

    // Check number of rows
    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(items.length + 1); // Include header row

    // Check number of columns
    const headerRow = table.getElementsByTagName("thead")[0];
    const headers = headerRow.getElementsByTagName("th");
    expect(headers.length).toBe(2);

    // Check header titles
    const headerTitles = [...headers].map((header) => header.textContent);
    expect(headerTitles).toContain("analytics.url");
    expect(headerTitles).toContain("analytics.viewed");

    // Check cell values
    items.forEach((item, i) => {
      const tbody = table.getElementsByTagName("tbody")[0];
      const row = tbody.getElementsByTagName("tr")[i];

      const cells = row.getElementsByTagName("td");
      expect(cells.length).toBe(2);

      expect(cells[0].textContent).toContain(item.url);
      expect(cells[0].textContent).toContain(item.route);
      expect(cells[1].textContent).toContain(item.createdAt);
    });
  });
});
