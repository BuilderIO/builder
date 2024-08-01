import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

interface Props extends BuilderNonceProp {
  cssCode?: string;
  customFonts?: CustomFont[];
  contentId?: string;
  isNestedRender?: boolean;
}

import type { BuilderNonceProp } from "../../../types/builder-props";
import InlinedStyles from "../../inlined-styles";
import type { CustomFont } from "./styles.helpers";
import { getCss, getDefaultStyles, getFontCss } from "./styles.helpers";

@Component({
  selector: "content-styles, ContentStyles",
  template: `
    <inlined-styles
      id="builderio-content"
      [styles]="injectedStyles"
      [nonce]="nonce"
    ></inlined-styles>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, InlinedStyles],
})
export default class ContentStyles {
  @Input() cssCode!: Props["cssCode"];
  @Input() contentId!: Props["contentId"];
  @Input() customFonts!: Props["customFonts"];
  @Input() isNestedRender!: Props["isNestedRender"];
  @Input() nonce!: Props["nonce"];

  injectedStyles = `
${getCss({
  cssCode: this.cssCode,
  contentId: this.contentId,
})}
${getFontCss({
  customFonts: this.customFonts,
})}
${getDefaultStyles(this.isNestedRender)}
`.trim();

            ngOnInit() {
              this.injectedStyles = `
${getCss({
  cssCode: this.cssCode,
  contentId: this.contentId,
})}
${getFontCss({
  customFonts: this.customFonts,
})}
${getDefaultStyles(this.isNestedRender)}
`.trim();
            }
          }
          