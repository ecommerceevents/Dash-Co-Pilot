import { useParams, useSubmit, Form, Link, useActionData } from "@remix-run/react";
import { useState, useEffect, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import InputGroup from "~/components/ui/forms/InputGroup";
import InputSelector from "~/components/ui/input/InputSelector";
import InputText from "~/components/ui/input/InputText";
import { EntityViewsApi } from "~/utils/api/.server/EntityViewsApi";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { Campaigns_New } from "../../routes/Campaigns_New";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { useTypedLoaderData } from "remix-typedjson";
import toast from "react-hot-toast";
import InputContent from "~/components/ui/input/InputContent";

export default function CampaignsNewRoute() {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const data = useTypedLoaderData<Campaigns_New.LoaderData>();
  const actionData = useActionData<Campaigns_New.ActionData>();
  const params = useParams();

  const submit = useSubmit();

  const [name, setName] = useState("Campaign");
  const [subject, setSubject] = useState("Subject");
  const [senderId, setSenderId] = useState<string | number | undefined>(data.emailSenders.length > 0 ? data.emailSenders[0].id : "");
  const [contentType, setContentType] = useState<"wysiwyg" | "markdown">("wysiwyg");
  const [htmlBody, setHtmlBody] = useState(defaultHtmlBody);
  // const [track, setTrack] = useState(true);

  const [selectedContactsViewId, setSelectedContactsViewId] = useState<string>(data.contactsViews.length > 0 ? data.contactsViews[0].view?.id ?? "" : "");
  const [, setSelectedContactsView] = useState<EntityViewsApi.GetEntityViewsWithRows>();

  // const [sender, setSender] = useState<EmailSenderWithoutApiKey>();
  // useEffect(() => {
  //   const sender = data.emailSenders.find((s) => s.fromEmail === senderId);
  //   if (!sender || sender.provider !== "postmark") {
  //     setTrack(false);
  //   }
  //   setSender(sender);
  // }, [data.emailSenders, senderId]);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  useEffect(() => {
    setSelectedContactsView(data.contactsViews.find((v) => v.view?.id === selectedContactsViewId));
  }, [data.contactsViews, selectedContactsViewId]);
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.stopPropagation();
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    submit(formData, {
      method: "post",
    });
  }

  function sendTest(i?: RowWithDetails) {
    const email = window.prompt("Email", appOrAdminData.user?.email);
    if (!email || email.trim() === "") {
      return;
    }
    const form = new FormData();
    form.set("action", i ? "send-contact-preview" : "send-preview");
    form.set("senderId", senderId?.toString() ?? "");
    form.set("contactRowId", i?.id.toString() ?? "");
    form.set("email", email);
    form.set("subject", subject);
    form.set("htmlBody", htmlBody);
    form.set("textBody", "");
    submit(form, {
      method: "post",
    });
  }

  return (
    <EditPageLayout
      title={t("emailMarketing.newCampaign")}
      menu={[
        {
          title: t("emailMarketing.campaigns"),
          routePath: params.tenant ? `/app/${params.tenant}/email-marketing/campaigns` : "/admin/email-marketing/campaigns",
        },
        { title: t("shared.new") },
      ]}
    >
      <Form onSubmit={handleSubmit} className="pb-10">
        <input type="hidden" name="action" value="create" hidden readOnly />

        <div className="relative space-y-4">
          <div className="sticky left-0 right-0 top-0 z-10">
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4">
              <div className="space-y-2 lg:flex lg:justify-between lg:space-x-2 lg:space-y-0">
                <div className="flex-grow">
                  <InputText name="name" title={t("shared.name")} value={name} setValue={setName} withLabel={false} placeholder="Broadcast name..." required />
                </div>
                <div className="flex justify-between space-x-2">
                  <ButtonSecondary onClick={() => sendTest()}>{t("emailMarketing.sendPreview")}</ButtonSecondary>
                  <ButtonPrimary type="submit">{t("emailMarketing.saveDraft")}</ButtonPrimary>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <div className="">
              <InputGroup title="Email">
                <div className="grid gap-2 sm:grid-cols-2">
                  <InputSelector
                    name="senderId"
                    title={t("emails.sender")}
                    value={senderId}
                    setValue={setSenderId}
                    withSearch={false}
                    hint={
                      data.emailSenders.length === 0 ? (
                        <>
                          <Link to={params.tenant ? `/app/${params.tenant}/email-marketing/senders` : `/admin/email-marketing/senders`}>
                            <span className="text-xs hover:underline">Manage senders</span>
                          </Link>
                        </>
                      ) : null
                    }
                    options={data.emailSenders.map((s) => {
                      return {
                        name: s.fromEmail,
                        value: s.id,
                      };
                    })}
                    required
                  />
                  <InputSelector
                    required
                    name="contactViewId"
                    title={t("emails.recipientList")}
                    value={selectedContactsViewId}
                    setValue={(e) => setSelectedContactsViewId(e?.toString() ?? "")}
                    options={data.contactsViews.map((v) => {
                      return {
                        value: v.view?.id,
                        name: (v.view ? t(v.view.title) : "Default") + " (" + v.rowsCount + ")",
                      };
                    })}
                  />
                  <div className="sm:col-span-2">
                    <InputText name="subject" title={t("emails.subject")} value={subject} setValue={setSubject} required placeholder="Subject..." />
                  </div>

                  {/* <InputCheckboxWithDescription
                    name="trackOpens"
                    title="Track email"
                    description={
                      <div>
                        Track email delivery, opens and clicks{" "}
                        <span className="text-xs italic text-gray-500">
                          (
                          <a href="https://account.postmarkapp.com/servers" target="_blank" rel="noreferrer" className="underline">
                            you need a postmark webhook on your server message stream
                          </a>
                          )
                        </span>
                        .
                      </div>
                    }
                    value={track}
                    setValue={setTrack}
                    disabled={sender?.provider !== "postmark"}
                  /> */}
                  {/* <div className="space-y-2 truncate">
                    <label className="flex justify-between space-x-2 text-xs font-medium text-gray-600">Contact variables</label>
                    <div className="flex space-x-1 overflow-x-auto rounded-md border border-dashed border-gray-300 bg-gray-50 p-2 text-sm text-gray-500">
                      <div className="select-all">{"{{email}}"}</div>
                      <div>•</div>
                      <div className="select-all">{"{{products}}"}</div>
                    </div>
                  </div> */}

                  <div className="sm:col-span-2">
                    {/* <input type="hidden" name="htmlBody" value={htmlBody} hidden readOnly /> */}
                    <InputContent name="htmlBody" value={htmlBody} onChangeValue={setHtmlBody} contentType={contentType} onChangeContentType={setContentType} />
                  </div>
                  {/* <InputText
                    name="htmlBody"
                    title="HTML"
                    editor="monaco"
                    editorTheme="light"
                    editorLanguage="html"
                    value={htmlBody}
                    setValue={setHtmlBody}
                    editorSize="lg"
                    required
                  /> */}
                </div>
              </InputGroup>
            </div>
          </div>
        </div>
      </Form>
    </EditPageLayout>
  );
}

const defaultHtmlBody = `<p>This is a test email.</p>
<p>
  And <strong>bold</strong>, <em>italics</em>, and even <em>italics and later </em><strong><em>bold</em></strong
  >. Even <s>strikethrough</s>.
  <a
    target="_blank"
    rel="noopener noreferrer"
    class="underline text-blue-500"
    href="https://saasrock.com"
    >A link</a
  >.
</p>
<p>-</p>
<p>The end</p>
<p>
  <a
    target="_blank"
    rel="noopener noreferrer"
    class="underline text-blue-500"
    href="{{{ pm:unsubscribe }}}"
    >Custom unsubscribe link</a
  >
</p>
`;
