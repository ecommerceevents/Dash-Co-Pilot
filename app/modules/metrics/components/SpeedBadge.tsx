import { Fragment } from "react";
import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";

export default function SpeedBadge({ duration }: { duration: number }) {
  // Lightning fast: Green (e.g. #4CAF50), <10 ms
  // Fast: Light green (e.g. #8BC34A), 11 - 100 ms
  // Average: Yellow (e.g. #FFC107), 101 - 500 ms
  // Slow: Orange (e.g. #FF9800), 501 - 1000 ms
  // Very slow: Red (e.g. #F44336), >1000 ms
  return (
    <Fragment>
      {duration < 10 && <SimpleBadge title={`Lightning fast`} color={Colors.GREEN} />}
      {duration >= 10 && duration < 100 && <SimpleBadge title={`Fast`} color={Colors.TEAL} />}
      {duration >= 100 && duration < 500 && <SimpleBadge title={`Average`} color={Colors.YELLOW} />}
      {duration >= 500 && duration < 1000 && <SimpleBadge title={`Slow`} color={Colors.ORANGE} />}
      {duration >= 1000 && <SimpleBadge title={`Very slow`} color={Colors.RED} />}
    </Fragment>
  );
}
