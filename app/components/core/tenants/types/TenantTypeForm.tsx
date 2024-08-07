import { useState, useEffect, useRef, Fragment } from "react";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { useTranslation } from "react-i18next";
import FormGroup from "~/components/ui/forms/FormGroup";
import InputText, { RefInputText } from "~/components/ui/input/InputText";
import { useNavigate } from "@remix-run/react";
import { TenantTypeWithDetails } from "~/utils/db/tenants/tenantTypes.db.server";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import InputCheckboxCards from "~/components/ui/input/InputCheckboxCards";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";

export function TenantTypeForm({ item, allSubscriptionProducts }: { item?: TenantTypeWithDetails; allSubscriptionProducts: SubscriptionProductDto[] }) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const navigate = useNavigate();

  const [title, setTitle] = useState(item?.title || "");
  const [titlePlural, setTitlePlural] = useState(item?.titlePlural || "");
  const [description, setDescription] = useState(item?.description || "");
  const [isDefault, setIsDefault] = useState(item?.isDefault || false);
  const [subscriptionProducts, setSubscriptionProducts] = useState(item?.subscriptionProducts.map((p) => p.id) || []);

  const input = useRef<RefInputText>(null);
  useEffect(() => {
    setTimeout(() => {
      input.current?.input.current?.focus();
    }, 100);
  }, []);

  return (
    <FormGroup
      id={item?.id}
      onCancel={() => navigate("/admin/settings/accounts/types")}
      editing={true}
      canDelete={getUserHasPermission(appOrAdminData, "admin.accountTypes.delete")}
    >
      <div className="space-y-2">
        <InputText ref={input} autoFocus name="title" title={t("shared.title")} value={title} setValue={setTitle} required />
        <InputText name="titlePlural" title={t("shared.titlePlural")} value={titlePlural} setValue={setTitlePlural} required />
        <InputText name="description" title={t("shared.description")} value={description} setValue={setDescription} />
        <InputCheckboxWithDescription
          name="isDefault"
          title="Is default"
          value={isDefault}
          setValue={setIsDefault}
          description="All new tenants will be created with this type."
        />
        <Fragment>
          {subscriptionProducts?.map((item, idx) => {
            return <input key={idx} type="hidden" name={`subscriptionProducts[]`} value={item} />;
          })}
          <InputCheckboxCards
            columns={1}
            title={t("models.subscriptionProduct.plural")}
            value={subscriptionProducts}
            onChange={(e) => setSubscriptionProducts(e as string[])}
            display={"name"}
            options={allSubscriptionProducts.map((f) => {
              return {
                value: f.id ?? "",
                name: t(f.title),
              };
            })}
          />
        </Fragment>
        <input type="hidden" name="action" value="create" hidden readOnly />
      </div>
    </FormGroup>
  );
}
