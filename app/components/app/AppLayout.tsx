import { ReactNode } from "react";
import SidebarLayout from "../layouts/SidebarLayout";
import CommandPalette from "../ui/commandPalettes/CommandPalette";

interface Props {
  layout: "app" | "admin" | "docs";
  children: ReactNode;
}

export default function AppLayout({ layout, children }: Props) {
  return (
    <div>
      <CommandPalette key={layout} layout={layout}>
        <SidebarLayout layout={layout}>{children}</SidebarLayout>
      </CommandPalette>
      {/* {layout === "app" ? (
        <AppCommandPalette isOpen={showCommandPalette} onClosed={() => setShowCommandPalette(false)} />
      ) : layout === "admin" ? (
        <AdminCommandPalette isOpen={showCommandPalette} onClosed={() => setShowCommandPalette(false)} />
      ) : layout === "docs" && commands ? (
        <CommandPalette isOpen={showCommandPalette} onClosed={() => setShowCommandPalette(false)} commands={commands} />
      ) : (
        <div></div>
      )} */}
    </div>
  );
}
