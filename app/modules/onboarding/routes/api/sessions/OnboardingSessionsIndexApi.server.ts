import { ActionFunction, json, LoaderFunctionArgs } from "@remix-run/node";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { getTranslations } from "~/locale/i18next.server";
import { getOnboardings } from "~/modules/onboarding/db/onboarding.db.server";
import { deleteOnboardingSessionSteps } from "~/modules/onboarding/db/onboardingSessionSteps.db.server";
import { OnboardingFilterMetadataDto } from "~/modules/onboarding/dtos/OnboardingFilterMetadataDto";
import OnboardingService from "~/modules/onboarding/services/OnboardingService";
import { adminGetAllTenantsIdsAndNames } from "~/utils/db/tenants.db.server";
import { getUsersById } from "~/utils/db/users.db.server";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import {
  deleteOnboardingSession,
  getOnboardingSession,
  getOnboardingSessionsWithPagination,
  groupOnboardingSessionsByUser,
  OnboardingSessionWithDetails,
} from "../../../db/onboardingSessions.db.server";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";

export namespace OnboardingSessionsIndexApi {
  export type LoaderData = {
    meta: MetaTagsDto;
    items: OnboardingSessionWithDetails[];
    pagination: PaginationDto;
    filterableProperties: FilterablePropertyDto[];
    metadata: OnboardingFilterMetadataDto;
  };
  export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { t } = await getTranslations(request);
    const allOnboardings = await getOnboardings({});
    const usersInSessions = await groupOnboardingSessionsByUser();
    const users = await getUsersById(usersInSessions.map((x) => x.userId));
    const filterableProperties: FilterablePropertyDto[] = [
      {
        name: "onboardingId",
        title: t("onboarding.title"),
        options: [
          ...allOnboardings.map((i) => {
            return { value: i.id, name: i.title };
          }),
        ],
      },
      {
        name: "userId",
        title: t("models.user.object"),
        options: [
          ...users.map((i) => {
            return { value: i.id, name: i.email + " - " + i.firstName + " " + i.lastName };
          }),
        ],
      },
      {
        name: "tenantId",
        title: t("models.tenant.object"),
        options: [
          { name: "{Admin}", value: "null" },
          ...(await adminGetAllTenantsIdsAndNames()).map((i) => {
            return { value: i.id, name: i.name };
          }),
        ],
      },
    ];
    const filters = getFiltersFromCurrentUrl(request, filterableProperties);
    const urlSearchParams = new URL(request.url).searchParams;
    const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
    const tenantId = filters.properties.find((f) => f.name === "tenantId")?.value;
    const { items, pagination } = await getOnboardingSessionsWithPagination({
      pagination: currentPagination,
      where: {
        onboardingId: params.id,
        tenantId: tenantId === "null" ? null : tenantId ?? undefined,
      },
    });
    const data: LoaderData = {
      meta: [{ title: `${t("onboarding.title")} | ${process.env.APP_NAME}` }],
      items,
      pagination,
      filterableProperties,
      metadata: await OnboardingService.getMetadata(),
    };
    return json(data);
  };

  export type ActionData = {
    error?: string;
    success?: string;
  };
  export const action: ActionFunction = async ({ request, params }) => {
    const { t } = await getTranslations(request);
    const form = await request.formData();
    const action = form.get("action");
    if (action === "delete") {
      const id = form.get("id")?.toString() ?? "";
      if (!id) {
        return json({ error: "Session ID is required" }, { status: 400 });
      }
      const session = await getOnboardingSession(id);
      await deleteOnboardingSessionSteps(session!.sessionSteps.map((s) => s.id));
      await deleteOnboardingSession(id);
      return json({ success: "Onboarding session deleted" });
    } else {
      return json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  };
}
