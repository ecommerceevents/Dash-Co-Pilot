import { Colors } from "~/application/enums/shared/Colors";
import RenderOption from "../../properties/select/RenderOption";
import { SelectOptionsDisplay } from "~/utils/shared/SelectOptionsUtils";

type ItemDto = { value: string; name: string | null; color: Colors };
export default function RowSelectedOptionCell({ value, options, display = "Name" }: { value: string; options: ItemDto[]; display: SelectOptionsDisplay }) {
  const selected = options.find((f) => f.value === value);
  return (
    <>
      <div className="flex items-center space-x-2">
        <RenderOption option={selected} display={display} hasColors={true} />
      </div>
    </>
  );
}
