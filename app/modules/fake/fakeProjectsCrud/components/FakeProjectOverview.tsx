import ErrorBanner from "~/components/ui/banners/ErrorBanner";
import InfoBanner from "~/components/ui/banners/InfoBanner";
import InputText from "~/components/ui/input/InputText";
import { FakeProjectDto } from "../dtos/FakeProjectDto";
import { FakeTaskDto } from "../dtos/FakeTaskDto";
import FakeTasksList from "./FakeTasksList";

export default function FakeProjectOverview({
  item,
  onCompleteTask,
  actionData,
}: {
  item: FakeProjectDto;
  onCompleteTask: (item: FakeTaskDto) => void;
  actionData?: { error?: string; success?: string };
}) {
  return (
    <div className="space-y-2 text-sm text-gray-700">
      <div>
        <b className="text-xs font-bold uppercase text-gray-400">Name</b>
        <InputText readOnly defaultValue={item.name} />
      </div>
      <div>
        <b className="text-xs font-bold uppercase text-gray-400">Description</b>
        <InputText readOnly defaultValue={item.description} rows={3} />
      </div>
      <div>
        <b className="text-xs font-bold uppercase text-gray-400">Tasks</b>

        <FakeTasksList items={item.tasks} onComplete={onCompleteTask} />
      </div>

      {actionData?.error && <ErrorBanner title={"Error"} text={actionData?.error} />}
      {actionData?.success && <InfoBanner title={"Success"} text={actionData?.success} />}
    </div>
  );
}
