import { Colors } from "~/application/enums/shared/Colors";

function getBorder500(itemColor: Colors): string {
  switch (itemColor) {
    case Colors.UNDEFINED:
      return "hover:border-gray-500";
    case Colors.SLATE:
      return "hover:border-slate-500";
    case Colors.GRAY:
      return "hover:border-gray-500";
    case Colors.NEUTRAL:
      return "hover:border-neutral-500";
    case Colors.STONE:
      return "hover:border-stone-500";
    case Colors.RED:
      return "hover:border-red-500";
    case Colors.ORANGE:
      return "hover:border-orange-500";
    case Colors.AMBER:
      return "hover:border-amber-500";
    case Colors.YELLOW:
      return "hover:border-yellow-500";
    case Colors.LIME:
      return "hover:border-lime-500";
    case Colors.GREEN:
      return "hover:border-green-500";
    case Colors.EMERALD:
      return "hover:border-emerald-500";
    case Colors.TEAL:
      return "hover:border-teal-500";
    case Colors.CYAN:
      return "hover:border-cyan-500";
    case Colors.SKY:
      return "hover:border-sky-500";
    case Colors.BLUE:
      return "hover:border-blue-500";
    case Colors.INDIGO:
      return "hover:border-indigo-500";
    case Colors.VIOLET:
      return "hover:border-violet-500";
    case Colors.PURPLE:
      return "hover:border-purple-500";
    case Colors.FUCHSIA:
      return "hover:border-fuchsia-500";
    case Colors.PINK:
      return "hover:border-pink-500";
    case Colors.ROSE:
      return "hover:border-rose-500";
  }
}

function getBg900(itemColor: Colors): string {
  switch (itemColor) {
    case Colors.UNDEFINED:
      return "hover:bg-gray-900";
    case Colors.SLATE:
      return "hover:bg-slate-900";
    case Colors.GRAY:
      return "hover:bg-gray-900";
    case Colors.NEUTRAL:
      return "hover:bg-neutral-900";
    case Colors.STONE:
      return "hover:bg-stone-900";
    case Colors.RED:
      return "hover:bg-red-900";
    case Colors.ORANGE:
      return "hover:bg-orange-900";
    case Colors.AMBER:
      return "hover:bg-amber-900";
    case Colors.YELLOW:
      return "hover:bg-yellow-900";
    case Colors.LIME:
      return "hover:bg-lime-900";
    case Colors.GREEN:
      return "hover:bg-green-900";
    case Colors.EMERALD:
      return "hover:bg-emerald-900";
    case Colors.TEAL:
      return "hover:bg-teal-900";
    case Colors.CYAN:
      return "hover:bg-cyan-900";
    case Colors.SKY:
      return "hover:bg-sky-900";
    case Colors.BLUE:
      return "hover:bg-blue-900";
    case Colors.INDIGO:
      return "hover:bg-indigo-900";
    case Colors.VIOLET:
      return "hover:bg-violet-900";
    case Colors.PURPLE:
      return "hover:bg-purple-900";
    case Colors.FUCHSIA:
      return "hover:bg-fuchsia-900";
    case Colors.PINK:
      return "hover:bg-pink-900";
    case Colors.ROSE:
      return "hover:bg-rose-900";
  }
}

export default {
  getBorder500,
  getBg900,
};
