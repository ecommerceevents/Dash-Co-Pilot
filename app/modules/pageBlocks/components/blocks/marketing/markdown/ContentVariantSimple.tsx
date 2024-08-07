import { useTranslation } from "react-i18next";
import { ContentBlockDto } from "./ContentBlockUtils";
import { marked } from "marked";

export default function ContentVariantSimple({ item }: { item: ContentBlockDto }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation();
  return (
    <div className="prose dark:prose-invert">
      {!item.content ? <div className="text-muted-foreground">No content</div> : <div dangerouslySetInnerHTML={{ __html: marked(item.content) }} />}
    </div>
  );
}
