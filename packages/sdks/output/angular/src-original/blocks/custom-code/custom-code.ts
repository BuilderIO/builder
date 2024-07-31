import { Component, ViewChild, ElementRef, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

export interface CustomCodeProps {
  code: string;
  replaceNodes?: boolean;
}

@Component({
  selector: "custom-code, CustomCode",
  template: `
    <div #elementRef [class]="node_0_div" [innerHTML]="code"></div>
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
export default class CustomCode {
  @Input() replaceNodes!: CustomCodeProps["replaceNodes"];
  @Input() code!: CustomCodeProps["code"];

  @ViewChild("elementRef") elementRef!: ElementRef;

  scriptsInserted = [];
  scriptsRun = [];
  node_0_div = null;

  ngOnInit() {
    this.node_0_div =
      "builder-custom-code" + (this.replaceNodes ? " replace-nodes" : "");

    if (typeof window !== "undefined") {
      // TODO: Move this function to standalone one in '@builder.io/utils'
      if (
        !this.elementRef.nativeElement?.getElementsByTagName ||
        typeof window === "undefined"
      ) {
        return;
      }
      const scripts =
        this.elementRef.nativeElement.getElementsByTagName("script");
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        if (script.src) {
          if (this.scriptsInserted.includes(script.src)) {
            continue;
          }
          this.scriptsInserted.push(script.src);
          const newScript = document.createElement("script");
          newScript.async = true;
          newScript.src = script.src;
          document.head.appendChild(newScript);
        } else if (
          !script.type ||
          [
            "text/javascript",
            "application/javascript",
            "application/ecmascript",
          ].includes(script.type)
        ) {
          if (this.scriptsRun.includes(script.innerText)) {
            continue;
          }
          try {
            this.scriptsRun.push(script.innerText);
            new Function(script.innerText)();
          } catch (error) {
            console.warn("`CustomCode`: Error running script:", error);
          }
        }
      }
    }
  }

  ngOnChanges() {
    if (typeof window !== "undefined") {
      this.node_0_div =
        "builder-custom-code" + (this.replaceNodes ? " replace-nodes" : "");
    }
  }
}
