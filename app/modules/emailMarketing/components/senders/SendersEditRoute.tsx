import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import OpenModal from "~/components/ui/modals/OpenModal";
import { Senders_Edit } from "../../routes/Senders_Edit";
import EmailSenderForm from "../EmailSenderForm";

export default function SendersEditRoute() {
  const data = useLoaderData<Senders_Edit.LoaderData>();
  const params = useParams();
  const navigate = useNavigate();
  function close() {
    navigate(params.tenant ? `/app/${params.tenant}/email-marketing/senders` : "/admin/email-marketing/senders");
  }
  return (
    <OpenModal className="sm:max-w-sm" onClose={close}>
      <EmailSenderForm item={data.item} />
    </OpenModal>
  );
}
