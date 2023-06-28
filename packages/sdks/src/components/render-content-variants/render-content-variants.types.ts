import type { FetchContent } from "../../functions/get-content/types";
import type { RenderContentProps } from "../render-content/render-content.types";

export interface VariantRenderContentProps extends Omit<RenderContentProps, 'content' | 'apiKey' | 'model'> {
  content: FetchContent;
}