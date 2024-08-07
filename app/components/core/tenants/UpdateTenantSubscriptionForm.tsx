import { useRef } from "react";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";

export default function UpdateTenantSubscriptionForm() {
  const errorModal = useRef<RefErrorModal>(null);

  return (
    <div>
      <div>TODO</div>

      <ErrorModal ref={errorModal} />
    </div>
  );
}
