import { useKBar } from "kbar";
import ButtonPrimary from "../buttons/ButtonPrimary";

export default function PreviewCommandPalettes() {
  const { query } = useKBar();
  return (
    <div id="buttons">
      <div className="border border-dashed border-gray-300 bg-white p-6">
        <div id="buttons" className="w-full space-y-2">
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center space-y-4 sm:flex-row sm:items-end sm:justify-center sm:space-y-0 sm:space-x-4">
            <ButtonPrimary onClick={() => query.toggle()}>Show command palette</ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  );
}
