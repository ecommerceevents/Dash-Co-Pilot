import { ReactNode } from "react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { DashboardTableOfContents } from "./toc";
import clsx from "clsx";

export type PreviewComponentProps = {
  title: string;
  description: string;
  variants:
    | {
        id: string;
        title: string;
        component: ReactNode;
        code?: string;
        description?: string;
      }[]
    | {
        id: string;
        title: string;
        iframe: string;
        code?: string;
        description?: string;
      }[];
  className?: string;
  withToc?: boolean;
  overflow?: "hidden" | "visible";
};
export default function PreviewComponent({ title, description, variants, className, withToc = true, overflow = "hidden" }: PreviewComponentProps) {
  return (
    <main className={clsx("relative pb-6 lg:gap-10 lg:pb-8", withToc && "xl:grid xl:grid-cols-[1fr_150px]")}>
      <div className="space-y-8 overflow-hidden">
        <div>
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1 text-lg">{description}</p>
        </div>
        {variants.map((variant, index) => (
          <div key={index} className="space-y-2">
            <div className="space-y-1">
              <h3 id={variant.id} className="text-xl font-bold tracking-tight">
                {variant.title}
              </h3>
              <p className="text-muted-foreground text-sm">{variant.description}</p>
            </div>
            <div
              className={clsx(
                "border-muted-foreground flex justify-center rounded-lg border-2 border-dashed",
                className,
                overflow === "hidden" ? "overflow-hidden" : "overflow-visible",
                "component" in variant && "p-6"
              )}
            >
              {"iframe" in variant ? <iframe src={variant.iframe} title={title} className="h-96 w-full border-0" /> : variant.component}
            </div>
          </div>
        ))}
      </div>
      {withToc && (
        <div className="hidden text-sm xl:block">
          <div className="sticky top-16 pt-4">
            <ScrollArea className="pb-10">
              <div className="sticky top-16 -mt-10 h-[calc(100vh-3.5rem)] py-12">
                <DashboardTableOfContents
                  // title={`${title} - Variants`}
                  title="On this page"
                  toc={{
                    items: variants
                      .map((f) => f)
                      .map((item) => ({
                        title: item.title,
                        url: `#${item.id}`,
                      })),
                  }}
                />
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </main>
  );
}
