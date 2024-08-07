import { useEffect, useRef, useState } from "react";
import InfoBanner from "~/components/ui/banners/InfoBanner";
import FormGroup from "~/components/ui/forms/FormGroup";
import InputText, { RefInputText } from "~/components/ui/input/InputText";

interface Props {
  item?: { id: string; name: string; value: string };
}

export default function WorkflowCredentialForm({ item }: Props) {
  const [name, setName] = useState<string>(item?.name || "");
  const [value, setValue] = useState<string>("");

  const mainInput = useRef<RefInputText>(null);
  useEffect(() => {
    setTimeout(() => {
      mainInput.current?.input.current?.focus();
    }, 100);
  }, []);

  function isValidName(name: string) {
    // Regular expression for lowercase alphanumeric with dashes
    const regex = /^[a-zA-Z0-9-_]+$/;

    // Test the variable name against the regular expression
    return regex.test(name);
  }

  return (
    <FormGroup id={item?.id} editing={true} submitDisabled={!name || !value || !isValidName(name)}>
      <InputText
        ref={item ? null : mainInput}
        name="credential-name"
        title="Name"
        value={name}
        setValue={setName}
        required
        disabled={!!item?.id}
        placeholder="i.e. apiKey, API_KEY, api-key"
        autoComplete="off"
      />
      {name && !isValidName(name) && (
        <div className="text-sm text-red-600">
          <p>Invalid variable name. Don't use spaces or special characters.</p>
        </div>
      )}
      <InputText
        type="password"
        ref={item ? mainInput : null}
        name="credential-value"
        title="Value"
        value={value}
        setValue={setValue}
        required
        autoComplete="off"
      />
      <InfoBanner title="Security Assurance">
        <div>
          Your connection string credentials are securely encrypted in our system and only decrypted when necessary for data operations. We are committed to the
          security and confidentiality of your information.{" "}
          <a href="https://gist.github.com/AlexandroMtzG/9e0ebd0751f49e3f6d8b1eac3651195b" className="underline" target="_blank" rel="noreferrer">
            Click here to view our encryption/decryption process in the code.
          </a>
          .
        </div>
      </InfoBanner>
    </FormGroup>
  );
}
