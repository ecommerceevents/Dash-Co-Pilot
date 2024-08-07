import { Colors } from "~/application/enums/shared/Colors";

function getBg600(itemColor: Colors): string {
  switch (itemColor) {
    case Colors.UNDEFINED:
      return "dark:bg-gray-600";
    case Colors.SLATE:
      return "dark:bg-slate-600";
    case Colors.GRAY:
      return "dark:bg-gray-600";
    case Colors.NEUTRAL:
      return "dark:bg-neutral-600";
    case Colors.STONE:
      return "dark:bg-stone-600";
    case Colors.RED:
      return "dark:bg-red-600";
    case Colors.ORANGE:
      return "dark:bg-orange-600";
    case Colors.AMBER:
      return "dark:bg-amber-600";
    case Colors.YELLOW:
      return "dark:bg-yellow-600";
    case Colors.LIME:
      return "dark:bg-lime-600";
    case Colors.GREEN:
      return "dark:bg-green-600";
    case Colors.EMERALD:
      return "dark:bg-emerald-600";
    case Colors.TEAL:
      return "dark:bg-teal-600";
    case Colors.CYAN:
      return "dark:bg-cyan-600";
    case Colors.SKY:
      return "dark:bg-sky-600";
    case Colors.BLUE:
      return "dark:bg-blue-600";
    case Colors.INDIGO:
      return "dark:bg-indigo-600";
    case Colors.VIOLET:
      return "dark:bg-violet-600";
    case Colors.PURPLE:
      return "dark:bg-purple-600";
    case Colors.FUCHSIA:
      return "dark:bg-fuchsia-600";
    case Colors.PINK:
      return "dark:bg-pink-600";
    case Colors.ROSE:
      return "dark:bg-rose-600";
  }
}

function getBg900(itemColor: Colors): string {
  switch (itemColor) {
    case Colors.UNDEFINED:
      return "dark:bg-gray-900";
    case Colors.SLATE:
      return "dark:bg-slate-900";
    case Colors.GRAY:
      return "dark:bg-gray-900";
    case Colors.NEUTRAL:
      return "dark:bg-neutral-900";
    case Colors.STONE:
      return "dark:bg-stone-900";
    case Colors.RED:
      return "dark:bg-red-900";
    case Colors.ORANGE:
      return "dark:bg-orange-900";
    case Colors.AMBER:
      return "dark:bg-amber-900";
    case Colors.YELLOW:
      return "dark:bg-yellow-900";
    case Colors.LIME:
      return "dark:bg-lime-900";
    case Colors.GREEN:
      return "dark:bg-green-900";
    case Colors.EMERALD:
      return "dark:bg-emerald-900";
    case Colors.TEAL:
      return "dark:bg-teal-900";
    case Colors.CYAN:
      return "dark:bg-cyan-900";
    case Colors.SKY:
      return "dark:bg-sky-900";
    case Colors.BLUE:
      return "dark:bg-blue-900";
    case Colors.INDIGO:
      return "dark:bg-indigo-900";
    case Colors.VIOLET:
      return "dark:bg-violet-900";
    case Colors.PURPLE:
      return "dark:bg-purple-900";
    case Colors.FUCHSIA:
      return "dark:bg-fuchsia-900";
    case Colors.PINK:
      return "dark:bg-pink-900";
    case Colors.ROSE:
      return "dark:bg-rose-900";
  }
}

export default {
  getBg600,
  getBg900,
};
