import { useTranslation } from "react-i18next";
import TableSimple from "~/components/ui/tables/TableSimple";
import { EntitiesTemplateDto, TemplateEntityDto } from "~/modules/templates/EntityTemplateDto";

export default function PreviewEntitiesTemplate({ template }: { template: EntitiesTemplateDto }) {
  const { t } = useTranslation();
  function findParentRelationships(item: TemplateEntityDto) {
    return template.relationships.filter((f) => f.parent === item.name) ?? [];
  }
  function findChildRelationships(item: TemplateEntityDto) {
    return template.relationships.filter((f) => f.child === item.name) ?? [];
  }
  return (
    <TableSimple
      items={template.entities}
      headers={[
        { name: "prefix", title: "Prefix", value: (i) => i.prefix },
        {
          name: "name",
          title: "Name",
          value: (i) => (
            <div className="flex items-baseline space-x-1">
              <div>{i.name}</div>
              <div className="text-xs italic">({i.slug})</div>
            </div>
          ),
        },
        {
          name: "title",
          title: "Title",
          value: (i) => (
            <div className="flex items-baseline space-x-1">
              <div>{t(i.title)}</div>
              <div className="text-xs italic">({t(i.titlePlural)})</div>
            </div>
          ),
        },
        {
          name: "properties",
          title: "Properties",
          value: (i) => i.properties.map((i) => `${i.title}${i.isRequired ? "*" : ""} [${i.type}]`).join(", "),
          className: "text-xs",
        },
        {
          name: "parents",
          title: "Parents",
          value: (item) =>
            findChildRelationships(item)
              .map((i) => i.parent)
              .join(", "),
          className: "text-xs",
        },
        {
          name: "children",
          title: "Children",
          value: (item) =>
            findParentRelationships(item)
              .map((i) => i.child)
              .join(", "),
          className: "text-xs",
        },
        {
          name: "views",
          title: "Views",
          value: (item) => <div>{item.views?.map((i) => i.title + (i.isDefault ? " (default)" : "")).join(", ")}</div>,
        },
      ]}
    />
  );
}
