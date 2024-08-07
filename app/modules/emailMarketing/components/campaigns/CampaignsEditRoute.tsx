import { useParams, useSubmit, Form, useActionData, useNavigation } from "@remix-run/react";
import clsx from "clsx";
import { useState, useRef, useEffect, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { Colors } from "~/application/enums/shared/Colors";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import InputSearch from "~/components/ui/input/InputSearch";
import InputSelector from "~/components/ui/input/InputSelector";
import InputText from "~/components/ui/input/InputText";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { Campaigns_Edit } from "../../routes/Campaigns_Edit";
import OutboundEmailsTable from "../OutboundEmailsTable";
import toast from "react-hot-toast";
import InputContent from "~/components/ui/input/InputContent";

export default function CampaignsEditRoute() {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const params = useParams();
  const data = useTypedLoaderData<Campaigns_Edit.LoaderData>();
  const actionData = useActionData<Campaigns_Edit.ActionData>();
  const navigation = useNavigation();

  const submit = useSubmit();

  const confirmDelete = useRef<RefConfirmModal>(null);

  const [searchInput, setSearchInput] = useState("");
  const [maxDisplayedEmails, setMaxDisplayedEmails] = useState(1000000);

  const [name, setName] = useState(data.item.name);
  const [subject, setSubject] = useState(data.item.subject);
  const [senderId, setSenderId] = useState<string | number | undefined>(data.item.emailSenderId);
  const [contentType, setContentType] = useState<"wysiwyg" | "markdown">("wysiwyg");
  const [htmlBody, setHtmlBody] = useState(data.item.htmlBody);

  const modalConfirm = useRef<RefConfirmModal>(null);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

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
    form.set("action", "send-preview");
    form.set("email", email);
    submit(form, {
      method: "post",
    });
  }

  function send() {
    modalConfirm.current?.show(
      t("emailMarketing.confirmSend"),
      t("shared.send"),
      t("shared.back"),
      t("emailMarketing.sendingToContacts", { 0: data.item.recipients.length })
    );
  }

  function onConfirmSend() {
    const form = new FormData();
    form.set("action", "send");
    submit(form, {
      method: "post",
    });
  }

  function onDelete() {
    confirmDelete.current?.show(t("shared.delete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }
  function onDeleteConfirm() {
    const form = new FormData();
    form.set("action", "delete");
    submit(form, {
      method: "post",
    });
  }
  // function saveEmail() {
  //   const form = new FormData();
  //   form.set("action", "update");
  //   form.set("htmlBody", htmlBody);
  //   submit(form, {
  //     method: "post",
  //   });
  // }
  function canUpdate() {
    if (data.item.status !== "draft") {
      return false;
    }
    if (
      name.trim() === "" ||
      name !== data.item.name ||
      subject.trim() === "" ||
      subject !== data.item.subject ||
      senderId !== data.item.emailSenderId ||
      htmlBody.trim() !== data.item.htmlBody.trim()
    ) {
      // console.log("htmlBody", { htmlBody, existing: data.item.htmlBody });
      return true;
    }
    return false;
  }
  function filteredRecipients() {
    let emails = data.item.recipients;
    // if (maxDisplayedEmails === 10) {
    //   emails = emails.slice(0, 10);
    // }
    if (!searchInput.trim()) {
      return emails;
    }
    return emails.filter((f) => f.email?.toString().toUpperCase().includes(searchInput.toUpperCase()));
  }
  return (
    <EditPageLayout
      title={t("emailMarketing.campaignDetails")}
      menu={[
        {
          title: t("emailMarketing.campaigns"),
          routePath: params.tenant ? `/app/${params.tenant}/email-marketing/campaigns` : "/admin/email-marketing/campaigns",
        },
        {
          title: t("shared.edit"),
          routePath: params.tenant ? `/app/${params.tenant}/email-marketing/campaigns/${params.id}` : `/admin/email-marketing/campaigns/${params.id}`,
        },
      ]}
    >
      <Form onSubmit={handleSubmit} className="pb-20">
        {/* <input type="hidden" name="action" value="create" hidden readOnly /> */}
        <input type="hidden" name="action" value="update" hidden readOnly />

        <div className="relative space-y-4">
          <div className="flex flex-col space-y-4">
            {/* <InputGroup title="Email" className="bg-gray-50"> */}
            <div className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-3">
                <InputSelector
                  name="status"
                  title={t("shared.status")}
                  value={data.item.status}
                  withColors={true}
                  disabled={true}
                  options={[
                    {
                      value: "draft",
                      name: "Draft",
                      color: Colors.YELLOW,
                    },
                    {
                      value: "sending",
                      name: "Sending",
                      color: Colors.ORANGE,
                    },
                    {
                      value: "incomplete",
                      name: "Incomplete",
                      color: Colors.RED,
                    },
                    {
                      value: "completed",
                      name: "Completed",
                      color: Colors.GREEN,
                    },
                  ].map((i) => {
                    return {
                      value: i.value,
                      name: i.name,
                      color: i.color,
                    };
                  })}
                />
                <InputText
                  name="name"
                  title={t("shared.name")}
                  value={name}
                  setValue={setName}
                  placeholder="Broadcast name..."
                  required
                  disabled={data.item.status !== "draft"}
                />
                <InputSelector
                  name="senderId"
                  title={t("emails.sender")}
                  value={senderId}
                  setValue={setSenderId}
                  disabled={data.item.status !== "draft"}
                  withSearch={false}
                  // hint={
                  //   <>
                  //     <Link to={params.tenant ? `/app/${params.tenant}/email-marketing/senders` : `/admin/email-marketing/senders`}>
                  //       <span className="text-xs hover:underline">Manage senders</span>
                  //     </Link>
                  //   </>
                  // }
                  options={data.emailSenders.map((s) => {
                    return {
                      name: s.fromEmail,
                      value: s.id,
                    };
                  })}
                  required
                />
                <InputText
                  className="sm:col-span-3"
                  name="subject"
                  title={t("emails.subject")}
                  value={subject}
                  setValue={setSubject}
                  required
                  disabled={data.item.status !== "draft"}
                />

                <div className="sm:col-span-3">
                  <div className="w-full space-y-2">
                    {/* <Tabs
                        asLinks={false}
                        onSelected={(selected) => {
                          setEmailBodyTab(selected === 0 ? "html" : "text");
                        }}
                        className="w-full sm:w-auto"
                        tabs={[{ name: "HTML" }, { name: "Preview" }]}
                      /> */}
                    <div>
                      {data.item.status === "draft" && <input type="hidden" name="htmlBody" value={htmlBody} hidden readOnly />}
                      {/* {emailBodyTab === "html" && ( */}
                      <div className={clsx(data.item.status === "draft" ? "bg-white" : "bg-gray-100")}>
                        <InputContent
                          name="htmlBody"
                          value={htmlBody}
                          onChangeValue={setHtmlBody}
                          contentType={contentType}
                          onChangeContentType={setContentType}
                          disabled={data.item.status === "completed"}
                        />
                      </div>
                      {data.item.status === "draft" && (
                        <div className="mt-2 flex justify-end">
                          <ButtonSecondary type="submit" disabled={!canUpdate()}>
                            {t("shared.saveChanges")}
                          </ButtonSecondary>
                        </div>
                      )}
                      {/* )} */}
                      {/* {emailBodyTab === "text" && (
                          <InputText
                            name="htmlBody"
                            title="HTML"
                            editor="monaco"
                            editorTheme="light"
                            editorLanguage="html"
                            value={htmlBody}
                            setValue={setHtmlBody}
                            editorSize="lg"
                            required
                          />
                        )} */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* </InputGroup> */}
            {/* <div className="space-y-2 truncate">
                  <label className="flex justify-between space-x-2 text-xs font-medium text-gray-600">Contact variables</label>
                  <div className="flex space-x-1 overflow-x-auto rounded-md border border-dashed border-gray-300 bg-gray-50 p-2 text-sm text-gray-500">
                    <div className="select-all">{"{{name}}"}</div>
                    <div>•</div>
                    <div className="select-all">{"{{email}}"}</div>
                    <div>•</div>
                    <div className="select-all">{"{{job_title}}"}</div>
                    <div>•</div>
                    <div className="select-all">{"{{company_name}}"}</div>
                  </div>
                </div> */}
            {/* <InputText
                  name="htmlBody"
                  title="HTML"
                  readOnly={true}
                  editor="monaco"
                  editorTheme="light"
                  editorLanguage="html"
                  value={htmlBody}
                  setValue={setHtmlBody}
                  editorSize="lg"
                  disabled
                /> */}

            <div className="">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="text-sm font-medium text-gray-800">
                    {filteredRecipients().length === 1 ? t("emails.object") : t("emails.plural", { 0: data.item.recipients.length })} (
                    {data.item.recipients.length})
                  </div>
                </div>

                <InputSearch value={searchInput} setValue={setSearchInput} />
                <div className="max-h-96 overflow-auto rounded-md bg-white shadow-md">
                  <OutboundEmailsTable allEntities={data.allEntities} items={filteredRecipients()} />
                </div>
                <div className="flex justify-end">
                  {maxDisplayedEmails === 10 && (
                    <ButtonTertiary onClick={() => setMaxDisplayedEmails(100000)}>
                      {t("shared.show")} {data.item.recipients.length} {t("emails.recipients").toLowerCase()}
                    </ButtonTertiary>
                  )}
                </div>
              </div>
            </div>

            {data.item.status === "draft" && (
              <div className="flex items-center justify-between">
                <div>
                  {data.item.status === "draft" && (
                    <ButtonSecondary
                      destructive
                      onClick={onDelete}
                      disabled={data.item.status !== "draft" || navigation.state === "submitting"}
                      className="truncate"
                    >
                      {t("shared.delete")}
                    </ButtonSecondary>
                  )}
                </div>
                <div className="flex justify-between space-x-2">
                  <ButtonSecondary disabled={navigation.state === "submitting"} onClick={() => sendTest()} className="truncate">
                    {data.item.recipients.length === 1 ? t("emailMarketing.sendPreview") : t("emailMarketing.sendPreview", { 0: data.item.recipients.length })}
                  </ButtonSecondary>
                  <ButtonPrimary disabled={navigation.state === "submitting"} onClick={send} className="truncate">
                    {data.item.recipients.length === 1
                      ? t("emailMarketing.sendCampaignToContact")
                      : t("emailMarketing.sendCampaignToContacts", { 0: data.item.recipients.length })}
                  </ButtonPrimary>
                </div>
              </div>
            )}
          </div>
        </div>
      </Form>

      <ConfirmModal ref={modalConfirm} onYes={onConfirmSend} />
      <ConfirmModal ref={confirmDelete} onYes={onDeleteConfirm} destructive />
    </EditPageLayout>
  );
}
