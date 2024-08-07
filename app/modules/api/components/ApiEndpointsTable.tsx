import InputSearch from "~/components/ui/input/InputSearch";
import { ApiEndpointDto } from "../dtos/ApiEndpointDto";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import ApiEndpoint from "./ApiEndpoint";

export default function ApiEndpointsTable({ items }: { items: ApiEndpointDto[] }) {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  function filteredItems() {
    return items.filter((f) => {
      return (
        f.route.toLowerCase().includes(searchInput.toLowerCase()) ||
        f.method.toLowerCase().includes(searchInput.toLowerCase()) ||
        f.description.toLowerCase().includes(searchInput.toLowerCase()) ||
        f.entity.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        f.entity.title.toLowerCase().includes(searchInput.toLowerCase()) ||
        f.entity.titlePlural.toLowerCase().includes(searchInput.toLowerCase()) ||
        t(f.entity.title).toLowerCase().includes(searchInput.toLowerCase()) ||
        t(f.entity.titlePlural).toLowerCase().includes(searchInput.toLowerCase())
      );
    });
  }
  return (
    <div className="space-y-2">
      <InputSearch value={searchInput} setValue={setSearchInput} />
      {filteredItems().length === 0 && (
        <EmptyState
          captions={{
            thereAreNo: "No API endpoints",
          }}
        />
      )}
      {filteredItems().map((endpoint, idx) => {
        return <ApiEndpoint key={idx} item={endpoint} />;
      })}
    </div>
  );
}
