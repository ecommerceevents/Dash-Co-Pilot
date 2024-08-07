import { Fragment } from "react";
import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import { ApiKeyLogDto } from "../dtos/ApiKeyLogDto";

export default function ApiCallStatusBadge({ item, underline }: { item: ApiKeyLogDto; underline?: boolean }) {
  const title = item.status?.toString() ?? "?";
  const color =
    item.status === null
      ? Colors.YELLOW
      : item.status >= 200 && item.status < 300
      ? Colors.GREEN
      : item.status >= 300 && item.status < 400
      ? Colors.ORANGE
      : item.status >= 400
      ? Colors.RED
      : Colors.UNDEFINED;
  return (
    <Fragment>
      <SimpleBadge title={title} color={color} underline={underline} />
    </Fragment>
  );
}
