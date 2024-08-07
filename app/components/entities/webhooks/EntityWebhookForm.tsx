import { EntityWebhook } from "@prisma/client";
import { useState } from "react";
import { DefaultLogActions } from "~/application/dtos/shared/DefaultLogActions";
import FormGroup from "~/components/ui/forms/FormGroup";
import InputSelect from "~/components/ui/input/InputSelect";
import InputText from "~/components/ui/input/InputText";

interface Props {
  item?: EntityWebhook;
}

export default function EntityWebhookForm({ item }: Props) {
  const [action, setAction] = useState<string>(item?.action ?? "Created");
  const [method, setMethod] = useState<string>(item?.method ?? "POST");
  const [endpoint, setEndpoint] = useState<string>(item?.endpoint ?? "");

  return (
    <FormGroup id={item?.id} editing={true}>
      {/* <input type="hidden" name="order" value={order} hidden readOnly /> */}
      <InputSelect
        name="webhook-action"
        title="Action"
        value={action}
        setValue={(e) => setAction(e?.toString() ?? "")}
        options={[
          {
            name: DefaultLogActions.Created,
            value: DefaultLogActions.Created,
          },
          {
            name: DefaultLogActions.Updated,
            value: DefaultLogActions.Updated,
          },
          {
            name: DefaultLogActions.Deleted,
            value: DefaultLogActions.Deleted,
          },
        ]}
        required
      />
      <InputSelect
        name="webhook-method"
        title="Method"
        value={method}
        setValue={(e) => setMethod(e?.toString() ?? "")}
        options={[
          {
            name: "POST",
            value: "POST",
          },
          {
            name: "GET",
            value: "GET",
            disabled: true,
          },
        ]}
        required
      />
      <InputText name="webhook-endpoint" title="Endpoint" value={endpoint} setValue={setEndpoint} required />
    </FormGroup>
  );
}
