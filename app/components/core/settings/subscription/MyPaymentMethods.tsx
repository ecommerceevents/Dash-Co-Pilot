import { useRef } from "react";
import { useTranslation } from "react-i18next";
import Stripe from "stripe";
import PlusIcon from "~/components/ui/icons/PlusIcon";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import TableSimple from "~/components/ui/tables/TableSimple";

interface Props {
  items: Stripe.PaymentMethod[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export default function MyPaymentMethods({ items, onAdd, onDelete }: Props) {
  const { t } = useTranslation();
  const confirmModal = useRef<RefConfirmModal>(null);
  function deletePaymentMethod(id: string) {
    confirmModal.current?.setValue(id);
    confirmModal.current?.show(t("app.subscription.paymentMethods.delete"));
  }
  function confirmedCancel(id: string) {
    if (onDelete) {
      onDelete(id);
    }
  }
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between space-x-2">
        <div className="text-sm font-medium">{t("app.subscription.paymentMethods.cards")}</div>
        {/* <button className="text-sm hover:underline text-theme-600 hover:text-theme-700 font-medium" type="button" onClick={onAdd}>
          {t("shared.add")}
        </button> */}
      </div>
      {items.length > 0 ? (
        <TableSimple
          items={items}
          actions={[
            {
              title: t("shared.delete"),
              onClick: (_, i) => deletePaymentMethod(i.id),
              destructive: true,
            },
          ]}
          headers={[
            {
              name: "brand",
              title: t("app.subscription.paymentMethods.brand"),
              value: (i) => <div className="flex flex-col uppercase">{i.card?.brand}</div>,
            },
            {
              name: "country",
              title: t("app.subscription.paymentMethods.country"),
              value: (i) => <div className="flex flex-col">{i.card?.country}</div>,
            },
            {
              name: "expiration",
              title: t("app.subscription.paymentMethods.expiration"),
              value: (i) => (
                <div className="flex flex-col">
                  {i.card?.exp_month.toString().padStart(2, "0")}/{i.card?.exp_year}
                </div>
              ),
            },
            {
              name: "last4",
              title: t("app.subscription.paymentMethods.last4"),
              value: (i) => <div className="flex flex-col">**** **** **** {i.card?.last4}</div>,
            },
          ]}
        />
      ) : (
        <div className="mt-3">
          <button
            type="button"
            onClick={onAdd}
            className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <PlusIcon className="mx-auto h-4 text-gray-600" />
            <span className="mt-2 block text-sm font-medium text-gray-900">
              {t("shared.add")} {t("app.subscription.paymentMethods.card").toLowerCase()}
            </span>
          </button>
        </div>
      )}
      <ConfirmModal ref={confirmModal} onYes={confirmedCancel} destructive />
    </div>
  );
}
