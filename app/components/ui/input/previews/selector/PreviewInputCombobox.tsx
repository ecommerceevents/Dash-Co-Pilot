import InputCombobox from "../../InputCombobox";

export default function PreviewInputCombobox() {
  return (
    <div id="input-selector">
      <div className="not-prose border border-dashed border-gray-300 bg-white p-6">
        <InputCombobox
          name="name"
          title="Title"
          options={[
            {
              name: "Option 1",
              value: "1",
            },
            {
              name: "Option 2",
              value: "2",
            },
          ]}
        />
      </div>
    </div>
  );
}
