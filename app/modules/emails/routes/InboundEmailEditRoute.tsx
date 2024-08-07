import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import SlideOverFormLayout from "~/components/ui/slideOvers/SlideOverFormLayout";
import DateUtils from "~/utils/shared/DateUtils";
import { LoaderDataInboundEmailEdit } from "../loaders/inbound-email-edit";

export default function InboundEmailRoute() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderDataInboundEmailEdit>();
  const navigate = useNavigate();
  const submit = useSubmit();

  function onDelete() {
    const formData = new FormData();
    formData.append("action", "delete");
    submit(formData, {
      method: "post",
    });
  }
  function htmlBodyWithImages() {
    const imagesInBody: string[] = [];
    let htmlBody = data.item.htmlBody;

    const regex = new RegExp(`<img.*?src="(.*?)"`, "g");
    let matches: RegExpExecArray | null;
    let times = 0;
    do {
      times++;
      matches = regex.exec(htmlBody);
      if (!matches) {
        break;
      }
      const exact = matches[1];
      if (exact.startsWith("cid:")) {
        const fileName = exact.split("@")[0].replace("cid:", "");
        const file = data.item.attachments.find((file) => file.name === fileName);
        if (file) {
          imagesInBody.push(file.name);
          htmlBody = htmlBody.replace(exact, `${file.content}`);
        }
      }
    } while (matches && times < 10);
    return htmlBody;
  }
  return (
    <div>
      <SlideOverFormLayout
        className="max-w-2xl"
        classNameBg="bg-gray-50"
        title={data.item.subject}
        description={DateUtils.dateAgo(data.item.date)}
        onClosed={() => navigate(data.redirectUrl)}
        options={[
          {
            title: t("shared.delete"),
            onClick: onDelete,
          },
        ]}
      >
        <div className="space-y-1 p-2">
          <div className="grid grid-cols-12 gap-3 rounded-md border border-gray-300 bg-white p-4 shadow">
            <div className="col-span-2 text-end">
              <div className="text-xs text-gray-400">Subject: </div>
            </div>
            <div className="col-span-10">
              <div className="truncate text-sm font-extrabold">{data.item.subject}</div>
            </div>

            <div className="col-span-2 text-end">
              <div className="text-xs text-gray-400">From: </div>
            </div>
            <div className="col-span-10">
              <div className="flex flex-col text-sm">
                <div className="font-medium">{data.item.fromName}</div>
                <div className="select-all truncate text-sm text-gray-400">{data.item.fromEmail}</div>
              </div>
            </div>

            <div className="col-span-2 text-end">
              <div className="text-xs text-gray-400">To: </div>
            </div>
            <div className="col-span-10">
              <div className="flex flex-col text-sm">
                <div className="font-medium">{data.item.toName}</div>
                <div className="select-all truncate text-sm text-gray-400">{data.item.toEmail}</div>
              </div>
            </div>

            <div className="col-span-2 text-end">
              <div className="text-xs text-gray-400">Date: </div>
            </div>
            <div className="col-span-10">
              <div className="flex items-baseline space-x-1 text-sm">
                <div className="font-medium">{DateUtils.dateAgo(data.item.date)}</div>
                <div className="text-xs text-gray-400">- {DateUtils.dateYMDHMS(data.item.date)}</div>
              </div>
            </div>

            <div className="col-span-2 text-end">
              <div className="text-xs text-gray-400">Read at: </div>
            </div>
            <div className="col-span-10">
              <div className="flex items-baseline space-x-1 text-sm">
                <div className="font-medium">{DateUtils.dateAgo(data.myRead.createdAt)}</div>
                <div className="text-xs text-gray-400">- {DateUtils.dateYMDHMS(data.myRead.createdAt)}</div>
              </div>
            </div>

            <div className="col-span-2 text-end">
              <div className="text-xs text-gray-400">Attachments: </div>
            </div>
            <div className="col-span-10">
              <div className="flex flex-col space-y-1">
                {data.item.attachments.map((item) => {
                  return (
                    <div key={item.id} className="truncate">
                      <div className="flex items-center space-x-2 truncate text-sm">
                        <div
                          className={clsx(
                            "w-10 flex-shrink-0 truncate rounded-md border border-gray-300 bg-gray-50 p-0.5 text-center text-xs uppercase text-gray-500",
                            item.type.includes("xml") && "border-blue-300 bg-blue-50 text-blue-500",
                            item.type.includes("pdf") && "border-red-300 bg-red-50 text-red-500"
                          )}
                        >
                          {item.name.split(".").pop()}
                        </div>
                        <a
                          href={item.publicUrl ?? item.content}
                          download={item.name}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate underline hover:text-theme-500"
                        >
                          {item.name}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <iframe
            className="h-full min-h-screen w-full rounded-md border border-gray-300 bg-white p-4 shadow"
            title={data.item.subject}
            srcDoc={htmlBodyWithImages()}
          />
          {/* <div dangerouslySetInnerHTML={{ __html: data.item.htmlBody }} /> */}
        </div>
      </SlideOverFormLayout>
    </div>
  );
}
