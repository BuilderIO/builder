import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';

import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(private elementRef: ElementRef<HTMLElement>, private renderer: Renderer2) {}

  ngOnInit(): void {
    if (environment.production) {
      this.renderer.removeAttribute(this.elementRef.nativeElement, 'ng-version');
    }
  }
}
