import { useEffect, useRef, useState } from "react";
import InputText, { RefInputText } from "~/components/ui/input/InputText";
import { TenantRelationshipWithDetails } from "~/utils/db/tenants/tenantRelationships.db.server";
import { TenantTypeRelationshipWithDetails } from "~/utils/db/tenants/tenantTypeRelationships.db.server";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import RowProperties from "~/components/entities/rows/RowProperties";
import { useTranslation } from "react-i18next";
import FormGroup from "~/components/ui/forms/FormGroup";
import UrlUtils from "~/utils/app/UrlUtils";
import CollapsibleRow from "~/components/ui/tables/CollapsibleRow";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import ExclamationTriangleIcon from "~/components/ui/icons/ExclamationTriangleIcon";
import ErrorBanner from "~/components/ui/banners/ErrorBanner";
import UserUtils from "~/utils/app/UserUtils";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";

type UserDto = {
  email: string;
  password: string;
  passwordConfirmation: string;
  firstName: string;
  lastName: string;
};
export function LinkedAccountForm({
  item,
  relationship,
  tenantSettingsEntity,
}: {
  item?: TenantRelationshipWithDetails;
  relationship: TenantTypeRelationshipWithDetails;
  tenantSettingsEntity: EntityWithDetails | null;
}) {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [addMySelf, setAddMySelf] = useState(true);
  const [users, setUsers] = useState<UserDto[]>([]);

  useEffect(() => {
    setSlug(UrlUtils.slugify(name));
  }, [name]);

  const firstInput = useRef<RefInputText>(null);
  useEffect(() => {
    setTimeout(() => {
      firstInput.current?.input.current?.focus();
    }, 100);
  }, []);

  const addUser = () => {
    setUsers([...users, { email: "", firstName: "", lastName: "", password: "", passwordConfirmation: "" }]);
  };

  function getUserErrors(item: UserDto) {
    const errors: string[] = [];
    if (!item.email) {
      errors.push(t("shared.required", { 0: t("models.user.email") }));
    }
    if (!item.firstName) {
      errors.push(t("shared.required", { 0: t("models.user.firstName") }));
    }
    let passwordError = UserUtils.validatePasswords({ t, password: item.password, passwordConfirm: item.passwordConfirmation });
    if (passwordError) {
      errors.push(passwordError);
    }
    return errors;
  }
  return (
    <FormGroup
      labels={{
        create: t("shared.create") + " " + (relationship.toType?.title ?? t("models.tenant.object")),
      }}
    >
      <div className="space-y-3">
        <InputText ref={firstInput} autoFocus name="company" title={t("shared.name")} value={name} setValue={setName} required />
        <InputText name="slug" title={t("shared.slug")} value={slug} setValue={setSlug} required onBlur={() => setSlug(UrlUtils.slugify(slug))} />
        {tenantSettingsEntity && (
          <div className="col-span-6 sm:col-span-6">
            <RowProperties entity={tenantSettingsEntity} item={null} />
          </div>
        )}

        <InputCheckboxWithDescription
          name="addMySelf"
          title="Add myself as owner"
          description="You will be added as owner of the new account."
          value={addMySelf}
          setValue={setAddMySelf}
        />

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">{t("models.user.plural")}</label>
          <div className="flex flex-col space-y-2">
            {users.map((item, index) => {
              return <input key={index} type="hidden" name={`users[]`} value={JSON.stringify(item)} hidden readOnly />;
            })}
            {users.map((item, index) => {
              const errors = getUserErrors(item);
              return (
                <CollapsibleRow
                  key={index}
                  title={
                    <div className="flex items-center space-x-2">
                      <div>
                        {errors.length === 0 ? <CheckIcon className="h-4 w-4 text-teal-500" /> : <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />}
                      </div>
                      <div>{item.email || t("models.user.object") + " " + (index + 1).toString()}</div>
                    </div>
                  }
                  value={
                    <div className="flex items-center space-x-2">
                      <div>
                        {errors.length === 0 ? <CheckIcon className="h-4 w-4 text-teal-500" /> : <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />}
                      </div>
                      <div>{item.email || t("models.user.object") + " " + (index + 1).toString()}</div>
                    </div>
                  }
                  initial={true}
                  onRemove={() => {
                    setUsers(users.filter((_, i) => i !== index));
                  }}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <InputText
                      autoFocus
                      className="col-span-2"
                      name="email"
                      title={t("models.user.email")}
                      value={item.email}
                      setValue={(e) => setUsers(users.map((item, i) => (i === index ? { ...item, email: e.toString() } : item)))}
                    />
                    <InputText
                      name="first-name"
                      title={t("models.user.firstName")}
                      value={item.firstName}
                      setValue={(e) => setUsers(users.map((item, i) => (i === index ? { ...item, firstName: e.toString() } : item)))}
                    />
                    <InputText
                      name="last-name"
                      title={t("models.user.lastName")}
                      value={item.lastName}
                      setValue={(e) => setUsers(users.map((item, i) => (i === index ? { ...item, lastName: e.toString() } : item)))}
                    />
                    <InputText
                      className="col-span-2"
                      type="password"
                      name="password"
                      title={t("account.shared.password")}
                      value={item.password}
                      setValue={(e) => setUsers(users.map((item, i) => (i === index ? { ...item, password: e.toString() } : item)))}
                    />
                    <InputText
                      className="col-span-2"
                      type="password"
                      name="password-confirm"
                      title={t("account.register.confirmPassword")}
                      value={item.passwordConfirmation}
                      setValue={(e) => setUsers(users.map((item, i) => (i === index ? { ...item, passwordConfirmation: e.toString() } : item)))}
                    />
                    {errors.length > 0 && (
                      <div className="col-span-2">
                        <ErrorBanner title={t("shared.error")} text={errors.join(", ")} />
                      </div>
                    )}
                  </div>
                </CollapsibleRow>
              );
            })}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={addUser}
                className="flex items-center space-x-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 focus:text-gray-800 focus:ring focus:ring-gray-300 focus:ring-offset-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-medium uppercase">{t("shared.add")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </FormGroup>
  );
}
