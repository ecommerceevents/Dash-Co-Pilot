import { useTranslation } from "react-i18next";

export default function RowCreatedByCell({
  user,
  apiKey,
}: {
  user?: { firstName: string; lastName: string; email: string } | null;
  apiKey?: { alias: string } | null;
}) {
  const { t } = useTranslation();
  return (
    <div>
      {user ? (
        <div className="flex flex-col text-xs">
          <div className="font-medium">
            {user?.firstName} {user?.lastName}
          </div>
          <div>{user?.email}</div>
        </div>
      ) : apiKey ? (
        <div>
          {t("models.apiKey.object")}: {apiKey.alias}
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
