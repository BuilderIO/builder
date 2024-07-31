import { Component, ViewChild, ElementRef, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

export interface EmbedProps {
  content: string;
}

import { isJsScript } from "./helpers";

@Component({
  selector: "builder-embed, BuilderEmbed",
  template: `
    <div class="builder-embed" #elem [innerHTML]="content"></div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule],
})
export default class BuilderEmbed {
  @Input() content!: EmbedProps["content"];

  @ViewChild("elem") elem!: ElementRef;

  scriptsInserted = [];
  scriptsRun = [];
  ranInitFn = false;
  findAndRunScripts() {
    if (
      !this.elem.nativeElement ||
      !this.elem.nativeElement.getElementsByTagName
    )
      return;
    const scripts = this.elem.nativeElement.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      if (script.src && !this.scriptsInserted.includes(script.src)) {
        this.scriptsInserted.push(script.src);
        const newScript = document.createElement("script");
        newScript.async = true;
        newScript.src = script.src;
        document.head.appendChild(newScript);
      } else if (
        isJsScript(script) &&
        !this.scriptsRun.includes(script.innerText)
      ) {
        try {
          this.scriptsRun.push(script.innerText);
          new Function(script.innerText)();
        } catch (error) {
          console.warn("`Embed`: Error running script:", error);
        }
      }
    }
  }

  ngOnChanges() {
    if (typeof window !== "undefined") {
      if (this.elem.nativeElement && !this.ranInitFn) {
        this.ranInitFn = true;
        this.findAndRunScripts();
      }
    }
  }
}
