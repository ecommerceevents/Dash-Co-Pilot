import { Fragment } from "react";
import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";

export default function ApiCallSpeedBadge({ duration }: { duration: number }) {
  return (
    <Fragment>
      {duration < 10 && <SimpleBadge title={`Lightning fast`} color={Colors.GREEN} />}
      {duration >= 10 && duration < 100 && <SimpleBadge title={`Fast`} color={Colors.TEAL} />}
      {duration >= 100 && duration < 1000 && <SimpleBadge title={`Average`} color={Colors.YELLOW} />}
      {duration >= 1000 && duration < 2000 && <SimpleBadge title={`Slow`} color={Colors.ORANGE} />}
      {duration >= 2000 && <SimpleBadge title={`Very slow`} color={Colors.RED} />}
    </Fragment>
  );
}
