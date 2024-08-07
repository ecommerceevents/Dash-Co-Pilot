import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";

interface Props {
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  status: "pending" | "running" | "success" | "error" | string;
  error: string | null;
}
enum State {
  Pending = "Pending",
  Running = "Running",
  Success = "Success",
  Error = "Error",
  Unknown = "Unknown",
}
export default function PromptResultBadge({ startedAt, completedAt, status, error }: Props) {
  function getState() {
    if (status === "pending") {
      return State.Pending;
    } else if (status === null && startedAt === null) {
      return State.Unknown;
    } else if (status === "running" && startedAt !== null && completedAt === null) {
      return State.Running;
    } else if (status !== null) {
      if (status === "success") {
        return State.Success;
      } else if (status === "error") {
        return State.Error;
      } else {
        return State.Unknown;
      }
    } else {
      return State.Unknown;
    }
  }
  function getColor() {
    if (!status || status === "pending") {
      return Colors.YELLOW;
    } else if (status === "running") {
      return Colors.BLUE;
    } else if (status === "success") {
      return Colors.GREEN;
    } else if (status === "error") {
      return Colors.RED;
    } else {
      return Colors.UNDEFINED;
    }
  }
  return (
    <div>
      <SimpleBadge title={getState()} color={getColor()} />
    </div>
  );
}
