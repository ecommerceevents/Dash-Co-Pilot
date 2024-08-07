import { NavigateFunction } from "@remix-run/react";
import { Action } from "kbar";
import { TFunction } from "i18next";
import { getDocCommands } from "~/utils/services/docsService";

interface Props {
  t: TFunction;
  navigate: NavigateFunction;
}
function getCommands({ t, navigate }: Props): Action[] {
  const actions: Action[] = getDocCommands().map((i) => {
    return {
      ...i,
      perform(action) {
        navigate(action.id);
      },
    };
  });
  return actions;
}

export default {
  getCommands,
};
