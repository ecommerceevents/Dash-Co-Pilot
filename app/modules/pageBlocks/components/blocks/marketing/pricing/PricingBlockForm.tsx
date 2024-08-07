import { useEffect, useState } from "react";
import InputGroup from "~/components/ui/forms/InputGroup";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import InputRadioGroup from "~/components/ui/input/InputRadioGroup";
import { defaultPricingBlock, PricingBlockDto, PricingBlockStyle, PricingBlockStyles } from "./PricingBlockUtils";

export default function PricingBlockForm({ item, onUpdate }: { item?: PricingBlockDto; onUpdate: (item: PricingBlockDto) => void }) {
  const [state, setState] = useState<PricingBlockDto>(item || defaultPricingBlock);
  useEffect(() => {
    onUpdate(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  return (
    <div className="space-y-4">
      <InputGroup title="Design">
        <InputRadioGroup
          title="Style"
          value={state.style}
          setValue={(value) => setState({ ...state, style: value as PricingBlockStyle })}
          options={PricingBlockStyles.map((f) => f)}
        />
      </InputGroup>

      <InputGroup title="Details">
        <div className="space-y-2">
          <InputCheckboxWithDescription
            name="allowCoupons"
            title="Allow coupons"
            value={state.allowCoupons}
            setValue={(e) => setState({ ...state, allowCoupons: Boolean(e) })}
            description="Allow customers to enter a coupon code."
          />
        </div>
      </InputGroup>
    </div>
  );
}
