import { Colors } from "~/application/enums/shared/Colors";

function getMethodColor(method: string) {
  if (method === "POST") {
    return Colors.GREEN;
  } else if (method === "GET") {
    return Colors.BLUE;
  } else if (method === "PUT") {
    return Colors.ORANGE;
  } else if (method === "DELETE") {
    return Colors.RED;
  }
  return Colors.GRAY;
}

export default {
  getMethodColor,
};
