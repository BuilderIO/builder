import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

export interface ErrorBoundaryProps {
  children: any;
}

@Component({
  selector: "error-boundary, ErrorBoundary",
  template: `
    <ng-container><ng-content></ng-content></ng-container>
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
export default class ErrorBoundary {}
