import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useNavigation, useSubmit } from "@remix-run/react";
import { getTranslations } from "~/locale/i18next.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { addToBlacklist, deleteFromBlacklist, getBlacklist } from "~/utils/db/blacklist.db.server";
import { Blacklist } from "@prisma/client";
import TableSimple from "~/components/ui/tables/TableSimple";
import { getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import InputText from "~/components/ui/input/InputText";
import DateUtils from "~/utils/shared/DateUtils";
import OpenModal from "~/components/ui/modals/OpenModal";
import { useEffect, useRef, useState } from "react";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import InputRadioGroup from "~/components/ui/input/InputRadioGroup";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import { Colors } from "~/application/enums/shared/Colors";
import { useTypedLoaderData } from "remix-typedjson";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";

type LoaderData = {
  title: string;
  items: Blacklist[];
  pagination: PaginationDto;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.blacklist.view");
  const { t } = await getTranslations(request);

  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const { items, pagination } = await getBlacklist(undefined, currentPagination);

  const data: LoaderData = {
    title: `${t("models.blacklist.object")} | ${process.env.APP_NAME}`,
    items,
    pagination,
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

type ActionData = {
  error?: string;
  success?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  const { t } = await getTranslations(request);

  const form = await request.formData();
  const action = form.get("action")?.toString();
  if (action === "create") {
    await addToBlacklist({
      type: form.get("type")?.toString() ?? "",
      value: form.get("value")?.toString() ?? "",
    });
    return json({});
  } else if (action === "delete") {
    await deleteFromBlacklist({
      type: form.get("type")?.toString() ?? "",
      value: form.get("value")?.toString() ?? "",
    });
    return json({});
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export default function BlacklistRoute() {
  const data = useTypedLoaderData<LoaderData>();
  const { t } = useTranslation();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isAdding = navigation.state === "submitting" && navigation.formData?.get("action") === "create";

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isAdding) {
      setAdding(false);
      formRef.current?.reset();
    }
  }, [isAdding]);

  const [adding, setAdding] = useState(false);
  const [type, setType] = useState("email");

  function onDelete(item: Blacklist) {
    const form = new FormData();
    form.set("action", "delete");
    form.set("type", item.type);
    form.set("value", item.value);
    submit(form, {
      method: "post",
    });
  }
  function getColor(type: string) {
    switch (type) {
      case "email":
        return Colors.TEAL;
      case "domain":
        return Colors.INDIGO;
      case "ip":
        return Colors.RED;
      default:
        return Colors.GRAY;
    }
  }
  return (
    <EditPageLayout
      title={t("models.blacklist.object")}
      buttons={
        <>
          <ButtonPrimary disabled={isAdding} onClick={() => setAdding(true)}>
            {t("shared.new")}
          </ButtonPrimary>
        </>
      }
    >
      <TableSimple
        items={data.items}
        headers={[
          {
            name: "type",
            title: t("models.blacklist.type"),
            value: (i) => i.type,
            formattedValue: (i) => <SimpleBadge title={i.type} color={getColor(i.type)} />,
          },
          {
            name: "value",
            title: t("models.blacklist.value"),
            value: (i) => i.value,
            className: "w-full",
          },
          {
            name: "registerAttempts",
            title: t("models.blacklist.registerAttempts"),
            value: (i) => i.registerAttempts,
          },
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (item) => DateUtils.dateAgo(item.createdAt),
            className: "text-gray-400 text-xs",
            breakpoint: "sm",
          },
        ]}
        actions={[
          {
            title: t("shared.delete"),
            onClick: (_, i) => onDelete(i),
            disabled: () => navigation.state === "loading" || navigation.state === "submitting",
          },
        ]}
        pagination={data.pagination}
      />

      {adding && (
        <OpenModal onClose={() => setAdding(false)} className="max-w-md">
          <h3 className="mb-2 font-medium">{t("shared.add")}</h3>
          <Form ref={formRef} method="post">
            <input type="hidden" name="action" value="create" hidden readOnly />
            <div className="space-y-2">
              <InputRadioGroup
                value={type}
                setValue={(value) => setType(value?.toString() ?? "")}
                name="type"
                title={t("models.blacklist.type")}
                options={[
                  { name: t("models.blacklist.types.email"), value: "email" },
                  { name: t("models.blacklist.types.domain"), value: "domain" },
                  { name: t("models.blacklist.types.ip"), value: "ip" },
                ]}
              />
              <InputText name="value" title={t("models.blacklist.value")} className="w-full" required defaultValue="" />
              <div className="flex justify-end">
                <ButtonPrimary disabled={isAdding} type="submit">
                  {t("shared.add")}
                </ButtonPrimary>
              </div>
            </div>
          </Form>
        </OpenModal>
      )}
    </EditPageLayout>
  );
}
