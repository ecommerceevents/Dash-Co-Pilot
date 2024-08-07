import { useTranslation } from "react-i18next";
import { useNavigate } from "@remix-run/react";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import InputText from "~/components/ui/input/InputText";
import OpenModal from "~/components/ui/modals/OpenModal";

interface Props {
  apiKey: {
    key: string;
    alias: string;
  };
  redirectTo: string;
}
export default function ApiKeyCreatedModal({ apiKey, redirectTo }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <OpenModal className="max-w-md" onClose={() => navigate(redirectTo)}>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between space-x-1">
          <h3 className="font-bold">API Key created</h3>
          <div className="text-gray-500">Alias: {apiKey.alias}</div>
        </div>
        <div className="text-sm text-gray-600">This is your only chance to see this key. Copy it and store it store it somewhere safe.</div>
        <InputText className="flex-grow select-all" disabled={true} name="" title="API Key" withLabel={false} defaultValue={apiKey.key} />
        <div className="border-t border-gray-50 pt-4">
          <ButtonPrimary className="flex w-full justify-center text-center" to={redirectTo}>
            {t("shared.acceptAndContinue")}
          </ButtonPrimary>
        </div>
      </div>
    </OpenModal>
  );
}
