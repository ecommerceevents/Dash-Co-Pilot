import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import RowSelectedOptionCell from "../rows/cells/RowSelectedOptionCell";
import { SelectOptionsDisplay } from "~/utils/shared/SelectOptionsUtils";

interface Props {
  entity: EntityWithDetails;
  property: string;
  value: string;
  display: SelectOptionsDisplay;
}
export default function PropertyOptionValueBadge({ entity, property, value, display }: Props) {
  return <RowSelectedOptionCell value={value} options={entity.properties.find((f) => f.name === property)?.options ?? []} display={display} />;
}
