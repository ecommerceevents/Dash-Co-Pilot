import { useTypedLoaderData } from "remix-typedjson";
import KbHeader from "../../components/KbHeader";
import KbCategory from "../../components/categories/KbCategory";
import { KbRoutesCategoryApi } from "../api/KbRoutes.Category.Api";

export default function KbRoutesCategoryView() {
  const data = useTypedLoaderData<KbRoutesCategoryApi.LoaderData>();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <KbHeader kb={data.kb} withTitleAndDescription={false} />
      <div className="mx-auto min-h-screen max-w-5xl px-8 py-8">
        <div className="space-y-5">{!data.item ? <div>Not found</div> : <KbCategory kb={data.kb} item={data.item} allCategories={data.allCategories} />}</div>
      </div>
    </div>
  );
}
