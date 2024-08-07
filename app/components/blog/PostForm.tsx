import { useEffect, useRef, useState } from "react";
import { Form, useActionData, useNavigate, useNavigation, useParams, useSubmit } from "@remix-run/react";
import InputText, { RefInputText } from "../ui/input/InputText";
import { useTranslation } from "react-i18next";
import InputDate from "../ui/input/InputDate";
import InputSelector from "../ui/input/InputSelector";
import { BlogCategory, BlogTag } from "@prisma/client";
import UrlUtils from "~/utils/app/UrlUtils";
import LoadingButton from "../ui/buttons/LoadingButton";
import ConfirmModal, { RefConfirmModal } from "../ui/modals/ConfirmModal";
import ButtonSecondary from "../ui/buttons/ButtonSecondary";
import ButtonTertiary from "../ui/buttons/ButtonTertiary";
import Modal from "../ui/modals/Modal";
import UploadDocument from "../ui/uploaders/UploadDocument";
import ErrorModal, { RefErrorModal } from "../ui/modals/ErrorModal";
import InputCheckbox from "../ui/input/InputCheckbox";
import InputGroup from "../ui/forms/InputGroup";
import { marked } from "marked";
import { BlogPostWithDetails } from "~/modules/blog/db/blog.db.server";
import Editor from "~/modules/novel/ui/editor";
import InputRadioGroupCards from "../ui/input/InputRadioGroupCards";
import useLocalStorage from "~/utils/hooks/use-local-storage";

interface Props {
  item?: BlogPostWithDetails | null;
  categories: BlogCategory[];
  tags: BlogTag[];
  canUpdate?: boolean;
  canDelete?: boolean;
}
export default function PostForm({ item, categories, tags, canUpdate = true, canDelete = true }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const params = useParams();
  const loading = navigation.state === "submitting";
  const navigate = useNavigate();
  const submit = useSubmit();
  const actionData = useActionData<{ error?: string }>();

  const inputTitle = useRef<RefInputText>(null);
  const confirmRemove = useRef<RefConfirmModal>(null);
  const errorModal = useRef<RefErrorModal>(null);

  const [addingCategory, setAddingCategory] = useState(false);

  const [contentType, setContentType] = useState<"markdown" | "wysiwyg">(item?.contentType ?? ("wysiwyg" as any));

  const [markdown, setMarkdown] = useState("");
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [showUploadImage, setShowUploadImage] = useState(false);

  const [title, setTitle] = useState(item?.title ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [category, setCategory] = useState<string | number | undefined>(categories.length === 1 ? categories[0].id : undefined);
  const [postTags, setPostTags] = useState("");
  const [date, setDate] = useState<Date | undefined>(item?.date ?? new Date());
  const [description, setDescription] = useState(item?.description ?? "");
  const [readingTime, setReadingTime] = useState(item?.readingTime ?? "");
  const [published, setPublished] = useState(item?.published ?? false);
  const [image, setImage] = useState(item?.image ?? "");
  // const [content, setContent] = useState(item?.content ?? ``);
  const [content, setContent] = useLocalStorage(!item ? "blog-post-content" : "blog-" + item.slug, item?.content ?? "");

  useEffect(() => {
    // setTimeout(() => {
    //   inputTitle.current?.input.current?.focus();
    // }, 100);

    if (!item) {
      if (categories.length === 1) {
        setCategory(categories[0].id);
      }
    } else {
      setCategory(item.categoryId ?? undefined);
      setPostTags(item?.tags.map((postTag) => postTag.tag.name).join(",") ?? "");
    }

    if (actionData?.error) {
      errorModal.current?.show(t("shared.error"), actionData.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  useEffect(() => {
    if (!item) {
      const slug = UrlUtils.slugify(title);
      setSlug(slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  function changedTags(e: string) {
    setPostTags(e.replace(" ", "").replace("#", ""));
  }

  function remove() {
    confirmRemove.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }

  function yesRemove() {
    const form = new FormData();
    form.set("action", "delete");
    submit(form, {
      method: "post",
    });
  }

  function onPreview() {
    setMarkdown(marked(content));
    setShowMarkdown(true);
  }

  // function create() {
  //   if (!title || !slug || !description || !author || !category || !content) {
  //     errorModal.current?.show(t("shared.error"), t("shared.missingFields"));
  //     return;
  //   }
  //   const form = new FormData();
  //   form.set("action", !item ? "create" : "edit");
  //   form.set("title", title);
  //   form.set("slug", slug);
  //   form.set("author", author ?? "");
  //   form.set("category", category ?? "");
  //   form.set("tags", postTags);
  //   form.set("date", date);
  //   form.set("description", description);
  //   form.set("reading-time", readingTime);
  //   form.set("image", image);
  //   form.set("content", content);
  //   submit(form, {
  //     method: "post",
  //   });
  // }

  return (
    <Form method="post" className="space-y-6 pb-20">
      <input type="hidden" name="action" value={item ? "edit" : "create"} hidden readOnly />

      <div className="grid gap-3 lg:grid-cols-12">
        <div className="space-y-2 lg:col-span-8">
          <div className="flex justify-between space-x-2">
            <label className="text-sm font-medium text-gray-600">Blog Post</label>
          </div>
          {contentType === "wysiwyg" ? (
            <div>
              <input type="hidden" name="content" value={content} hidden readOnly />
              {typeof window !== "undefined" && <Editor content={content} onChange={(e) => setContent(e.html ?? "")} />}
            </div>
          ) : contentType === "markdown" ? (
            <InputGroup title="">
              <div className="grid grid-cols-12 gap-3 rounded-md bg-white">
                <InputText
                  disabled={!canUpdate}
                  className="col-span-12"
                  rows={6}
                  editor="monaco"
                  editorLanguage="markdown"
                  editorTheme="light"
                  editorSize="screen"
                  name="content"
                  value={content}
                  setValue={(e) => setContent(e.toString())}
                  required
                />
              </div>
            </InputGroup>
          ) : null}
        </div>
        <div className="space-y-3 lg:col-span-4">
          <InputGroup
            title="Content"
            right={
              <>
                <button type="button" className="text-sm font-medium underline" onClick={onPreview}>
                  {t("shared.preview")}
                </button>
              </>
            }
          >
            <InputRadioGroupCards
              name="contentType"
              columns={2}
              className="w-full"
              title="Type"
              value={contentType}
              onChange={(e) => setContentType(e as any)}
              display={"name"}
              options={[
                { value: "wysiwyg", name: "WYSIWYG" },
                { value: "markdown", name: "Markdown" },
              ]}
            />
          </InputGroup>
          <InputGroup title="SEO">
            <div className="grid grid-cols-12 gap-3">
              <InputText
                disabled={!canUpdate}
                ref={inputTitle}
                className="col-span-12"
                name="title"
                title={t("models.post.title")}
                value={title}
                setValue={setTitle}
                required
              />

              <InputText disabled={!canUpdate} className="col-span-12" name="slug" title={t("models.post.slug")} value={slug} setValue={setSlug} required />

              <InputText
                disabled={!canUpdate}
                className="col-span-12"
                rows={2}
                name="description"
                title={t("models.post.description")}
                value={description}
                setValue={setDescription}
                maxLength={300}
                required
              />

              <InputText
                disabled={!canUpdate}
                readOnly={image.startsWith("data:image")}
                className="col-span-12"
                name="image"
                title={t("models.post.image")}
                value={image}
                setValue={setImage}
                button={
                  <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5 ">
                    <kbd className="inline-flex items-center rounded border border-gray-200 bg-white px-2 font-sans text-sm font-medium text-gray-500">
                      <button type="button" onClick={() => setShowUploadImage(true)}>
                        Upload image
                      </button>
                    </kbd>
                  </div>
                }
              />

              {showUploadImage && (
                <UploadDocument
                  disabled={!canUpdate}
                  className="col-span-12"
                  accept="image/png, image/jpg, image/jpeg"
                  description={t("models.post.image")}
                  onDropped={(e) => setImage(e)}
                />
              )}

              {image && (
                <div className="col-span-12">
                  <img className="overflow-hidden rounded-lg shadow-xl xl:border-b xl:border-gray-200" src={image} alt={t("models.post.image")} />
                  <ButtonTertiary disabled={!canUpdate} onClick={() => setImage("")}>
                    {t("shared.delete")}
                  </ButtonTertiary>
                </div>
              )}
            </div>
          </InputGroup>

          <InputGroup title="Details">
            <div className="grid gap-3 rounded-md bg-white">
              {!addingCategory ? (
                <InputSelector
                  disabled={!canUpdate}
                  className=""
                  name="category"
                  title={t("models.post.category")}
                  value={category}
                  setValue={setCategory}
                  options={categories.map((category) => {
                    return {
                      value: category.id,
                      name: category.name,
                    };
                  })}
                  hint={
                    <button type="button" onClick={() => setAddingCategory(true)}>
                      {t("shared.add")}
                    </button>
                  }
                  // required
                />
              ) : (
                <InputText
                  name="new-category"
                  title={t("models.post.category")}
                  autoFocus
                  hint={
                    <button type="button" onClick={() => setAddingCategory(false)}>
                      {t("shared.cancel")}
                    </button>
                  }
                  defaultValue=""
                />
              )}
              <InputText
                disabled={!canUpdate}
                className=""
                name="tags"
                title={t("models.post.tags")}
                value={postTags}
                setValue={(e) => changedTags(e.toString())}
                hint={<div className="text-xs font-light italic text-gray-400">Separated by comma</div>}
              />
              <InputDate disabled={!canUpdate} className="" name="date" title={t("models.post.date")} value={date} onChange={setDate} required />

              <InputText
                disabled={!canUpdate}
                className=""
                name="reading-time"
                title={t("models.post.readingTime")}
                value={readingTime}
                setValue={setReadingTime}
                maxLength={10}
              />
              <InputCheckbox disabled={!canUpdate} className="" name="published" title={t("models.post.published")} value={published} setValue={setPublished} />
            </div>
          </InputGroup>

          <div className="flex justify-between space-x-2">
            <div>
              {item && (
                <ButtonSecondary destructive={true} disabled={loading || !canDelete} onClick={remove}>
                  <div>{t("shared.delete")}</div>
                </ButtonSecondary>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <ButtonSecondary onClick={() => navigate(UrlUtils.getModulePath(params, "blog"))} disabled={loading}>
                <div>{t("shared.cancel")}</div>
              </ButtonSecondary>
              {/* <ButtonSecondary onClick={preview} disabled={loading}>
            {t("shared.preview")}
          </ButtonSecondary> */}
              <LoadingButton type="submit" disabled={loading || !canUpdate}>
                {t("shared.save")}
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>

      <Modal className="sm:max-w-2xl" open={showMarkdown} setOpen={setShowMarkdown}>
        <div className="space-y-6 py-3">
          <h1 className="block text-center text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl">{title}</h1>
          <div className="prose">
            <div dangerouslySetInnerHTML={{ __html: markdown ?? "" }} />
          </div>
        </div>
      </Modal>

      <ConfirmModal ref={confirmRemove} onYes={yesRemove} />
      <ErrorModal ref={errorModal} />
    </Form>
  );
}
