import { useTypedActionData } from "remix-typedjson";
import { PricingBlockDto } from "./PricingBlockUtils";
import PricingVariantSimple from "./PricingVariantSimple";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function PricingBlock({ item }: { item: PricingBlockDto }) {
  const actionData = useTypedActionData<{ error?: string }>();
  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData?.error]);
  return <>{item.style === "simple" && <PricingVariantSimple item={item} />}</>;
}
