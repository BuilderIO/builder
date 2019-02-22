import { Component, OnInit, Input } from '@angular/core';
import { BuilderComponent } from '../../../builder/decorators/builder-component.dectorator';

// @BuilderComponent({
//   // TODO
//   name: 'Heading',
//   inputs: [
//     {
//       name: 'title',
//       type: 'string',
//     },
//   ],
// })
@Component({
  selector: 'shopstyle-heading',
  templateUrl: './shopstyle-heading.component.html',
  styleUrls: ['./shopstyle-heading.component.css'],
})
export class ShopstyleHeadingComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  @Input() title: string;
}
