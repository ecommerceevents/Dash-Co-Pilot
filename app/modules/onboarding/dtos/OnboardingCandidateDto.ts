import { UserSimple } from "~/utils/db/users.db.server";
import { OnboardingFilterDto } from "./OnboardingFilterDto";

export interface OnboardingCandidateDto {
  user: UserSimple;
  tenant: { id: string; name: string; slug: string } | null;
  matchingFilters: OnboardingFilterDto[];
}
