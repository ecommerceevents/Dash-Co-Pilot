import RowOverviewRoute from "~/modules/rows/components/RowOverviewRoute";
import { RowsOverviewBlockDto } from "./RowsOverviewBlockUtils";

export default function RowsOverviewVariantForm({ item }: { item: RowsOverviewBlockDto }) {
  // const actionData = useActionData<{ saveAndAdd?: boolean; newRow?: RowWithDetails }>();
  return (
    <>
      {item.data && (
        <RowOverviewRoute
          rowData={item.data.rowData}
          item={item.data.rowData.item}
          // routes={item.data.routes}
          relationshipRows={item.data.relationshipRows}
          options={{
            hideTitle: true,
          }}
        />
      )}
    </>
  );
}
