import { ActionFunction, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { getTranslations } from "~/locale/i18next.server";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import {
  CreatePermissionDto,
  CreateRoleDto,
  defaultAdminRoles,
  defaultAppRoles,
  defaultPermissions,
  seedRolesAndPermissions,
} from "~/utils/services/rolesAndPermissionsService";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import InputGroup from "~/components/ui/forms/InputGroup";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import ServerError from "~/components/ui/errors/ServerError";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import { getAllRolesNames } from "~/utils/db/permissions/roles.db.server";
import { getAllPermissionsIdsAndNames } from "~/utils/db/permissions/permissions.db.server";
import TableSimple from "~/components/ui/tables/TableSimple";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";

type LoaderData = {
  title: string;
  roles: {
    all: CreateRoleDto[];
    missing: CreateRoleDto[];
  };
  permissions: {
    all: CreatePermissionDto[];
    missing: CreatePermissionDto[];
  };
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const roles: { all: CreateRoleDto[]; missing: CreateRoleDto[] } = {
    all: [...defaultAppRoles, ...defaultAdminRoles],
    missing: [],
  };
  const createdRoles = await getAllRolesNames();
  roles.all.forEach((role) => {
    const existing = createdRoles.find((r) => r.name === role.name);
    if (!existing) {
      roles.missing.push(role);
    }
  });

  const permissions: { all: CreatePermissionDto[]; missing: CreatePermissionDto[] } = {
    all: defaultPermissions,
    missing: [],
  };
  const createdPermissions = await getAllPermissionsIdsAndNames();
  permissions.all.forEach((permission) => {
    const existing = createdPermissions.find((r) => r.name === permission.name);
    if (!existing) {
      permissions.missing.push(permission);
    }
  });
  const data: LoaderData = {
    title: `Seed | ${process.env.APP_NAME}`,
    roles,
    permissions,
  };
  return json(data);
};

type ActionData = {
  success?: string;
  error?: string;
};
export const action: ActionFunction = async ({ request }) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();
  const action = form.get("action");
  if (action === "seed") {
    try {
      await seedRolesAndPermissions();
      return json({ success: "Roles and permissions seeded successfully" }, { status: 200 });
    } catch (e: any) {
      return json({ error: e.message }, { status: 500 });
    }
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function () {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const appOrAdminData = useAppOrAdminData();

  const submit = useSubmit();

  const modalConfirmSeed = useRef<RefConfirmModal>(null);

  function onSeed() {
    modalConfirmSeed.current?.show("Seed missing roles and permissions", t("shared.confirm"), t("shared.back"), "Do you want to seed roles and permissions?");
  }
  function onConfirmSeed() {
    const form = new FormData();
    form.set("action", "seed");
    submit(form, {
      method: "post",
    });
  }

  return (
    <EditPageLayout>
      <InputGroup title={"Missing roles & permissions"} className="bg-red-50">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-800">Roles</h3>
          <TableSimple
            items={data.roles.missing}
            headers={[
              {
                name: "type",
                title: "Type",
                value: (i) => i.type,
              },
              {
                name: "name",
                title: "Name",
                value: (i) => i.name,
                className: "w-full",
              },
            ]}
          />

          <h3 className="text-lg font-medium text-gray-800">Permissions</h3>
          <TableSimple
            items={data.permissions.missing}
            headers={[
              {
                name: "type",
                title: "Type",
                value: (i) => i.type,
              },
              {
                name: "name",
                title: "Name",
                value: (i) => i.name,
              },
              {
                name: "description",
                title: "Description",
                value: (i) => i.description,
                className: "w-full",
              },
              {
                name: "inRoles",
                title: "In roles",
                value: (i) => i.inRoles.join(", "),
              },
            ]}
          />

          <div className="flex justify-end">
            <ButtonSecondary disabled={!getUserHasPermission(appOrAdminData, "admin.roles.create")} destructive onClick={onSeed}>
              Seed default: {data.roles.missing.length}/{data.roles.all.length} roles and {data.permissions.missing.length}/{data.permissions.all.length}{" "}
              permissions
            </ButtonSecondary>
          </div>
        </div>
      </InputGroup>

      <ConfirmModal ref={modalConfirmSeed} onYes={onConfirmSeed} />
      <ActionResultModal actionData={actionData} />
    </EditPageLayout>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
