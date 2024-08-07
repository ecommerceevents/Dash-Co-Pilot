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
import { PropertiesApi } from "~/utils/api/.server/PropertiesApi";
import UrlUtils from "~/utils/app/UrlUtils";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { PropertyWithDetails, getEntityBySlug, EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { validateProperty } from "~/utils/helpers/PropertyHelper";

type LoaderData = {
  entity: EntityWithDetails;
  properties: PropertyWithDetails[];
  formulas: FormulaDto[];
};
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const entity = await getEntityBySlug({ tenantId: null, slug: params.entity! });
  const data: LoaderData = {
    entity,
    properties: entity?.properties ?? [],
    formulas: (await getAllFormulas()).map((formula) => FormulaHelpers.getFormulaDto(formula)),
  };
  return success(data);
};

type ActionData = {
  error?: string;
  properties?: PropertyWithDetails[];
};
const success = (data: ActionData) => json(data, { status: 200 });
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);

  const entity = await getEntityBySlug({ tenantId: null, slug: params.entity! });

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  const name = form.get("name")?.toString() ?? "";
  const title = form.get("title")?.toString() ?? "";
  const type = Number(form.get("type")) as PropertyType;
  const subtype = form.get("subtype")?.toString() ?? null;
  const order = Number(form.get("order"));
  const isDefault = Boolean(form.get("is-default"));
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
    showInCreate = false;
  }
  if ([PropertyType.FORMULA].includes(type) && !formulaId) {
    return badRequest({ error: "Select a formula" });
  }

  const errors = await validateProperty(name, title, entity.properties);
  if (errors.length > 0) {
    return badRequest({ error: errors.join(", ") });
  }

  if (action === "create") {
    try {
      await PropertiesApi.create({
        entityId: entity.id,
        name,
        title,
        type,
        subtype,
        order,
        isDefault,
        isRequired,
        isHidden,
        isDisplay,
        isReadOnly,
        canUpdate,
        showInCreate,
        formulaId,
        options,
        attributes,
        tenantId: null,
      });
      return redirect(UrlUtils.getModulePath(params, `entities/${params.entity}/properties`));
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  }
  return badRequest({ error: t("shared.invalidForm") });
};

export default function NewEntityPropertyRoute() {
  const data = useTypedLoaderData<LoaderData>();
  const appOrAdminData = useAppOrAdminData();
  const navigate = useNavigate();
  const params = useParams();
  return (
    <SlideOverFormLayout
      title={"Create property"}
      description={""}
      onClosed={() => navigate(UrlUtils.getModulePath(params, `entities/${data.entity.slug}/properties`))}
      className="max-w-sm"
    >
      <PropertyForm properties={data.properties} entities={appOrAdminData.entities} formulas={data.formulas} />
    </SlideOverFormLayout>
  );
}
