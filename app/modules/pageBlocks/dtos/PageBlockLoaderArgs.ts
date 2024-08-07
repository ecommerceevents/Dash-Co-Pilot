import { Params } from "@remix-run/react";
import { TFunction } from "i18next";
import { PageBlockDto } from "./PageBlockDto";

export interface PageBlockLoaderArgs {
  request: Request;
  params: Params;
  t: TFunction;
  block: PageBlockDto;
}
