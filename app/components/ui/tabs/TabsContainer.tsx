import { useState } from "react";
import Tabs from "./Tabs";

export default function TabsContainer({ items, selected }: { items: { name: string; render: React.ReactNode }[]; selected?: number }) {
  const [selectedTab, setSelectedTab] = useState(selected ?? 0);
  return (
    <div className="space-y-2">
      <Tabs asLinks={false} tabs={items} selectedTab={selectedTab} onSelected={(idx) => setSelectedTab(idx)} />
      {items[selectedTab].render}
    </div>
  );
}
