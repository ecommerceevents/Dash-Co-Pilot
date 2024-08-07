import { Rows_Tags } from "../routes/Rows_Tags.server";
import RowSettingsTags from "~/components/entities/rows/RowSettingsTags";
import { useTypedLoaderData } from "remix-typedjson";

export default function RowTagsRoute() {
  const data = useTypedLoaderData<Rows_Tags.LoaderData>();
  return <RowSettingsTags item={data.rowData.item} tags={data.tags} />;
}
