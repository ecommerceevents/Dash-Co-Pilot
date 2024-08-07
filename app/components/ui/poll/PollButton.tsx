import { useNavigation, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import clsx from "clsx";

interface Props {
  status: string;
  statusToPoll: string;
  intervalInSeconds?: number;
  className?: string;
}
export default function PollButton({ status, statusToPoll, intervalInSeconds = 10, className }: Props) {
  const navigation = useNavigation();
  const submit = useSubmit();

  const [countdown, setCountdown] = useState(intervalInSeconds);

  useEffect(() => {
    let countdownIntervalId: NodeJS.Timeout;
    let refreshIntervalId: NodeJS.Timeout;

    if (status === statusToPoll) {
      setCountdown(intervalInSeconds);
      countdownIntervalId = setInterval(() => {
        setCountdown((currentCountdown) => (currentCountdown > 1 ? currentCountdown - 1 : intervalInSeconds));
      }, 1000);

      refreshIntervalId = setInterval(() => {
        submit(null, {
          method: "get",
        });
      }, intervalInSeconds * 1000);
    }

    return () => {
      if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
      }
      if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
      }
    };
  }, [intervalInSeconds, status, statusToPoll, submit]);

  return (
    <div>
      <button
        type="button"
        className={clsx("underline", className)}
        onClick={() => {
          submit(null, {
            method: "get",
          });
          setCountdown(intervalInSeconds);
        }}
      >
        {navigation.state !== "idle" ? "Refreshing..." : <span>Refreshing in {countdown}...</span>}
      </button>
    </div>
  );
}
