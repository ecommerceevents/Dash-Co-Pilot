import { ActionFunction, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useActionData, useLocation, useNavigation, useSearchParams, useSubmit } from "@remix-run/react";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import DateCell from "~/components/ui/dates/DateCell";
import ExternalLinkEmptyIcon from "~/components/ui/icons/ExternalLinkEmptyIcon";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import TableSimple from "~/components/ui/tables/TableSimple";
import { getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import FakeProjectOverview from "~/modules/fake/fakeProjectsCrud/components/FakeProjectOverview";
import { Colors } from "~/application/enums/shared/Colors";
import { FakeProjectDto } from "~/modules/fake/fakeProjectsCrud/dtos/FakeProjectDto";
import { FakeProjectService } from "~/modules/fake/fakeProjectsCrud/services/FakeCrudService";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useTypedLoaderData } from "remix-typedjson";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];

type LoaderData = {
  items: FakeProjectDto[];
  pagination: PaginationDto;
  overviewItem?: FakeProjectDto | null;
  metatags: MetaTagsDto;
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const { items, pagination } = await FakeProjectService.getAll({
    filters: {
      name: urlSearchParams.get("name")?.toString(),
    },
    pagination: {
      page: currentPagination.page,
      pageSize: currentPagination.pageSize,
    },
  });
  const data: LoaderData = {
    items,
    pagination,
    metatags: [{ title: "Fake Projects" }],
  };
  const id = urlSearchParams.get("id") ?? "";
  if (id) {
    data.overviewItem = await FakeProjectService.get(id);
  }
  return json(data);
};

type ActionData = {
  success?: string;
  error?: string;
};
export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "complete-task") {
    try {
      const projectId = form.get("project-id")?.toString() ?? "";
      const taskId = form.get("task-id")?.toString() ?? "";
      // randomize success or error
      if (Math.random() > 0.5) {
        throw Error("Could not complete task: Example error (try again)");
      }
      await FakeProjectService.completeTask(projectId, taskId);
      return json({ success: "Task completed" });
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else {
    return json({ error: "Invalid action" }, { status: 400 });
  }
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const location = useLocation();
  const submit = useSubmit();
  const [searchParams, setSearchParams] = useSearchParams();

  const [overviewItem, setOverviewItem] = useState<FakeProjectDto>();

  useEffect(() => {
    setOverviewItem(data.overviewItem ?? undefined);
  }, [data.overviewItem]);

  return (
    <IndexPageLayout
      title="Fake Projects"
      buttons={
        <>
          <ButtonSecondary to="." disabled={navigation.state !== "idle"}>
            {t("shared.reload")}
          </ButtonSecondary>
          <ButtonPrimary to="new" disabled={navigation.state !== "idle"}>
            {t("shared.new")}
          </ButtonPrimary>
        </>
      }
    >
      <TableSimple
        items={data.items}
        pagination={data.pagination}
        actions={[
          {
            title: t("shared.overview"),
            onClick: (_, item) => {
              searchParams.set("id", item.id);
              setSearchParams(searchParams);
            },
          },
          {
            title: t("shared.edit"),
            onClickRoute: (_, item) => `${item.id}`,
          },
        ]}
        headers={[
          {
            name: "name",
            title: "Name",
            className: "w-full",
            value: (item) => (
              <div className="max-w-sm truncate">
                <Link to={`${item.id}`} className="hover:underline">
                  <div className="flex flex-col truncate">
                    <div className="truncate">{item.name}</div>
                    <div className="truncate text-xs text-gray-500">{item.description}</div>
                  </div>
                </Link>
              </div>
            ),
          },
          {
            name: "active",
            title: "Active",
            value: (item) => (item.active ? <SimpleBadge title="Active" color={Colors.GREEN} /> : <SimpleBadge title="Archived" color={Colors.GRAY} />),
          },
          {
            name: "tasks",
            title: "Tasks",
            value: (item) => (
              <div>
                {item.tasks.filter((f) => f.completed).length}/{item.tasks.length} completed
              </div>
            ),
          },
          {
            name: "date",
            title: "Created at",
            value: (item) => <DateCell displays={["ymd"]} date={item.createdAt} />,
          },
        ]}
      />
      <SlideOverWideEmpty
        title={"Fake Projects"}
        open={!!searchParams.get("id")?.toString()}
        onClose={() => {
          searchParams.delete("id");
          setSearchParams(searchParams);
          setTimeout(() => {
            setOverviewItem(undefined);
          }, 100);
        }}
        className="sm:max-w-sm"
        buttons={
          <>
            <Link
              to={`${overviewItem?.id}`}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <span className="sr-only">Close panel</span>
              <ExternalLinkEmptyIcon className="h-6 w-6" aria-hidden="true" />
            </Link>
          </>
        }
      >
        {!overviewItem ? (
          <div>{t("shared.loading")}...</div>
        ) : (
          <FakeProjectOverview
            item={overviewItem}
            actionData={actionData}
            onCompleteTask={(s) => {
              const form = new FormData();
              form.append("action", "complete-task");
              form.append("project-id", overviewItem?.id ?? "");
              form.append("task-id", s.id);
              searchParams.delete("index");
              const actionUrl = location.pathname + "?index&" + searchParams;
              submit(form, {
                method: "post",
                action: actionUrl,
              });
            }}
          />
        )}
      </SlideOverWideEmpty>
    </IndexPageLayout>
  );
}
