import { RowsOverviewBlockDto } from "./RowsOverviewBlockUtils";
import RowsOverviewVariantForm from "./RowsOverviewVariantForm";

export default function RowsOverviewBlock({ item }: { item: RowsOverviewBlockDto }) {
  return <>{item.style === "form" && <RowsOverviewVariantForm item={item} />}</>;
}
