import { useState } from "react";
import { useTranslation } from "react-i18next";
import FormGroup from "~/components/ui/forms/FormGroup";
import InputSelect from "~/components/ui/input/InputSelect";
import InputText from "~/components/ui/input/InputText";
import { useRootData } from "~/utils/data/useRootData";
import { EmailSenderWithoutApiKey } from "~/modules/emailMarketing/db/emailSender";

interface Props {
  item?: EmailSenderWithoutApiKey;
}

export default function EmailSenderForm({ item }: Props) {
  const { t } = useTranslation();
  const rootData = useRootData();
  const [provider, setProvider] = useState<string>(item?.provider ?? "postmark");
  const [stream, setStream] = useState<string>(item?.stream ?? "broadcast");
  const [apiKey, setApiKey] = useState<string>("*******************");
  const [fromEmail, setFromEmail] = useState<string>(item?.fromEmail ?? "marketing@" + rootData.appConfiguration.app.domain);
  // const [fromName, setFromName] = useState<string>(item?.fromName ?? "");
  // const [replyToEmail, setReplyToEmail] = useState<string>(item?.replyToEmail ?? "");

  return (
    <FormGroup id={item?.id} editing={true}>
      {/* <input type="hidden" name="order" value={order} hidden readOnly /> */}
      <InputSelect
        name="provider"
        title={t("emailMarketing.senders.provider")}
        value={provider}
        setValue={(e) => setProvider(e?.toString() ?? "")}
        options={[
          {
            name: "Postmark",
            value: "postmark",
          },
        ]}
        required
      />
      <InputText name="stream" title={t("emailMarketing.senders.stream") + " ID"} value={stream} setValue={setStream} required />
      <InputText type="password" name="apiKey" title={t("emailMarketing.senders.apiKey")} value={apiKey} setValue={setApiKey} required disabled={!!item} />
      <InputText name="fromEmail" title={t("emailMarketing.senders.fromEmail")} value={fromEmail} setValue={setFromEmail} required />
      {/* <InputText name="fromName" title={t("emailMarketing.senders.fromName")} value={fromName} setValue={setFromName} />
      <InputText name="replyToEmail" title={t("emailMarketing.senders.replyToEmail")} value={replyToEmail} setValue={setReplyToEmail} /> */}
    </FormGroup>
  );
}
