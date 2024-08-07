import { TFunction } from "i18next";
import EditIcon from "~/components/ui/icons/crud/EditIcon";
import LinkIcon from "~/components/ui/icons/crud/LinkIcon";
import PrototypeIcon from "~/components/ui/icons/crud/PrototypeIcon";
import TagsIcon from "~/components/ui/icons/crud/TagsIcon";
import UploadIcon from "~/components/ui/icons/crud/UploadIcon";
import DownloadIcon from "~/components/ui/icons/DownloadIcon";
import ListIcon from "~/components/ui/icons/entities/ListIcon";
import TreeStructureIcon from "~/components/ui/icons/entities/TreeStructureIcon";
import PlusIcon from "~/components/ui/icons/PlusIcon";
import ShareIcon from "~/components/ui/icons/ShareIcon";
import { EntityWithDetails } from "../db/entities/entities.db.server";
import { RowWithDetails } from "../db/entities/rows.db.server";

export type NoCodeEntityViewsDto = {
  title: string;
  description: string;
  views: {
    name: string;
    description: string;
    href?: string;
    error?: string;
    reloadDocument?: boolean;
    icon?: React.ReactNode;
    underConstruction?: boolean;
    enterprise?: boolean;
  }[];
};

function getBlockPreviews({ t, entities }: { t: TFunction; entities: EntityWithDetails[] }) {
  const cruds: NoCodeEntityViewsDto = {
    title: "CRUD",
    description: "Entities List, New, Overview, Edit, Import, Export, Tags, Share...",
    views: [],
  };
  entities.forEach((entity) => {
    cruds.views.push({
      name: t(entity.title),
      description: "List, New, Overview, Edit...",
      href: `/admin/entities/${entity.slug}/no-code`,
      // icon: <PlusIcon className="mx-auto h-4 w-4 text-gray-800" />,
    });
  });
  const previews: NoCodeEntityViewsDto[] = [
    cruds,
    {
      title: "Stats",
      description: "Stats, Charts, Reports...",
      views: [
        {
          name: "Count",
          description: "Summary of entity rows",
          href: "stats/count",
        },
      ],
    },
    {
      title: "Lists",
      description: "Miscellaneous lists",
      views: [
        {
          name: "Tasks",
          description: "All tasks",
          href: "lists/tasks",
        },
        {
          name: "My requests",
          description: "Rows that are assigned to me",
          underConstruction: true,
        },
      ],
    },
  ];

  return previews;
}

function getEntityPreviews(entity: EntityWithDetails, rows: RowWithDetails[]) {
  const publicRow = rows.find((row) => row.permissions.find((f) => f.public));
  const previews: NoCodeEntityViewsDto[] = [
    {
      title: "CRUD Routes & Blocks",
      description: "Functional & copy-pastable routes. No need to write any code.",
      views: [
        {
          name: "All-in-one",
          description: "List + CRUD",
          href: `${entity.slug}/all-in-one`,
          icon: <ListIcon className="mx-auto h-4 w-4 text-gray-800" />,
        },
        {
          name: "List (default)",
          description: "Table or Kanban + Custom Views",
          href: `${entity.slug}`,
          icon: <ListIcon className="mx-auto h-4 w-4 text-gray-800" />,
        },
        {
          name: "New",
          description: "Creates a new entity row",
          href: `${entity.slug}/new`,
          icon: <PlusIcon className="mx-auto h-4 w-4 text-gray-800" />,
        },
        {
          name: "Overview",
          description: "Details + Tasks + Comments + Tags",
          href: rows.length > 0 ? `${entity.slug}/${rows[0].id}` : undefined,
          error: rows.length === 0 ? "No rows" : undefined,
          icon: <PrototypeIcon className="mx-auto h-4 w-4 text-gray-800" />,
        },
        {
          name: "Edit",
          description: "Edits an entity row",
          href: rows.length > 0 ? `${entity.slug}/${rows[0].id}/edit` : undefined,
          error: rows.length === 0 ? "No rows" : undefined,
          icon: <EditIcon className="mx-auto h-4 w-4 text-gray-800" />,
        },
        {
          name: "Import",
          description: "Imports entity rows from a .csv",
          href: `${entity.slug}/import`,
          icon: <UploadIcon className="mx-auto h-4 w-4 text-gray-800" />,
        },
        {
          name: "Export",
          description: "Exports entity rows to .csv",
          href: `${entity.slug}/export`,
          reloadDocument: true,
          icon: <DownloadIcon className="mx-auto h-4 w-4 text-gray-800" />,
        },
        {
          name: "Tags",
          description: "Create and/or assign row tags",
          href: rows.length > 0 ? `${entity.slug}/${rows[0].id}/tags` : undefined,
          error: rows.length === 0 ? "No rows" : undefined,
          reloadDocument: true,
          icon: <TagsIcon className="mx-auto h-4 w-4 text-gray-800" />,
        },
        {
          name: "Share",
          description: "Change row visibility and permissions",
          href: rows.length > 0 ? `${entity.slug}/${rows[0].id}/share` : undefined,
          error: rows.length === 0 ? "No rows" : undefined,
          reloadDocument: true,
          icon: <ShareIcon className="mx-auto h-4 w-4 text-gray-800" />,
        },
        {
          name: "Public URL",
          description: "Share a row to the world",
          href: publicRow !== undefined ? `/public/${entity.slug}/${rows[0].id}` : undefined,
          error: !publicRow ? "No public rows" : undefined,
          reloadDocument: true,
          icon: <LinkIcon className="mx-auto h-4 w-4 text-gray-800" />,
        },
        {
          name: "Relationships",
          description: "Parents and children relationships view",
          href: `${entity.slug}/relationships`,
          icon: <TreeStructureIcon className="mx-auto h-4 w-4 text-gray-800" />,
          underConstruction: true,
          enterprise: true,
        },
      ],
    },
    // {
    //   title: "Custom Routes & Blocks",
    //   description: "Do you need to extend the default functionality (e.g. existing Prisma model)? These blocks are a great starting point.",
    //   views: [],
    // },
  ];
  if (!entity.isAutogenerated || entity.type === "system") {
    previews.forEach((preview) => {
      preview.views.forEach((view) => {
        view.error = "not autogenerated";
      });
    });
  }
  return previews;
}

export default {
  getBlockPreviews,
  getEntityPreviews,
};
