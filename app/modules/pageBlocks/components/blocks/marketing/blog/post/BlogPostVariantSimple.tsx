import { BlogPostBlockDto } from "./BlogPostBlockUtils";
import { Link, useParams, useSubmit } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Fragment, useRef } from "react";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import DateUtils from "~/utils/shared/DateUtils";
import PostTags from "~/components/blog/PostTags";
import { marked } from "marked";
import UrlUtils from "~/utils/app/UrlUtils";

export default function BlogPostVariantSimple({ item }: { item: BlogPostBlockDto }) {
  const { t } = useTranslation();
  const params = useParams();
  const submit = useSubmit();
  const confirmModal = useRef<RefConfirmModal>(null);

  function confirmedPublish() {
    const form = new FormData();
    form.set("action", "publish");
    form.set("id", item.data?.post.id ?? "");
    submit(form, {
      method: "post",
    });
  }
  return (
    <>
      {item.data && (
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-prose text-lg">
            {item.data.canEdit && (
              <div className=" mb-10 shadow-xl">
                <div className="border-border rounded-md border">
                  <div className="mx-auto max-w-7xl px-3 py-3 sm:pl-6 lg:pl-8">
                    <div className="flex flex-wrap items-center justify-between">
                      <div className="flex w-0 flex-1 items-center">
                        <span className="flex rounded-lg p-1">{/* <SpeakerphoneIcon className="h-6 w-6 text-white" aria-hidden="true" /> */}</span>
                        <p className="ml-3 truncate font-medium">{item.data.post.published ? t("blog.published") : t("blog.thisIsADraft")}</p>
                      </div>
                      <div className="order-3 mt-2 flex w-full flex-shrink-0 space-x-2 sm:order-2 sm:mt-0 sm:w-auto">
                        <ButtonSecondary to={UrlUtils.getModulePath(params, `blog/${item.data?.post.id}`)}>{t("shared.edit")}</ButtonSecondary>
                        {!item.data.post.published && (
                          <ButtonPrimary disabled={item.data.post.published} onClick={confirmedPublish}>
                            {t("blog.publish")}
                          </ButtonPrimary>
                        )}
                      </div>
                      <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
                        <button
                          type="button"
                          className="hover:bg-accent-500 -mr-1 flex rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2"
                        >
                          <span className="sr-only">Dismiss</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <div className="text-muted-foreground flex items-center justify-between space-x-2 px-2 text-center text-base tracking-wide">
                <Link to={UrlUtils.getBlogPath(params)}>
                  <span aria-hidden="true"> &larr;</span> {t("blog.backToBlog")}
                </Link>
                <div>{DateUtils.dateMonthDayYear(item.data.post.date)}</div>
              </div>
              <h1 className="block text-center text-3xl font-extrabold leading-8 tracking-tight sm:text-4xl">{item.data.post.title}</h1>
            </div>

            <dl className="pt-6 xl:pt-11">
              <dd>
                <ul className="flex justify-center space-x-8 sm:space-x-12 xl:block xl:space-x-0 xl:space-y-8">
                  <li className="flex items-center space-x-2">
                    {item.data.post.author?.avatar && <img src={item.data.post.author.avatar} alt="" className="h-10 w-10 rounded-full" />}
                    <dl className="whitespace-no-wrap text-sm font-medium leading-5">
                      <dt className="sr-only">{t("shared.name")}</dt>
                      {item.data.post.author && (
                        <dd className="">
                          {item.data.post.author.firstName} {item.data.post.author.lastName}{" "}
                          {/* <a href={item.data.post.author.url} target="_blank" rel="noreferrer" className="text-purple-500 hover:text-purple-600">
                            @{item.data.post.author.slug}
                          </a> */}
                        </dd>
                      )}

                      <PostTags items={item.data.post.tags} />
                    </dl>
                  </li>
                </ul>
              </dd>
            </dl>
            {/* <p className="mt-8 text-xl text-gray-500 leading-8">{item.data.post.description}</p> */}
          </div>
          <div className="prose prose-lg prose-indigo dark:prose-dark mx-auto mt-6 max-w-2xl space-y-6">
            {item.data.post.image && (
              <img className="rounded-lg border border-gray-300 shadow-lg dark:border-gray-800" src={item.data.post.image} alt={item.data.post.title} />
            )}
            <div dangerouslySetInnerHTML={{ __html: marked(item.data.post.content) }} />
          </div>
          <ConfirmModal ref={confirmModal} onYes={confirmedPublish} />
        </div>
      )}
    </>
  );
}
