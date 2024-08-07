import { TestimonialsBlockDto } from "~/modules/pageBlocks/components/blocks/marketing/testimonials/TestimonialsBlockUtils";
import TestimonialsVariantSimple from "./TestimonialsVariantSimple";

export default function TestimonialsBlock({ item }: { item: TestimonialsBlockDto }) {
  return <>{item.style === "simple" && <TestimonialsVariantSimple item={item} />}</>;
}
