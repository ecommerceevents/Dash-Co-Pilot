import { Fragment, ReactNode, useEffect, useState } from "react";
import LinkOrAhref from "./LinkOrAhref";
import ButtonEvent from "./ButtonEvent";
import { useNavigation, useSearchParams, useSubmit } from "@remix-run/react";
import clsx from "clsx";

interface Props {
  type?: "button" | "submit";
  to?: string | undefined;
  submits?: { action: string; values: { [key: string]: string } };
  children: ReactNode;
  className?: string;
  target?: undefined | "_blank";
  role?: string;
  rel?: string;
  event?: {
    action: string;
    category: string;
    label: string;
    value: string;
  };
  onClick?: () => void;
  sendEvent?: boolean;
  disabled?: boolean;
}
export default function ButtonSubmitForm({ submits, type, to, target, children, className, role, rel, event, onClick, sendEvent = true, disabled }: Props) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const isLoading = navigation.state === "submitting" && navigation.formData?.get("action") === submits?.action;

  const [referral, setReferral] = useState<string | null>(null);

  useEffect(() => {
    if (!(typeof window === "undefined")) {
      try {
        // @ts-ignore
        window.rewardful("ready", () => {
          // @ts-ignore
          // eslint-disable-next-line no-console
          // console.log("Rewardful ready", window.Rewardful.referral);
          // @ts-ignore
          setReferral(window.Rewardful.referral);
        });
      } catch (e: any) {
        // eslint-disable-next-line no-console
        console.log("Rewardful not found", e);
      }
    }
  }, []);

  function onClicked() {
    if (!submits) {
      return;
    }
    const formData = new FormData();
    formData.append("action", submits.action ?? "");
    const values: { [key: string]: string } = submits?.values;
    for (const key in values) {
      formData.append(key, values[key]);
    }
    if (submits.action === "subscribe") {
      formData.set("coupon", searchParams.get("coupon")?.toString() ?? "");
      if (referral) {
        formData.set("referral", referral);
      }
    }
    submit(formData, {
      method: "post",
    });
  }
  return (
    <Fragment>
      {event ? (
        <ButtonEvent
          event={event}
          type={type}
          to={submits ? undefined : to}
          target={target}
          className={clsx(className, isLoading && "base-spinner")}
          role={role}
          rel={rel}
          onClick={onClicked}
          disabled={disabled}
        >
          {children}
        </ButtonEvent>
      ) : (
        <LinkOrAhref
          type={type}
          to={submits ? undefined : to}
          target={target}
          className={clsx(className, isLoading && "base-spinner")}
          role={role}
          rel={rel}
          onClick={onClicked}
          disabled={disabled}
        >
          {children}
        </LinkOrAhref>
      )}
    </Fragment>
  );
}
