import { useTranslation } from "react-i18next";
import InfoBanner from "~/components/ui/banners/InfoBanner";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";

export default function () {
  const { t } = useTranslation();
  return (
    <EditPageLayout title={t("affiliates.title")}>
      <div className="space-y-2">
        <div>The Affiliates feature is yet to be implemented (Enterprise-only).</div>

        <div>But you can sign up to Rewardful in the meantime.</div>

        <InfoBanner title="Instructions">
          <ol className="space-y-2">
            <li>
              1. Create a Rewardful account (use{" "}
              <a href="https://www.rewardful.com/?via=saasrock" target="_blank" rel="noreferrer" className=" font-bold text-blue-600 underline">
                saasrock's link
              </a>{" "}
              and get a discount).
            </li>
            <li>
              2. Open the file: <code className="font-bold text-blue-800">app/utils/db/appConfiguration.db.server.ts</code>.
            </li>
            <li>
              3. Set <b>affiliates.providers.rewardfulApiKey</b> <i>(you can find it in your Rewardful company settings)</i>.
            </li>
            <li>
              4. Set <b>affiliates.signUpLink</b> <i>(i.e. https://saasrock.getrewardful.com/signup)</i>.
            </li>
            <li>
              5. Set <b>affiliates.percentage</b> and <b>affiliates.plans</b>.
            </li>
            <li>6. Create a campaign.</li>
            <li>7. Add yourself as an affiliate.</li>
            <li>8. Using the affiliate link, create a new account by subscribing to a plan (you can create a 100% off coupon for testing in production).</li>
            <li>9. Go to your stripe dashboard and confirm that the customer has metadata with the affiliate's ID.</li>
            <li>10. Check the affiliate's dashboard to see the commission.</li>
            <li>11. And that's it 🎉!</li>
          </ol>
        </InfoBanner>
      </div>
    </EditPageLayout>
  );
}
