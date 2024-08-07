import { Link } from "@remix-run/react";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import TableSimple from "~/components/ui/tables/TableSimple";

type CrudExample = {
  title: string;
  files: {
    type: "Route" | "Service" | "DTO" | "Component";
    name: string;
    path: string;
    description: string;
    href?: string;
  }[];
};
const examples: CrudExample[] = [
  {
    title: "Fake Projects",
    files: [
      {
        type: "Route",
        name: "List",
        path: "app/routes/admin/playground/crud.projects/index.tsx",
        description: "All projects + Search + Pagination + Overview panel",
        href: "/admin/playground/crud/projects",
      },
      {
        type: "Route",
        name: "Overview",
        path: "app/routes/admin/playground/crud.projects/index.tsx",
        description: "Project overview + Update",
        href: "/admin/playground/crud/projects?id=1",
      },
      {
        type: "Route",
        name: "Create",
        path: "app/routes/admin/playground/crud.projects/create.tsx",
        description: "Create new project",
        href: "/admin/playground/crud/projects/create",
      },
      {
        type: "Route",
        name: "Edit",
        path: "app/routes/admin/playground/crud.projects/$id.tsx",
        href: "/admin/playground/crud/projects/1",
        description: "Edit project",
      },
      {
        type: "Component",
        name: "FakeProjectForm",
        path: "app/modules/fake/fakeProjectsCrud/components/FakeProjectForm.tsx",
        description: "Create or Edit project and Tasks + Complete tasks",
      },
      {
        type: "Component",
        name: "FakeProjectOverview",
        path: "app/modules/fake/fakeProjectsCrud/components/FakeProjectOverview.tsx",
        description: "Overview of project + Complete tasks",
      },
      {
        type: "Component",
        name: "FakeTasksList",
        path: "app/modules/fake/fakeProjectsCrud/components/FakeTasksList.tsx",
        description: "List of project tasks",
      },
      { type: "DTO", name: "FakeProjectDto", path: "app/modules/fake/fakeProjectsCrud/dtos/FakeProjectDto.ts", description: "Project DTO" },
      { type: "DTO", name: "FakeTaskDto", path: "app/modules/fake/fakeProjectsCrud/dtos/FakeTaskDto.ts", description: "Task DTO" },
      {
        type: "Service",
        name: "FakeCrudService",
        path: "app/modules/fake/fakeProjectsCrud/services/FakeCrudService.ts",
        description: "Service to manage projects",
      },
    ],
  },
  {
    title: "Contracts Entity",
    files: [
      {
        type: "Route",
        name: "List",
        path: "app/routes/admin/playground/crud.contracts/index.tsx",
        description: "All contracts + Search + Pagination + Overview panel",
      },
    ],
  },
];

export default function () {
  return (
    <IndexPageLayout title="CRUD examples">
      <WarningBanner title="Warning" text="Data is not saved in the database, created, updated or deleted data is not persisted. This is just for UI and UX." />
      {examples.map((example, idx) => {
        return (
          <div key={idx} className="space-y-2">
            <h2 className="font-medium text-gray-800">{example.title}</h2>
            <TableSimple
              items={example.files}
              headers={[
                {
                  name: "type",
                  title: "Type",
                  value: (item) => item.type,
                },
                {
                  name: "name",
                  title: "Name",
                  value: (item) => (
                    <div>
                      {item.href ? (
                        <Link className="font-medium underline" to={item.href}>
                          {item.name}
                        </Link>
                      ) : (
                        item.name
                      )}
                    </div>
                  ),
                },
                {
                  name: "description",
                  title: "Description",
                  value: (item) => item.description,
                },
                {
                  name: "path",
                  title: "Path",
                  value: (item) => (
                    <div className="prose">
                      <code className="select-all">{item.path}</code>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        );
      })}
    </IndexPageLayout>
  );
}
