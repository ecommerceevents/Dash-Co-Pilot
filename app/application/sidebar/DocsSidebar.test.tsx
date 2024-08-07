import { DocsSidebar } from "./DocsSidebar";
import { SideBarItem } from "./SidebarItem";

describe("DocsSidebar", () => {
  it("should return an array of SideBarItem objects", () => {
    const docsSidebar: SideBarItem[] = DocsSidebar();
    expect(Array.isArray(docsSidebar)).toBe(true);
    docsSidebar.forEach((item) => {
      expect(typeof item.title).toBe("string");
      expect(typeof item.path).toBe("string");
      if (item.items) {
        expect(Array.isArray(item.items)).toBe(true);
        item.items.forEach((subItem) => {
          expect(typeof subItem.title).toBe("string");
          expect(typeof subItem.path).toBe("string");
        });
      }
    });
  });

  it("should return a PageBlock item with tab title starting with capital letter", () => {
    const docsSidebar: SideBarItem[] = DocsSidebar();
    const pageBlockItem = docsSidebar[2];
    const pageBlockTab = pageBlockItem.items?.find((item) => item.path === "/docs/features");

    expect(pageBlockTab).toBeDefined();
    expect(pageBlockTab?.title).toMatch(/^\w/);
    expect(pageBlockTab?.title.charAt(0)).toMatch(/[A-Z]/);
  });
});
