import clsx from "clsx";
import { XIcon } from "lucide-react";
import ColorBackgroundUtils from "~/utils/shared/colors/ColorBackgroundUtils";
import ColorFocusUtils from "~/utils/shared/colors/ColorFocusUtils";
import ColorFocusWithinUtils from "~/utils/shared/colors/ColorFocusWithinUtils";
import ColorPlaceholderUtils from "~/utils/shared/colors/ColorPlaceholderUtils";
import ColorRingUtils from "~/utils/shared/colors/ColorRingUtils";
import ColorTextUtils from "~/utils/shared/colors/ColorTextUtils";
import { KnowledgeBaseDto } from "../dtos/KnowledgeBaseDto";
import { Link, useSearchParams } from "@remix-run/react";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { useTypedLoaderData } from "remix-typedjson";
import { KbSearchResultDto } from "../dtos/KbSearchResultDto";
import ColorBorderUtils from "~/utils/shared/colors/ColorBorderUtils";
import { Colors } from "~/application/enums/shared/Colors";
import { KbArticleDto } from "../dtos/KbArticleDto";
import ColorHoverUtils from "~/utils/shared/colors/ColorHoverUtils";

export default function KbSearch({ kb, autoFocus }: { kb: KnowledgeBaseDto; autoFocus: boolean }) {
  let data = useTypedLoaderData<
    | {
        search: KbSearchResultDto | undefined;
      }
    | undefined
  >();
  let [search, setSearch] = useState(data?.search?.query);
  let [debouncedQuery] = useDebounce(search, 500);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (debouncedQuery) {
      searchParams.set("q", debouncedQuery);
    } else {
      searchParams.delete("q");
    }
    if (searchParams.toString()) {
      setSearchParams(searchParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);
  return (
    <div className="w-full space-y-2">
      <div className={clsx("relative", ColorTextUtils.getText400(kb.color), ColorFocusWithinUtils.getText600(kb.color))}>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" height="48" width="48">
            <g id="magnifying-glass--glass-search-magnifying">
              <path id="Vector" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M6 11.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Z"></path>
              <path id="Vector_2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M13.5 13.5 10 10"></path>
            </g>
          </svg>
        </div>
        <input
          autoFocus={autoFocus}
          autoComplete="off"
          className={clsx(
            " block w-full rounded-md border-0 px-6 py-5 pl-12 outline-none ring-1 ring-inset transition-all focus:bg-white focus:ring-2 focus:ring-inset",
            ColorBackgroundUtils.getBg800(kb.color),
            ColorTextUtils.getText300(kb.color),
            ColorPlaceholderUtils.getText400(kb.color),
            ColorFocusUtils.getText600(kb.color),
            ColorFocusUtils.getPlaceholder600(kb.color),
            ColorFocusUtils.getRing600(kb.color),
            ColorRingUtils.getRing800(kb.color)
          )}
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="absolute inset-y-0 right-0 flex items-center pr-4" onClick={() => setSearch("")} aria-label="Clear search">
            <XIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {search && data?.search !== undefined && (
        <div>
          {!data.search || data.search.articles?.length === 0 ? (
            <div className={clsx("rounded-md border", ColorBorderUtils.get300(kb.color), ColorBackgroundUtils.getBg50(kb.color))}>
              <div className="rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className={clsx("h-5 w-5", ColorTextUtils.getText400(kb.color))}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  <div className="ml-3 w-full">
                    <h3 className={clsx("text-sm font-medium leading-5", ColorTextUtils.getText800(kb.color))}>No results for "{data.search.query}"</h3>
                    <div className={clsx("mt-2 text-sm leading-5", ColorTextUtils.getText800(kb.color))}>
                      <div>
                        <p className="text-sm">Try searching for something else.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="space-y-2">
                {data.search.articles.map((item) => (
                  <Card key={item.id} kb={kb} item={item} highlightText={debouncedQuery ?? ""} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Highlight({ className, color, children, highlightText }: { className: string; color: Colors; children: string; highlightText: string }) {
  const parts = children.split(new RegExp(`(${highlightText})`, "gi"));
  return (
    <span className={clsx(className, " line-clamp-3")}>
      {parts.map((part, i) =>
        part.toLowerCase() === highlightText.toLowerCase() ? (
          <span key={i} className={clsx(ColorBackgroundUtils.getBg400(color), ColorTextUtils.getText100(color))}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
}

function Card({ kb, item, highlightText }: { kb: KnowledgeBaseDto; item: KbArticleDto; highlightText: string }) {
  const contentLines = item.contentPublishedAsText.split("\n");
  const highlightedLines = contentLines
    .map((line, i) => ({ line, isHighlighted: line.toLowerCase().includes(highlightText.toLowerCase()), i }))
    .filter(({ isHighlighted }) => isHighlighted)
    .slice(0, 3);

  return (
    <div key={item.title} className={clsx("group rounded-md p-2 shadow-md", ColorBackgroundUtils.getBg800(kb.color), ColorHoverUtils.getBg900(kb.color))}>
      <Link to={item.href} className="w-full">
        <div className={clsx("space-y-1")}>
          <h2>
            <Highlight className={clsx(ColorTextUtils.getText100(kb.color))} color={kb.color} highlightText={highlightText}>
              {item.title}
            </Highlight>
          </h2>
          <p>
            <Highlight className={clsx(ColorTextUtils.getText300(kb.color))} color={kb.color} highlightText={highlightText}>
              {item.description}
            </Highlight>
          </p>
          {highlightedLines.map(({ line, i }) => (
            <p key={i}>
              <Highlight className={clsx(ColorTextUtils.getText300(kb.color))} color={kb.color} highlightText={highlightText}>
                {line}
              </Highlight>
            </p>
          ))}
        </div>
      </Link>
    </div>
  );
}
