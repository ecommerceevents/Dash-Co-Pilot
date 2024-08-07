import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CheckPlanFeatureLimit from "~/components/core/settings/subscription/CheckPlanFeatureLimit";
import Loading from "~/components/ui/loaders/Loading";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import RowForm from "../../../components/entities/rows/RowForm";
import { useTypedFetcher } from "remix-typedjson";

interface Props {
  url: string;
  parentEntity?: EntityWithDetails;
  onCreated?: (row: RowWithDetails) => void;
  allEntities: EntityWithDetails[];
  customSearchParams?: URLSearchParams;
  // onSelected: (entity: EntityWithDetails, item: RowWithDetails) => void;
}
export default function RowNewFetcher({ url, parentEntity, onCreated, allEntities, customSearchParams }: Props) {
  const { t } = useTranslation();
  const fetcher = useTypedFetcher<{
    newRow?: RowWithDetails;
    entityData?: EntitiesApi.GetEntityData;
    routes?: EntitiesApi.Routes;
    relationshipRows?: RowsApi.GetRelationshipRowsData;
  }>();
  // const actionData = useActionData<{ newRow?: RowWithDetails }>();

  // useEffect(() => {
  //   if (actionData?.newRow && onCreated) {
  //     onCreated(actionData.newRow);
  //   }
  // }, [actionData, onCreated]);

  const [data, setData] = useState<{
    newRow?: RowWithDetails;
    entityData?: EntitiesApi.GetEntityData;
    routes?: EntitiesApi.Routes;
    relationshipRows?: RowsApi.GetRelationshipRowsData;
  }>();

  useEffect(() => {
    if (data?.newRow && onCreated) {
      // console.log("added", data.newRow);
      onCreated(data.newRow);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    fetcher.load(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useEffect(() => {
    if (fetcher.data) {
      setData(fetcher.data);
    }
  }, [fetcher.data]);

  function onSubmit(formData: FormData) {
    fetcher.submit(formData, {
      action: url,
      method: "post",
    });
  }

  return (
    <div>
      {!fetcher.data ? (
        <Loading small loading />
      ) : !data?.entityData ? (
        <div>No data</div>
      ) : data ? (
        <CheckPlanFeatureLimit item={data.entityData.featureUsageEntity}>
          {data.routes && (
            <RowForm
              entity={data.entityData.entity}
              routes={data.routes}
              parentEntity={parentEntity}
              onSubmit={onSubmit}
              onCreatedRedirect={undefined}
              allEntities={allEntities}
              relationshipRows={data.relationshipRows}
              state={{
                loading: fetcher.state === "loading",
                submitting: fetcher.state === "submitting",
              }}
              customSearchParams={customSearchParams}
            />
          )}
        </CheckPlanFeatureLimit>
      ) : (
        <div>{t("shared.unknownError")}</div>
      )}
    </div>
  );
}
