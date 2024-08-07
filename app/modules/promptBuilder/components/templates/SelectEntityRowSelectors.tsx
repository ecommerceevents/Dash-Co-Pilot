import { useEffect, useState } from "react";
import InputSelector from "~/components/ui/input/InputSelector";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { RowAsJson } from "~/utils/helpers/TemplateApiHelper";

export default function SelectEntityRowSelectors({ rows, onChange }: { rows: RowAsJson[]; onChange: (row: RowAsJson) => void }) {
  const appOrAdminData = useAppOrAdminData();
  const [entityId, setEntityId] = useState<string | null>(null);
  const [entityRows, setEntityRows] = useState<RowAsJson[]>([]);
  const [row, setRow] = useState<RowAsJson | null>(null);

  useEffect(() => {
    const employeeEntity = appOrAdminData.entities.find((f) => f.name === "employee");
    if (employeeEntity) {
      setEntityId(employeeEntity.id);
    } else {
      const entityWithRows = rows.length > 0 ? rows[0].entityId : null;
      setEntityId(entityWithRows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appOrAdminData]);

  useEffect(() => {
    const entityRows = rows.filter((i) => i.entityId === entityId);
    if (entityRows.length > 0) {
      setRow(entityRows[0]);
    }
    setEntityRows(entityRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId]);

  useEffect(() => {
    if (row) {
      onChange(row);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row]);

  return (
    <div className="grid grid-cols-2 gap-2">
      <InputSelector
        title="Entity"
        value={entityId ?? ""}
        setValue={(id) => {
          setEntityId(id?.toString() ?? null);
        }}
        options={appOrAdminData.entities.map((f) => {
          return { name: f.name, value: f.id };
        })}
      />
      <InputSelector
        title="Row"
        disabled={!entityId}
        value={row?.id ?? ""}
        setValue={(id) => {
          const row = entityRows.find((r) => r.id === id);
          setRow(row ?? null);
        }}
        options={entityRows.map((f) => {
          return { name: f.name, value: f.id };
        })}
      />
    </div>
  );
}
