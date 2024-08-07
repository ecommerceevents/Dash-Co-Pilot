import { TFunction } from "i18next";
import { DefaultVisibility } from "~/application/dtos/shared/DefaultVisibility";

function getVisibilityTitle(t: TFunction, visibility: string) {
  switch (visibility) {
    case DefaultVisibility.Private:
      return t("shared.private");
    case DefaultVisibility.Tenant:
      return "Everyone on the account";
    case DefaultVisibility.LinkedAccounts:
      return "Everyone on linked accounts";
    case DefaultVisibility.Public:
      return t("shared.public");
    default:
      return "";
  }
}

export default { getVisibilityTitle };
