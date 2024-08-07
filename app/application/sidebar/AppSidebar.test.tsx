import { vi, describe, it, expect } from "vitest";
import { AppSidebar } from "./AppSidebar";
import { SideBarItem } from "./SidebarItem";
import { EntitySimple } from "~/utils/db/entities/entities.db.server";

describe("AppSidebar", () => {
  it("returns the expected sidebar items", () => {
    const t = vi.fn().mockImplementation((v: string) => v) as any;
    const entities = [
      { name: "entity1", slug: "entity1", titlePlural: "Entity 1", showInSidebar: true, icon: "" },
      { name: "entity2", slug: "entity2", titlePlural: "Entity 2", showInSidebar: false, icon: "" },
      { name: "entity3", slug: "entity3", titlePlural: "Entity 3", showInSidebar: true, icon: "" },
    ] as EntitySimple[];

    const result = AppSidebar({ t, tenantId: "test-user", entities, entityGroups: [], appConfiguration: null });
    const expected: SideBarItem[] = [
      {
        title: "",
        path: "",
        items: [
          {
            title: "app.sidebar.dashboard",
            path: "/app/test-user/dashboard",
            icon: 11,
          },
          {
            title: "Entity 1",
            path: "/app/test-user/entity1",
            // permission: "entity.entity1.view" as DefaultPermission,
            entityIcon: "",
          },
          {
            title: "Entity 3",
            path: "/app/test-user/entity3",
            // permission: "entity.entity3.view" as DefaultPermission,
            entityIcon: "",
          },
        ],
      },
      {
        title: "",
        path: "",
        items: [
          {
            title: "app.sidebar.settings",
            icon: 12,
            path: "/app/test-user/settings",
            redirectTo: "/app/test-user/settings/profile",
          },
          {
            title: "admin.switchToAdmin",
            path: "/admin/dashboard",
            icon: 0,
            adminOnly: true,
          },
        ],
      },
    ];

    expect(result).toEqual(expected);
  });
});
