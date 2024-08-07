import { ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { Link, useNavigate, useOutlet, useParams } from "@remix-run/react";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import TableSimple from "~/components/ui/tables/TableSimple";
import { getTranslations } from "~/locale/i18next.server";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { deleteEntityGroup, EntityGroupWithDetails, getAllEntityGroups, updateEntityGroup } from "~/utils/db/entities/entityGroups.db.server";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import OrderListButtons from "~/components/ui/sort/OrderListButtons";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import XIcon from "~/components/ui/icons/XIcon";

type LoaderData = {
  title: string;
  items: EntityGroupWithDetails[];
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.entities.view");
  const items = await getAllEntityGroups();
  const data: LoaderData = {
    title: `Entity Groups | ${process.env.APP_NAME}`,
    items,
  };
  return json(data);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();
  const action = form.get("action")?.toString();

  if (action === "set-orders") {
    await verifyUserHasPermission(request, "admin.entities.update");
    const items: { id: string; order: number }[] = form.getAll("orders[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    await Promise.all(
      items.map(async ({ id, order }) => {
        await updateEntityGroup(id, { order: Number(order) });
      })
    );
    return json({ updated: true });
  } else if (action === "delete") {
    await verifyUserHasPermission(request, "admin.entities.delete");
    const id = form.get("id")?.toString() ?? "";
    await deleteEntityGroup(id);
    return json({ success: t("shared.deleted") });
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const appOrAdminData = useAppOrAdminData();
  const outlet = useOutlet();
  const navigate = useNavigate();
  const params = useParams();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
      <div className="">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-lg font-medium leading-6">Entity Groups</h3>
          <div className="flex items-center space-x-2">
            <ButtonPrimary to="new" disabled={!getUserHasPermission(appOrAdminData, "admin.entities.create")}>
              {t("shared.new")}
            </ButtonPrimary>
          </div>
        </div>
      </div>

      <TableSimple
        items={data.items}
        headers={[
          {
            name: "order",
            title: "Order",
            value: (_item, idx) => (
              <div>
                <OrderListButtons index={idx} items={data.items.map((f) => ({ ...f, order: f.order ?? 0 }))} editable={true} />
              </div>
            ),
          },
          {
            name: "group",
            title: "Group",
            value: (item) => (
              <Link to={item.id} className="hover:underline">
                <span className="font-medium">{t(item.title)}</span> <span className="text-xs italic text-gray-500">({item.slug})</span>
              </Link>
            ),
          },
          {
            name: "section",
            title: "Section",
            value: (item) => <div>{item.section}</div>,
          },
          {
            name: "collapsible",
            title: "Collapsible",
            value: (i) => (i.collapsible ? <CheckIcon className="h-4 w-4 text-teal-500" /> : <XIcon className="h-4 w-4 text-gray-300" />),
          },
          {
            name: "entities",
            title: "Entities",
            className: "w-full",
            value: (i) => (
              <ul className="list-disc">
                {i.entities.map((f) => (
                  <li key={f.id}>
                    <div>
                      {t(f.entity.title)} {f.allView && <span className="text-xs italic text-gray-500">({f.allView.title})</span>}
                    </div>
                  </li>
                ))}
              </ul>
            ),
          },
          {
            name: "actions",
            title: "",
            value: (item) => (
              <Link to={item.id} className="hover:underline">
                {t("shared.edit")}
              </Link>
            ),
          },
        ]}
      />

      <SlideOverWideEmpty
        title={params.id ? "Edit Entity Group" : "New Entity Group"}
        open={!!outlet}
        onClose={() => {
          navigate(".", { replace: true });
        }}
        className="sm:max-w-sm"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{outlet}</div>
        </div>
      </SlideOverWideEmpty>
    </div>
  );
}
