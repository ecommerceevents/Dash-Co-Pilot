import { useLocation, useSearchParams, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { allCookieCategories } from "~/application/cookies/ApplicationCookies";
import { CookieCategory } from "~/application/cookies/CookieCategory";
import { useRootData } from "~/utils/data/useRootData";
import CookieHelper from "~/utils/helpers/CookieHelper";
import CookiesList from "./CookiesList";
import { Button } from "../ui/button";

interface Props {
  onUpdated?: () => void;
}
export default function CookieConsentSettings({ onUpdated }: Props) {
  const { t } = useTranslation();
  let { userSession } = useRootData();
  const submit = useSubmit();
  let location = useLocation();
  const [searchParams] = useSearchParams();

  const [selectedCookies, setSelectedCookies] = useState<CookieCategory[]>([]);

  useEffect(() => {
    const initial: CookieCategory[] = [];
    allCookieCategories.forEach((cookie) => {
      if (userSession.cookies.find((f) => f.allowed && f.category === CookieCategory[cookie])) {
        initial.push(cookie);
      }
    });
    setSelectedCookies(initial);
  }, [userSession.cookies]);

  function setCookies(selectedCookies: CookieCategory[]) {
    const form = CookieHelper.getUpdateCookieConsentForm({ selectedCookies, location, searchParams });
    submit(form, { method: "post", action: "/" });
    if (onUpdated) {
      onUpdated();
    }
  }

  function toggle(category: CookieCategory) {
    if (selectedCookies.includes(category)) {
      setSelectedCookies(selectedCookies.filter((f) => f !== category));
    } else {
      setSelectedCookies([...selectedCookies, category]);
    }
  }
  function deny() {
    setCookies([CookieCategory.REQUIRED]);
  }
  function allowSelected() {
    setCookies(selectedCookies);
  }
  function allowAll() {
    setCookies(allCookieCategories);
  }

  return (
    <div className="space-y-3">
      <div className="font-extrabold">Cookies</div>

      <CookiesList selectedCookies={selectedCookies} toggle={toggle} />

      <div className="grid gap-2 sm:grid-cols-3">
        <Button variant="outline" onClick={deny}>
          {t("shared.deny")}
        </Button>
        <Button variant="outline" onClick={allowSelected}>
          {t("shared.allowSelected")}
        </Button>
        <Button variant="outline" type="button" onClick={allowAll}>
          {t("shared.allowAll")}
        </Button>
      </div>
    </div>
  );
}
