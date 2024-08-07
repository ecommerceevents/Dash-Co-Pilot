import { NavigateFunction } from "@remix-run/react";
import { Action } from "kbar";
import { TFunction } from "i18next";
import { AdminSidebar } from "~/application/sidebar/AdminSidebar";
import CommandHelper from "./CommandHelper";

interface Props {
  t: TFunction;
  navigate: NavigateFunction;
}
function getCommands({ t, navigate }: Props): Action[] {
  const actions: Action[] = CommandHelper.getSidebarCommands({ items: AdminSidebar(t) }).map((i) => {
    return {
      ...i,
      perform(action) {
        navigate(action.id);
      },
    };
  });
  actions.push({
    id: "create account",
    shortcut: [],
    name: t("app.commands.tenants.create"),
    keywords: "",
    perform: () => {
      navigate("/new-account");
    },
  });
  actions.push({
    id: "logout",
    shortcut: [],
    name: t("app.commands.profile.logout"),
    perform: () => {
      navigate("/logout");
    },
  });
  return actions;
}

export default {
  getCommands,
};
