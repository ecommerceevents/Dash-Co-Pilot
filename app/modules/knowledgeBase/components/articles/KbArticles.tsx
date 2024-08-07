import { Link } from "@remix-run/react";
import RightIcon from "~/components/ui/icons/RightIcon";
import clsx from "clsx";
import ColorHoverUtils from "~/utils/shared/colors/ColorHoverUtils";
import type { KnowledgeBaseDto } from "../../dtos/KnowledgeBaseDto";

export default function KbArticles({
  kb,
  items,
}: {
  kb: KnowledgeBaseDto;
  items: {
    order: number;
    title: string;
    description: string;
    href: string;
    sectionId: string | null;
  }[];
}) {
  return (
    <div className="rounded-md border border-border bg-background py-3">
      {items.map((item) => {
        return (
          <div key={item.title} className={clsx("group", ColorHoverUtils.getBorder500(kb.color))}>
            <Link to={item.href}>
              <div className="flex items-center justify-between space-x-2 px-6 py-3 hover:bg-secondary">
                <div className="">
                  <div className={clsx(" text-muted-foreground group-hover:text-foreground")}>{item.title}</div>
                </div>
                <RightIcon className={clsx("h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:text-foreground")} />
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
