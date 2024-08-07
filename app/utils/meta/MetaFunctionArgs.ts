import type { SerializeFrom } from "@remix-run/node";
export type MetaFunctionArgs<T> = { data: SerializeFrom<T> };
