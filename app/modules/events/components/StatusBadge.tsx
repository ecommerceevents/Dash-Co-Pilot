import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";

interface Props {
  startedAt: Date | null;
  finishedAt: Date | null;
  endpoint: string;
  status: number | null;
}
enum State {
  NotCatched = "Webhook not catched",
  Running = "Running",
  Info = "Info",
  Success = "Success",
  Redirect = "Redirected",
  ClientError = "Client error",
  ServerError = "Server error",
  Unknown = "Unknown",
}
export default function StatusBadge({ startedAt, finishedAt, endpoint, status }: Props) {
  function getState() {
    if (status === null && startedAt === null) {
      return State.NotCatched;
    } else if (status === null && startedAt !== null && finishedAt === null) {
      return State.Running;
    } else if (status !== null && finishedAt !== null) {
      if (status >= 200 && status < 300) {
        return `[${status}] ${State.Success}`;
      } else if (status >= 300 && status < 400) {
        return `[${status}] ${State.Redirect}`;
      } else if (status >= 400 && status < 500) {
        return `[${status}] ${State.ClientError}`;
      } else if (status >= 500) {
        return `[${status}] ${State.ServerError}`;
      } else {
        return `[${status}] ${State.Unknown}`;
      }
    } else {
      return State.Unknown;
    }
  }
  function getColor() {
    if (status === null) {
      return Colors.YELLOW;
    } else if (status >= 200 && status < 300) {
      return Colors.GREEN;
    } else if (status >= 300 && status < 400) {
      return Colors.ORANGE;
    } else if (status >= 400 && status < 500) {
      return Colors.RED;
    } else {
      return Colors.UNDEFINED;
    }
  }
  return (
    <div title={endpoint}>
      <SimpleBadge title={getState()} color={getColor()} />
    </div>
  );
}
