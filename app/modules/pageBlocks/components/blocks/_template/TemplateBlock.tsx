import { TemplateBlockDto } from "./TemplateBlockUtils";
import TemplateVariant1Block from "./TemplateVariant1Block";
import TemplateVariant2Block from "./TemplateVariant2Block";

export default function TemplateBlock({ item }: { item: TemplateBlockDto }) {
  return (
    <>
      {item.style === "variant1" && <TemplateVariant1Block item={item} />}
      {item.style === "variant2" && <TemplateVariant2Block item={item} />}
    </>
  );
}
