import { useNavigate, useParams } from "@remix-run/react";
import WorkflowCredentialForm from "~/modules/workflowEngine/components/workflowVariables/WorkflowCredentialForm";
import UrlUtils from "~/utils/app/UrlUtils";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";

export default function WorkflowsCredentialsNewView() {
  const params = useParams();
  const navigate = useNavigate();
  function close() {
    navigate(UrlUtils.getModulePath(params, `workflow-engine/credentials`));
  }
  return (
    <SlideOverWideEmpty title="New Credential" className="sm:max-w-sm" open={true} onClose={close}>
      <WorkflowCredentialForm />
    </SlideOverWideEmpty>
  );
}
