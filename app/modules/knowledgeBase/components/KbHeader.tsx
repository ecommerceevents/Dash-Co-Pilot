import { Link, useNavigate, useParams, useSearchParams } from "@remix-run/react";
import { Fragment } from "react";
import type { KnowledgeBaseDto } from "../dtos/KnowledgeBaseDto";
import clsx from "clsx";
import ColorBackgroundUtils from "~/utils/shared/colors/ColorBackgroundUtils";
import ColorTextUtils from "~/utils/shared/colors/ColorTextUtils";
import ColorFocusUtils from "~/utils/shared/colors/ColorFocusUtils";
import ColorRingUtils from "~/utils/shared/colors/ColorRingUtils";
import ColorGradientUtils from "~/utils/shared/colors/ColorGradientUtils";
import LogoLight from "~/assets/img/logo-light.png";
import LogoDark from "~/assets/img/logo-dark.png";
import KnowledgeBaseUtils from "../utils/KnowledgeBaseUtils";
import KbSearch from "./KbSearch";

interface Props {
  kb: KnowledgeBaseDto;
  // currentVersion: string | undefined;
  withTitleAndDescription: boolean;
  withSearch?: boolean;
}
export default function KbHeader({ kb, withTitleAndDescription, withSearch = true }: Props) {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  return (
    <div>
      <div className={clsx("bg-gradient-to-r text-white", ColorGradientUtils.getFrom800To900(kb.color))}>
        <div className="mx-auto max-w-5xl space-y-8 px-8 py-6">
          <div className="flex h-12 items-center justify-between space-x-2">
            <Link to={KnowledgeBaseUtils.getKbUrl({ kb, params })} className="flex select-none items-center space-x-2">
              {kb.logo === "light" ? (
                <img className="h-8 w-auto" src={LogoLight} alt="Logo" />
              ) : kb.logo === "dark" ? (
                <img className="h-8 w-auto" src={LogoDark} alt="Logo" />
              ) : (
                <img className="h-8 w-auto" src={kb.logo} alt="Logo" />
              )}
              {!withTitleAndDescription && (
                <Fragment>
                  <span className={clsx("hidden px-2 sm:block", ColorTextUtils.getText300(kb.color))}>|</span>
                  <span className="hidden  font-semibold sm:block">{kb.title}</span>
                </Fragment>
              )}
            </Link>
            <div className="flex items-center space-x-4">
              {kb.links.map((link) => {
                return (
                  <a key={link.href} href={link.href} className={clsx("transition-colors duration-150 hover:text-white", ColorTextUtils.getText300(kb.color))}>
                    {link.name}
                  </a>
                );
              })}
              <div className="flex items-center space-x-2">
                {kb.languages.length > 1 && (
                  <select
                    id="lang"
                    name="lang"
                    defaultValue={params.lang || kb.defaultLanguage}
                    className={clsx(
                      "block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-white ring-1 ring-inset focus:ring-2 sm:text-sm sm:leading-6",
                      ColorBackgroundUtils.getBg700(kb.color),
                      ColorRingUtils.getRing800(kb.color),
                      ColorFocusUtils.getRing600(kb.color)
                    )}
                    onChange={(e) => {
                      navigate(
                        `${KnowledgeBaseUtils.getKbUrl({
                          kb,
                          params: {
                            lang: e.target.value,
                          },
                        })}?${searchParams.toString()}`
                      );
                    }}
                  >
                    {kb.languages.map((lang) => {
                      const language = KnowledgeBaseUtils.supportedLanguages.find((f) => f.value === lang);
                      if (!language) return null;
                      return (
                        <Fragment key={lang}>
                          <option key={lang} value={lang}>
                            {language.value}
                          </option>
                        </Fragment>
                      );
                    })}
                  </select>
                )}
              </div>
            </div>
          </div>
          {withTitleAndDescription && (
            <div className="space-y-4">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">{kb.title}</h1>
              <p className={clsx("text-base", ColorTextUtils.getText300(kb.color))}>{kb.description}</p>
            </div>
          )}
          {withSearch && <KbSearch kb={kb} autoFocus={withTitleAndDescription} />}
        </div>
      </div>
      {/* {searchParams.get("q") && (
        <div className="mx-auto max-w-5xl space-y-8 px-8 py-6">
          <WarningBanner title="TODO">TODO: Search results for {searchParams.get("q")}</WarningBanner>
        </div>
      )} */}
    </div>
  );
}
