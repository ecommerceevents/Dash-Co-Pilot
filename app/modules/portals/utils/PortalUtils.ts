import { PortalDto } from "../dtos/PortalDto";

function getUrl(item: PortalDto, path: string) {
  return `${item.url}${path}`;
}

export default {
  getUrl,
};
