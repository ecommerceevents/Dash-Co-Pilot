import InfoBanner from "~/components/ui/banners/InfoBanner";
import { BlockVariableDto } from "./BlockVariableDto";

export default function BlockVariable({ variable }: { variable: BlockVariableDto }) {
  return (
    <>
      {variable && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <InfoBanner title={"Block Variable"} text="">
            <pre>{JSON.stringify(variable, null, 2)}</pre>
          </InfoBanner>
        </div>
      )}
    </>
  );
}
