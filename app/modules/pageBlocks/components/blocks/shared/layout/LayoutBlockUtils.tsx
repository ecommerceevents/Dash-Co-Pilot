import clsx from "clsx";
import { PageBlockDto } from "~/modules/pageBlocks/dtos/PageBlockDto";
import MarginBlockUtils, { MarginBlockDto } from "./margin/MarginBlockUtils";
import PaddingBlockUtils, { PaddingBlockDto } from "./padding/PaddingBlockUtils";
import SizeBlockUtils, { SizeBlockDto } from "./size/SizeBlockUtils";

export interface LayoutBlockDto {
  css?: string;
  padding?: PaddingBlockDto;
  margin?: MarginBlockDto;
  size?: SizeBlockDto;
}

function getClasses(block: PageBlockDto) {
  return clsx(
    block?.layout?.css,
    block?.layout?.padding ? PaddingBlockUtils.getClasses(block?.layout.padding) : "",
    block?.layout?.margin ? MarginBlockUtils.getClasses(block?.layout.margin) : "",
    block?.layout?.size ? SizeBlockUtils.getClasses(block?.layout.size) : ""
  );
}

export default {
  getClasses,
};
