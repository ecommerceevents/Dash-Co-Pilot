import { Params } from "@remix-run/react";
import { TFunction } from "i18next";

export interface PageBlockActionArgs {
  request: Request;
  params: Params;
  t: TFunction;
  form: FormData;
}
