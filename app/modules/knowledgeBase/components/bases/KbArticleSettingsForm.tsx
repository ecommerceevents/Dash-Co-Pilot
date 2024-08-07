import { Form, useNavigation } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import InputSelector from "~/components/ui/input/InputSelector";
import InputText, { RefInputText } from "~/components/ui/input/InputText";
import { KnowledgeBaseArticleSimple, KnowledgeBaseArticleWithDetails } from "~/modules/knowledgeBase/db/kbArticles.db.server";
import UrlUtils from "~/utils/app/UrlUtils";
import InputCombobox from "~/components/ui/input/InputCombobox";
import { useTranslation } from "react-i18next";
import InputSelect from "~/components/ui/input/InputSelect";
import KnowledgeBaseUtils from "../../utils/KnowledgeBaseUtils";
import { KnowledgeBaseCategorySimple } from "../../db/kbCategories.db.server";

export default function KbArticleSettingsForm({
  allKnowledgeBases,
  allArticles,
  allCategories,
  item,
  onDelete,
}: {
  allKnowledgeBases: { id: string; title: string }[];
  allArticles: KnowledgeBaseArticleSimple[];
  allCategories: KnowledgeBaseCategorySimple[];
  item: KnowledgeBaseArticleWithDetails;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const inputTitle = useRef<RefInputText>(null);

  const [knowledgeBaseId, setKnowledgeBaseId] = useState(item?.knowledgeBaseId ?? "");
  const [categoryId, setCategoryId] = useState<string | undefined>(item?.categoryId ?? "");
  const [category, setCategory] = useState<KnowledgeBaseCategorySimple | undefined>(undefined);
  const [sectionId, setSectionId] = useState<string | undefined>(item?.sectionId ?? "");
  const [language, setLanguage] = useState(item?.language ?? KnowledgeBaseUtils.defaultLanguage);
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [seoImage, setSeoImage] = useState(item?.seoImage ?? "");
  const [isFeatured, setIsFeatured] = useState(item?.featuredOrder ? true : false);
  const [relatedArticles, setRelatedArticles] = useState(item.relatedArticles.map((f) => f.relatedArticleId) ?? []);

  useEffect(() => {
    if (!item) {
      const slug = UrlUtils.slugify(title);
      setSlug(slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  useEffect(() => {
    setCategory(allCategories.find((f) => f.id === categoryId));
  }, [allCategories, categoryId]);

  return (
    <Form method="post" className="space-y-6 pb-52">
      <input name="action" value="edit" readOnly hidden />
      <div className="space-y-3">
        <div className="grid gap-3">
          <InputText ref={inputTitle} name="title" title={"Title"} value={title} setValue={setTitle} required />
          <InputText
            name="slug"
            title={"Slug"}
            value={slug}
            setValue={setSlug}
            required
            hint={
              <button type="button" className="text-gray-400" onClick={() => setSlug(UrlUtils.slugify(title))}>
                Get from title
              </button>
            }
          />
          <InputText
            name="description"
            title={"Description"}
            value={description}
            setValue={setDescription}
            maxLength={300}
            // required
          />
          <InputSelector
            name="knowledgeBaseId"
            title={"Knowledge base"}
            value={knowledgeBaseId}
            setValue={(e) => setKnowledgeBaseId(e?.toString() ?? "")}
            options={allKnowledgeBases.map((f) => {
              return {
                value: f.id,
                name: f.title,
              };
            })}
          />
          <InputSelect
            name="language"
            title={"Language"}
            value={language}
            setValue={(e) => setLanguage(e?.toString() || "")}
            options={KnowledgeBaseUtils.supportedLanguages}
          />
          <InputSelector
            name="categoryId"
            title={"Category"}
            value={categoryId}
            setValue={(e) => setCategoryId(e?.toString())}
            options={allCategories
              .filter((f) => f.knowledgeBaseId === knowledgeBaseId && f.language === language)
              .map((f) => {
                return {
                  value: f.id,
                  name: f.title,
                };
              })}
          />
          {category && category.sections.length > 0 && (
            <InputSelector
              name="sectionId"
              title={"Section"}
              value={sectionId}
              setValue={(e) => setSectionId(e?.toString())}
              options={category.sections.map((f) => {
                return {
                  value: f.id,
                  name: f.title,
                };
              })}
            />
          )}
          <InputText name="seoImage" title={"SEO Image"} value={seoImage} setValue={setSeoImage} />

          {seoImage && (
            <div>
              <img className="overflow-hidden rounded-lg shadow-xl xl:border-b xl:border-gray-200" src={seoImage} alt={title} />
            </div>
          )}
          <InputCheckboxWithDescription
            name="isFeatured"
            title={"Featured"}
            value={isFeatured}
            setValue={setIsFeatured}
            description={"Displayed on the homepage."}
          />
          <div>
            {relatedArticles?.map((item, idx) => {
              return <input key={idx} type="hidden" name={`relatedArticles[]`} value={item} />;
            })}
            <InputCombobox
              name="relatedArticles"
              title={"Related articles"}
              value={relatedArticles}
              onChange={(e) => setRelatedArticles(e as string[])}
              hint={
                <button type="button" className="text-gray-400" onClick={() => setRelatedArticles([])}>
                  {t("shared.clear")}
                </button>
              }
              minDisplayCount={1}
              options={allArticles
                .filter((f) => f.id !== item.id && f.knowledgeBaseId === knowledgeBaseId && f.language === language)
                .map((f) => {
                  let title = f.title;
                  if (f.category) {
                    title = `${f.title} (${f.category.title})`;
                  }
                  if (f.category && f.section) {
                    title = `${f.title} (${f.category.title} / ${f.section.title})`;
                  }
                  return {
                    name: title,
                    value: f.id,
                  };
                })}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-between space-x-2 sm:mt-6">
        <div>
          <ButtonSecondary disabled={navigation.state === "submitting"} type="button" className="w-full" onClick={onDelete} destructive>
            <div>{"Delete"}</div>
          </ButtonSecondary>
        </div>
        <div className="flex space-x-2">
          <LoadingButton actionName="edit" type="submit" disabled={navigation.state === "submitting"}>
            {"Save"}
          </LoadingButton>
        </div>
      </div>
    </Form>
  );
}
