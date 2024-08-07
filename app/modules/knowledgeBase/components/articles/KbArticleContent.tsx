import { Link } from "@remix-run/react";
import { marked } from "marked";
import { useTranslation } from "react-i18next";
import ThumbsDownIcon from "~/components/ui/icons/ThumbsDownIcon";
import ThumbsDownIconFilled from "~/components/ui/icons/ThumbsDownIconFilled";
import ThumbsUpIcon from "~/components/ui/icons/ThumbsUpIcon";
import ThumbsUpIconFilled from "~/components/ui/icons/ThumbsUpIconFilled";
import { KbArticleDto } from "~/modules/knowledgeBase/dtos/KbArticleDto";
import DateUtils from "~/utils/shared/DateUtils";

export default function KbArticleContent({
  item,
  content,
  actions,
  userState,
}: {
  item: KbArticleDto;
  content: string;
  userState?: {
    hasThumbsUp: boolean;
    hasThumbsDown: boolean;
  };
  actions?: {
    onThumbsUp: () => void;
    onThumbsDown: () => void;
  };
}) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-8">
          <div className="flex w-full flex-col">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold md:text-3xl">{item.title}</h1>
            </div>
            <p className="text-muted-foreground mt-2 font-light">{item.description}</p>
            <div className="flex justify-between space-x-2">
              <li className="mt-5 flex items-center space-x-2">
                {item.createdByUser?.avatar && (
                  <img
                    src={item.createdByUser.avatar}
                    alt={`${item.createdByUser.firstName} ${item.createdByUser.lastName}`}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <div>
                  {item.createdByUser && (
                    <dl className="whitespace-no-wrap text-sm font-medium leading-5">
                      <dt className="sr-only">Author</dt>
                      <dd className="">
                        <span className="text-muted-foreground font-normal">{t("shared.by")}</span> {item.createdByUser.firstName} {item.createdByUser.lastName}
                      </dd>
                    </dl>
                  )}
                  <dl className="whitespace-no-wrap text-xs leading-5">{DateUtils.dateAgo(item.createdAt)}</dl>
                </div>
              </li>
              {actions && (
                <div className="flex items-center space-x-2">
                  <button type="button" onClick={actions.onThumbsUp} className="text-muted-foreground hover:text-foreground flex  items-center space-x-2">
                    {userState?.hasThumbsUp ? <ThumbsUpIconFilled className="h-4 w-4" /> : <ThumbsUpIcon className="h-4 w-4" />}
                  </button>
                  <button type="button" onClick={actions.onThumbsDown} className="text-muted-foreground hover:text-foreground flex  items-center space-x-2">
                    {userState?.hasThumbsDown ? <ThumbsDownIconFilled className="h-4 w-4" /> : <ThumbsDownIcon className="h-4 w-4" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-border border-b pt-6"></div>

      <div className="grid gap-8 sm:grid-cols-12">
        <div className="overflow-auto sm:col-span-9">
          <div className="prose dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: marked(content) }} />
          </div>
        </div>
        {item.relatedArticles.length > 0 && (
          <div className="space-y-3 py-5 sm:col-span-3">
            <div className="text-muted-foreground text-sm font-medium">Related Articles</div>
            <div className="space-y-2">
              {item.relatedArticles.map((x) => (
                <Link to={x.href} key={x.href} className="flex items-center space-x-2 hover:underline">
                  <div className="text-sm">{x.title}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
