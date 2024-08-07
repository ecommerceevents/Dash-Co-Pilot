import { ActionFunction, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useNavigate, useSearchParams } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import EntityViewForm from "~/components/entities/views/EntityViewForm";
import ErrorBanner from "~/components/ui/banners/ErrorBanner";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import InputGroup from "~/components/ui/forms/InputGroup";
import InputRadioGroupCards from "~/components/ui/input/InputRadioGroupCards";
import InputSelector from "~/components/ui/input/InputSelector";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { getTranslations } from "~/locale/i18next.server";
import { EntityViewsApi } from "~/utils/api/.server/EntityViewsApi";
import { EntityWithDetails, findEntityByName, getEntityById } from "~/utils/db/entities/entities.db.server";
import { adminGetAllTenants, TenantWithDetails } from "~/utils/db/tenants.db.server";
import { adminGetAllUsersNames, UserWithNames } from "~/utils/db/users.db.server";
import EntityViewHelper from "~/utils/helpers/EntityViewHelper";
import { getUserInfo } from "~/utils/session.server";

type LoaderData = {
  allTenants: TenantWithDetails[];
  allUsers: UserWithNames[];
  entity: EntityWithDetails;
};
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const entity = await findEntityByName({ tenantId: null, name: params.entity! });
  if (!entity || !entity.hasViews) {
    return redirect(`/admin/entities/views`);
  }
  const data: LoaderData = {
    allTenants: await adminGetAllTenants(),
    allUsers: await adminGetAllUsersNames(),
    entity,
  };
  return json(data);
};

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);
  const userInfo = await getUserInfo(request);

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "create") {
    try {
      const entityId = form.get("entityId")?.toString() ?? "";
      const entity = await getEntityById({ tenantId: null, id: entityId });
      if (!entity) {
        return json({ error: "Entity not found" }, { status: 404 });
      }
      const view = await EntityViewsApi.createFromForm({ entity, form, createdByUserId: userInfo.userId });
      const type = EntityViewHelper.getType(view);
      return redirect(`/admin/entities/views?type=${type}`);
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const navigate = useNavigate();

  const errorModal = useRef<RefErrorModal>(null);

  const [searchParams] = useSearchParams();

  const [error, setError] = useState<string>();

  const [type, setType] = useState<"default" | "tenant" | "user" | "system">();
  const [tenantId, setTenantId] = useState<string>();
  const [userId, setUserId] = useState<string>();

  const [viewType, setViewType] = useState<{
    tenantId: string | null;
    userId: string | null;
    isSystem: boolean;
  }>();

  useEffect(() => {
    const type = searchParams.get("type");
    if (type && ["default", "tenant", "user", "system"].includes(type)) {
      setType(type as any);
    }
  }, [searchParams]);

  useEffect(() => {
    setUserId(undefined);
  }, [tenantId]);

  useEffect(() => {
    setTenantId(undefined);
    setUserId(undefined);
  }, [type]);

  function getUsers() {
    const tenant = data.allTenants?.find((f) => f.id === tenantId);
    if (!tenant) {
      return data.allUsers ?? [];
    }
    return tenant?.users.map((f) => f.user) ?? [];
  }

  function getError() {
    let error: string | undefined = undefined;
    if (!type) {
      error = "Select a type";
    } else if (type === "tenant" && !tenantId) {
      error = "Select an account";
    } else if (type === "user" && (!userId || !tenantId)) {
      error = "Select an account and a user";
    } else if (type === "system" && (userId || tenantId)) {
      error = "System views can't be associated to a user or account";
    }
    return error;
  }

  function onAccept() {
    const error = getError();
    setError(error);

    if (!error) {
      setViewType({
        tenantId: tenantId ?? null,
        userId: userId ?? null,
        isSystem: type === "system",
      });
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onAccept();
  }

  return (
    <div>
      {!viewType ? (
        <Form onSubmit={handleSubmit} className="space-y-3">
          <InputGroup title={t("models.view.type")}>
            <div className="space-y-1">
              <InputRadioGroupCards
                display="name"
                name="type"
                value={type}
                onChange={(e) => setType((e?.toString() ?? "default") as any)}
                columns={2}
                options={[
                  { name: "Default (all accounts)", value: "default" },
                  { name: "Account", value: "tenant" },
                  { name: "User", value: "user" },
                  { name: "System", value: "system" },
                ]}
              />
            </div>
          </InputGroup>

          {type && ["tenant", "user"].includes(type) && (
            <InputGroup title="Applies to">
              <div className="grid gap-2">
                <InputSelector
                  withSearch={false}
                  name="tenantId"
                  title={t("models.view.tenant")}
                  value={tenantId}
                  setValue={(e) => setTenantId(e?.toString())}
                  hint={
                    <>
                      {tenantId !== undefined && (
                        <button type="button" onClick={() => setTenantId(undefined)} className="text-xs text-gray-500">
                          {t("shared.clear")}
                        </button>
                      )}
                    </>
                  }
                  options={(data.allTenants ?? []).map((f) => {
                    return {
                      value: f.id,
                      name: f.name + " (" + f.slug + ")",
                    };
                  })}
                />
                {type === "user" && (
                  <InputSelector
                    withSearch={false}
                    title={t("models.view.user")}
                    disabled={!tenantId}
                    value={userId}
                    setValue={(e) => setUserId(e?.toString())}
                    options={getUsers().map((f) => {
                      return {
                        value: f.id,
                        name: f.email,
                      };
                    })}
                    hint={
                      <>
                        {userId !== undefined && (
                          <button type="button" onClick={() => setUserId(undefined)} className="text-xs text-gray-500">
                            {t("shared.clear")}
                          </button>
                        )}
                      </>
                    }
                  />
                )}
              </div>
            </InputGroup>
          )}

          <div className="flex justify-between space-x-2">
            <div></div>
            <ButtonPrimary disabled={!!getError()} type="submit">
              {t("shared.next")}
            </ButtonPrimary>
          </div>

          {error && <ErrorBanner title={t("shared.error")} text={error} />}
        </Form>
      ) : (
        <EntityViewForm
          entity={data.entity}
          tenantId={viewType.tenantId}
          userId={viewType.userId}
          isSystem={viewType.isSystem}
          onClose={() => navigate(`/admin/entities/views`)}
          showViewType={true}
        />
      )}

      <ErrorModal ref={errorModal} />
    </div>
  );
}
