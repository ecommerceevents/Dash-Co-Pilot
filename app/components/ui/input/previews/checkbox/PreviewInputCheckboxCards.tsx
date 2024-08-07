import { useState } from "react";
import InputCheckboxCards from "../../InputCheckboxCards";

export default function PreviewInputCheckboxCards() {
  const [selected, setSelected] = useState<(string | number)[]>([]);
  return (
    <div id="input-checkbox">
      <div className="not-prose border border-dashed border-gray-300 bg-white p-6">
        <InputCheckboxCards
          name="name"
          title="Title"
          options={[
            {
              name: "Option 1",
              value: 1,
            },
            {
              name: "Option 2",
              value: 2,
            },
            {
              name: "Option 3",
              value: 3,
              disabled: true,
            },
          ]}
          value={selected}
          onChange={(e) => setSelected(e)}
        />
      </div>
    </div>
  );
}
