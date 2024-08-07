import { useEffect, useState } from "react";
import InputText from "~/components/ui/input/InputText";
import { PageBlockDto } from "~/modules/pageBlocks/dtos/PageBlockDto";

export default function JsonBlockForm({ item, onUpdate }: { item?: PageBlockDto; onUpdate: (item: PageBlockDto) => void }) {
  const [error, setError] = useState<string>();
  const [json, setJson] = useState("");

  useEffect(() => {
    if (item) {
      setJson(JSON.stringify(item, null, 2));
    }
  }, [item]);

  useEffect(() => {
    try {
      setError("");
      if (json) {
        const block = JSON.parse(json) as PageBlockDto;
        onUpdate(block);
      }
    } catch (e: any) {
      setError(e.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [json]);
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium leading-3 text-gray-800">JSON</label>
      <div className="h-96">
        {error && <p className="text-red-500">{error}</p>}
        <InputText value={json} setValue={(e) => setJson(e.toString())} editor="monaco" editorLanguage="json" editorFontSize={14} editorSize="lg" />
      </div>
    </div>
  );
}
