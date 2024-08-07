import { ActionFunction, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useNavigate, useParams } from "@remix-run/react";
import { useTypedLoaderData } from "remix-typedjson";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { Colors } from "~/application/enums/shared/Colors";
import PropertyForm from "~/components/entities/properties/PropertyForm";
import SlideOverFormLayout from "~/components/ui/slideOvers/SlideOverFormLayout";
import { getTranslations } from "~/locale/i18next.server";
import { getAllFormulas } from "~/modules/formulas/db/formulas.db.server";
import { FormulaDto } from "~/modules/formulas/dtos/FormulaDto";
import FormulaHelpers from "~/modules/formulas/utils/FormulaHelpers";
import UrlUtils from "~/utils/app/UrlUtils";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { PropertyWithDetails, EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { deleteProperty, getProperty, updateProperty, updatePropertyAttributes, updatePropertyOptions } from "~/utils/db/entities/properties.db.server";
import { validateProperty } from "~/utils/helpers/PropertyHelper";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";

type LoaderData = {
  entity: EntityWithDetails;
  item: PropertyWithDetails;
  formulas: FormulaDto[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const tenantId = await getTenantIdOrNull({ request, params });
  const entity = await getEntityBySlug({ tenantId, slug: params.entity ?? "" });
  const item = await getProperty(params.id ?? "");
  if (!item || item.tenantId !== tenantId) {
    return redirect(UrlUtils.getModulePath(params, `entities/${params.entity}`));
  }
  const data: LoaderData = {
    entity,
    item,
    formulas: (await getAllFormulas()).map((formula) => FormulaHelpers.getFormulaDto(formula)),
  };
  return json(data);
};

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdOrNull({ request, params });

  const entity = await getEntityBySlug({ tenantId, slug: params.entity ?? "" });

  const existing = await getProperty(params.id ?? "");
  if (!existing || existing.tenantId !== tenantId) {
    return badRequest({ error: t("shared.notFound") });
  }

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  const name = form.get("name")?.toString() ?? "";
  const title = form.get("title")?.toString() ?? "";
  const type = Number(form.get("type")) as PropertyType;
  const subtype = form.get("subtype")?.toString() ?? null;
  const order = Number(form.get("order"));
  let isRequired = Boolean(form.get("is-required"));
  const isHidden = Boolean(form.get("is-hidden"));
  const isDisplay = Boolean(form.get("is-display"));
  const isReadOnly = Boolean(form.get("is-read-only"));
  const canUpdate = Boolean(form.get("can-update"));
  let showInCreate = Boolean(form.get("show-in-create"));
  let formulaId = form.get("formula-id")?.toString() ?? null;

  if (["id", "folio", "createdAt", "createdByUser", "sort", "page", "q", "v", "redirect", "tags"].includes(name)) {
    return badRequest({ error: name + " is a reserved property name" });
  }

  const options: { order: number; value: string; name?: string; color?: Colors }[] = form.getAll("options[]").map((f: FormDataEntryValue) => {
    return JSON.parse(f.toString());
  });

  const attributes: { name: string; value: string }[] = form.getAll("attributes[]").map((f: FormDataEntryValue) => {
    return JSON.parse(f.toString());
  });

  if ([PropertyType.SELECT, PropertyType.MULTI_SELECT].includes(type) && options.length === 0) {
    return badRequest({ error: "Add at least one option" });
  }

  if (type !== PropertyType.FORMULA) {
    formulaId = null;
  } else {
    isRequired = false;
  }
  if ([PropertyType.FORMULA].includes(type) && !formulaId) {
    return badRequest({ error: "Select a formula" });
  }

  const errors = await validateProperty(name, title, entity.properties, existing);
  if (errors.length > 0) {
    return badRequest({ error: errors.join(", ") });
  }

  if (action === "edit") {
    try {
      if (name?.includes(" ")) {
        throw Error("Property names cannot contain spaces");
      }
      if (name?.includes("-")) {
        throw Error("Property names cannot contain: -");
      }
      await updateProperty(params.id ?? "", {
        name,
        title,
        type,
        subtype,
        order,
        isDefault: existing?.isDefault ?? false,
        isRequired,
        isHidden,
        isDisplay,
        isReadOnly,
        canUpdate,
        showInCreate,
        formulaId,
      });
      await updatePropertyOptions(params.id ?? "", options);
      await updatePropertyAttributes(params.id ?? "", attributes);
      return redirect(UrlUtils.getModulePath(params, `entities/${params.entity}`));
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  } else if (action === "delete") {
    const id = form.get("id")?.toString() ?? "";
    const existingProperty = await getProperty(id);
    if (!existingProperty) {
      return badRequest({ error: t("shared.notFound") });
    }
    await deleteProperty(id);
    return redirect(UrlUtils.getModulePath(params, `entities/${params.entity}`));
  }
  return badRequest({ error: t("shared.invalidForm") });
};

export default function EditEntityPropertyRoute() {
  const data = useTypedLoaderData<LoaderData>();
  const appOrAdminData = useAppOrAdminData();
  const navigate = useNavigate();
  const params = useParams();
  return (
    <SlideOverFormLayout
      title={"Update property"}
      description={data.item.title}
      onClosed={() => navigate(UrlUtils.getModulePath(params, `entities/${data.entity.slug}`))}
      className="max-w-sm"
    >
      <PropertyForm item={data.item} properties={[]} entities={appOrAdminData.entities} formulas={data.formulas} />
    </SlideOverFormLayout>
  );
}
