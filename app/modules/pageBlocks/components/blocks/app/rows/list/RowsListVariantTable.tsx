import { useTranslation } from "react-i18next";
import RowsViewRoute from "~/modules/rows/components/RowsViewRoute";
import { RowsListBlockDto } from "./RowsListBlockUtils";

export default function RowsListVariantTable({ item }: { item: RowsListBlockDto }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation();
  return (
    <>
      {item.data && (
        <RowsViewRoute
          key={item.data.entity.id}
          rowsData={item.data}
          items={item.data.items}
          saveCustomViews={false}
          routes={undefined}
          permissions={{
            create: false,
          }}
          currentSession={null}
        />
      )}
    </>
  );
}
