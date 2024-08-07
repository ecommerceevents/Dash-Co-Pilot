import { useTranslation } from "react-i18next";
import { TemplateBlockDto } from "./TemplateBlockUtils";

export default function TemplateVariant1Block({ item }: { item: TemplateBlockDto }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation();
  return <div>TEMPLATE VARIANT 1 BLOCK</div>;
}
