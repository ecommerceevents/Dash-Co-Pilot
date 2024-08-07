import { Action } from "kbar";
import { SideBarItem } from "~/application/sidebar/SidebarItem";

function getSidebarCommands({ items }: { items: SideBarItem[] }): Action[] {
  const commands: Action[] = [];
  items.forEach((item) => {
    commands.push(...getCommandsFromItem(item, [], []));
  });
  return commands;
}

function getCommandsFromItem(item: SideBarItem, commands: Action[], parent: string[]) {
  if (item.path && item.title) {
    let description = item.description ?? "";
    if (parent.filter((f) => f).length > 0) {
      description = parent.filter((f) => f).join(" / ");
    }
    commands.push({
      id: item.path,
      name: item.title,
      shortcut: [],
      subtitle: description,
    });
  }
  item.items?.forEach((subItem) => {
    return getCommandsFromItem(subItem, commands, [...parent, item.title]);
  });

  return commands;
}

export default {
  getSidebarCommands,
};
