import { useMatches } from "@remix-run/react";

export function useTitleData(): string {
  try {
    const titles = useMatches()
      .map((match) => match.data)
      .filter((data: any) => Boolean(data.title) || Boolean(data.meta?.title))
      .map((data: any) => data.title ?? data.meta?.title);
    if (!titles || titles.length === 0) {
      return "";
    }
    return titles[titles.length - 1].split("|")[0].trim() ?? "";
  } catch {
    return "";
  }
}
