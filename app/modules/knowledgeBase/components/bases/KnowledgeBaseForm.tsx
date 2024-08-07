import { Form, useNavigate, useNavigation } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { Colors } from "~/application/enums/shared/Colors";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import InputCombobox from "~/components/ui/input/InputCombobox";
import InputSelect from "~/components/ui/input/InputSelect";
import InputSelector from "~/components/ui/input/InputSelector";
import InputText, { RefInputText } from "~/components/ui/input/InputText";
import { KnowledgeBaseDto } from "~/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import UrlUtils from "~/utils/app/UrlUtils";
import { getColors } from "~/utils/shared/ColorUtils";
import KbNavLinksTable from "./KbNavLinksTable";
import KnowledgeBaseUtils from "~/modules/knowledgeBase/utils/KnowledgeBaseUtils";
import LogoLight from "~/assets/img/logo-light.png";
import LogoDark from "~/assets/img/logo-dark.png";
import clsx from "clsx";
import ColorBackgroundUtils from "~/utils/shared/colors/ColorBackgroundUtils";
import { useTranslation } from "react-i18next";

export default function KnowledgeBaseForm({ item, onDelete }: { item?: KnowledgeBaseDto; onDelete?: () => void }) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const navigate = useNavigate();

  // const [showFilterModal, setShowFilterModal] = useState<{ item?: { type: FeatureFlagsFilterType; value: string | null }; idx?: number }>();

  const mainInput = useRef<RefInputText>(null);
  useEffect(() => {
    setTimeout(() => {
      mainInput.current?.input.current?.focus();
    }, 100);
  }, []);

  const [basePath, setBasePath] = useState<string | number | undefined>(item ? item.basePath : "/");
  const [slug, setSlug] = useState(item ? item.slug : "docs");
  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [defaultLanguage, setDefaultLanguage] = useState<string | undefined>(item?.defaultLanguage || KnowledgeBaseUtils.defaultLanguage);
  const [layout, setLayout] = useState<"list" | "articles" | "grid">(item?.layout || ("list" as any));
  const [color, setColor] = useState(item?.color || Colors.BLUE);
  const [enabled, setEnabled] = useState(item?.enabled ?? false);
  // const [metatags, setMetatags] = useState<MetaTagsDto>(item?.metatags || []);
  const [languages, setLanguages] = useState<string[]>(item?.languages || [KnowledgeBaseUtils.defaultLanguage]);
  const [logo, setLogo] = useState<"light" | "dark" | string>(item?.logo || "dark");
  const [seoImage, setSeoImage] = useState(item?.seoImage || "");
  const [links, setLinks] = useState<{ name: string; href: string; order: number }[]>(item?.links || []);

  useEffect(() => {
    if (!item) {
      setSlug(UrlUtils.slugify(title.toLowerCase()));
    }
  }, [item, title]);

  return (
    <div>
      <Form method="post" className="inline-block w-full overflow-hidden p-1 text-left align-bottom sm:align-middle">
        <input type="hidden" name="action" value={item ? "edit" : "new"} hidden readOnly />
        {links.map((item, index) => {
          return <input type="hidden" name="links[]" value={JSON.stringify(item)} key={index} hidden readOnly />;
        })}

        <div className="space-y-2">
          <InputText ref={mainInput} autoFocus name="title" title={"Title"} value={title} setValue={setTitle} required />
          <InputSlug slug={slug} basePath={basePath?.toString() ?? ""} setSlug={setSlug} setBasePath={setBasePath} />
          <InputText name="description" title={"Description"} value={description} setValue={setDescription} />
          <div>
            {languages?.map((item, idx) => {
              return <input key={idx} type="hidden" name={`languages[]`} value={item} />;
            })}
            <InputCombobox
              name="languages"
              title={"Languages"}
              value={languages}
              onChange={(e) => setLanguages(e as string[])}
              options={KnowledgeBaseUtils.supportedLanguages}
            />
          </div>
          <InputSelect
            name="defaultLanguage"
            title={"Default language"}
            value={defaultLanguage}
            setValue={(e) => setDefaultLanguage(e?.toString() || "en")}
            options={languages.map((item) => {
              return {
                value: item,
                name: item,
              };
            })}
          />
          <InputSelect
            name="layout"
            title={"Layout"}
            value={layout}
            setValue={(e) => setLayout((e?.toString() as any) || "list")}
            options={[
              {
                value: "list",
                name: t("knowledgeBase.layouts.list"),
              },
              {
                value: "articles",
                name: t("knowledgeBase.layouts.articles"),
              },
              {
                value: "grid",
                name: t("knowledgeBase.layouts.grid"),
              },
              {
                value: "docs",
                name: t("knowledgeBase.layouts.docs"),
              },
            ]}
          />
          <InputSelector
            name="color"
            title={"Color"}
            value={color}
            setValue={(e) => setColor(e as number)}
            withColors={true}
            options={
              getColors().map((color) => {
                return {
                  name: Colors[color ?? 0],
                  value: color,
                  color,
                };
              }) ?? []
            }
          />

          <InputText
            name="logo"
            title={"Logo"}
            value={logo}
            setValue={setLogo}
            hint={"light, dark or url"}
            button={
              <div className="absolute inset-y-0 right-0 flex py-0.5 pr-0.5 ">
                <kbd
                  className={clsx(
                    "inline-flex w-auto items-center justify-center rounded border border-gray-300 px-1 text-center font-sans text-xs font-medium text-gray-500",
                    ColorBackgroundUtils.getBg700(color)
                  )}
                >
                  {logo === "light" ? (
                    <img className="h-7 w-auto" src={LogoLight} alt="Logo" />
                  ) : logo === "dark" ? (
                    <img className="h-7 w-auto" src={LogoDark} alt="Logo" />
                  ) : logo.startsWith("http") ? (
                    <img className="h-7 w-auto" src={logo} alt="Logo" />
                  ) : (
                    <div className="italic text-white">Invalid</div>
                  )}
                </kbd>
              </div>
            }
          />
          <InputText name="seoImage" title={"SEO Image"} value={seoImage} setValue={setSeoImage} hint={"url"} />
          {seoImage && (
            <div className="col-span-12">
              <img className="overflow-hidden rounded-lg shadow-xl xl:border-b xl:border-gray-200" src={seoImage} alt={title} />
            </div>
          )}

          <InputCheckboxWithDescription
            name="enabled"
            title={"Enabled"}
            value={enabled}
            setValue={setEnabled}
            description={"If disabled, the knowledge base will not be accessible."}
          />

          <KbNavLinksTable items={links} setItems={setLinks} />
        </div>
        <div className="mt-5 flex justify-between space-x-2 sm:mt-6">
          <div>
            {onDelete && (
              <ButtonSecondary disabled={navigation.state === "submitting"} type="button" className="w-full" onClick={onDelete} destructive>
                <div>{"Delete"}</div>
              </ButtonSecondary>
            )}
          </div>
          <div className="flex space-x-2">
            <ButtonSecondary onClick={() => navigate("/admin/knowledge-base/bases")}>{"Cancel"}</ButtonSecondary>
            <LoadingButton actionName={item ? "edit" : "new"} type="submit" disabled={navigation.state === "submitting"}>
              {"Save"}
            </LoadingButton>
          </div>
        </div>
      </Form>
    </div>
  );
}

function InputSlug({
  slug,
  basePath,
  setSlug,
  setBasePath,
}: {
  slug: string;
  basePath: string;
  setSlug: React.Dispatch<React.SetStateAction<string>>;
  setBasePath: React.Dispatch<React.SetStateAction<string | number | undefined>>;
}) {
  const { t } = useTranslation();
  const [type, setType] = useState<"help" | "docs">(basePath === "/" ? "docs" : "help");

  useEffect(() => {
    if (type === "docs") {
      setBasePath("/");
      // setSlug("docs");
    } else {
      setBasePath("/help");
      // setSlug(slug);
    }
  }, [setBasePath, slug, type]);
  return (
    <div className="space-y-2">
      <InputSelect
        title={t("shared.type")}
        value={type}
        setValue={(e) => setType(e as any)}
        options={[
          {
            value: "docs",
            name: "/docs",
          },
          {
            value: "help",
            name: "/help/:slug",
          },
        ]}
      />
      {type === "docs" ? (
        <>
          <input type="hidden" name="basePath" value={"/"} hidden readOnly />
          <input type="hidden" name="slug" value={"docs"} hidden readOnly />
          <InputText title={"URL"} defaultValue={"/docs"} disabled />
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <InputSelect
              name="basePath"
              title="Base path"
              value={basePath}
              setValue={setBasePath}
              options={[
                {
                  value: "/help",
                  name: "/help/",
                },
              ]}
              required
            />
            <InputText name="slug" title={"Slug"} value={slug} setValue={setSlug} required />
            <InputText title={"URL"} value={UrlUtils.join(basePath, slug)} setValue={() => {}} disabled />
          </div>
        </>
      )}
    </div>
  );
}
