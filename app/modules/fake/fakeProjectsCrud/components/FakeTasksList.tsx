import { useNavigation } from "@remix-run/react";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import { FakeTaskDto } from "../dtos/FakeTaskDto";

export default function FakeTasksList({ items, onComplete }: { items?: FakeTaskDto[]; onComplete: (item: FakeTaskDto) => void }) {
  const navigation = useNavigation();
  return (
    <div className="flex flex-col space-y-1">
      {items &&
        items.map((item) => (
          <div key={item.name} className="rounded-md border border-gray-300 bg-gray-100 p-2">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col">
                <div>{item.name}</div>
              </div>
              {item.completed ? (
                <CheckIcon className="h-5 w-5 text-teal-500" />
              ) : (
                <ButtonSecondary type="button" onClick={() => onComplete(item)} disabled={navigation.state !== "idle"}>
                  Complete
                </ButtonSecondary>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
