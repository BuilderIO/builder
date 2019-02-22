import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { Element } from '../../interfaces/element.interface';

@Component({
  selector: 'builder-element',
  templateUrl: './builder-element.component.html',
  styleUrls: ['./builder-element.component.css'],
})
export class BuilderElementComponent implements OnInit {
  // TODO: handle custom properties and tag names
  @Input() element?: Element;

  @HostBinding()
  get style() {
    return this.element && this.element.style;
  }

  constructor() {}

  ngOnInit() {}
}
