import { Component, OnInit, Input } from '@angular/core';
import { BuilderComponent } from '@builder.io/sdk';

@Component({
  selector: 'builder-divider',
  templateUrl: './builder-divider.component.html',
  styleUrls: ['./builder-divider.component.css'],
})
@BuilderComponent({
  name: 'Spacer',
  image:
    // tslint:disable-next-line:max-line-length
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij4KICAgIDxwYXRoIGQ9Ik0xOSA1djE0SDVWNWgxNG0wLTJINWMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMlY1YzAtMS4xLS45LTItMi0yeiIvPgogICAgPHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4K',
  // tslint:enable-next-line:max-line-length
  inputs: [
    {
      name: 'height',
      type: 'number',
      defaultValue: 50,
    },
  ],
})
export class BuilderDividerComponent implements OnInit {
  constructor() {}

  @Input() width?: number;
  @Input() height?: number;

  ngOnInit() {}
}
