import { useLocation, useParams } from "@remix-run/react";
import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useTypedFetcher } from "remix-typedjson";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import StarsIconFilled from "~/components/ui/icons/StarsIconFilled";
import InputText from "~/components/ui/input/InputText";
import Modal from "~/components/ui/modals/Modal";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";

export default function AddFeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Fragment>
      <div className="relative hidden sm:inline-flex">
        <div className="relative">
          <div className="inline-flex divide-x divide-gray-300 rounded-sm shadow-none">
            <div className="relative z-0 inline-flex rounded-full text-sm shadow-none">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="relative inline-flex items-center rounded-full border border-gray-100 bg-gray-50 p-2 font-medium text-gray-500 shadow-inner hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2"
                aria-haspopup="listbox"
                aria-expanded="true"
                aria-labelledby="chat-label"
              >
                <span className="sr-only">Feedback</span>

                <StarsIconFilled className="h-5 w-5 p-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <Modal open={isOpen} setOpen={setIsOpen} size="sm">
        <FeedbackForm onClose={() => setIsOpen(false)} />
      </Modal>
    </Fragment>
  );
}

function FeedbackForm({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const params = useParams();
  const appOrAdminData = useAppOrAdminData();
  const fetcher = useTypedFetcher<{ success?: string; error?: string }>();
  const location = useLocation();

  useEffect(() => {
    if (fetcher.data?.success) {
      toast.success(fetcher.data.success);
      onClose();
    } else if (fetcher.data?.error) {
      toast.error(fetcher.data.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetcher.submit(e.currentTarget, {
      method: "post",
      action: `/app/${params.tenant}`,
    });
    // onClose();
  };
  return (
    <fetcher.Form onSubmit={onSubmit} method="post">
      <input type="hidden" name="action" value="add-feedback" readOnly hidden />
      <input type="hidden" name="tenantId" value={appOrAdminData.currentTenant?.id} readOnly hidden />
      <input type="hidden" name="fromUrl" value={location.pathname} readOnly hidden />
      <div className="space-y-3">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{t("feedback.title")}</h3>
        <p className="text-sm text-gray-500">{t("feedback.description")}</p>
        <InputText name="message" defaultValue="" required rows={5} placeholder={t("feedback.placeholder")} />
        <div className="flex justify-between">
          <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:underline">
            {t("shared.cancel")}
          </button>
          <ButtonPrimary type="submit">{t("feedback.send")}</ButtonPrimary>
        </div>
      </div>
    </fetcher.Form>
  );
}
