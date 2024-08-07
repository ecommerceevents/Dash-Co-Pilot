import { useParams, useNavigate } from "@remix-run/react";
import OpenModal from "~/components/ui/modals/OpenModal";
import EmailSenderForm from "../EmailSenderForm";

export default function SendersNewRoute() {
  const params = useParams();
  const navigate = useNavigate();
  function close() {
    navigate(params.tenant ? `/app/${params.tenant}/email-marketing/senders` : "/admin/email-marketing/senders");
  }
  return (
    <OpenModal className="sm:max-w-sm" onClose={close}>
      <EmailSenderForm />
    </OpenModal>
  );
}
