import { Component, OnInit, Input } from '@angular/core';
import { BuilderComponent } from '../../../builder/decorators/builder-component.dectorator';

@Component({
  selector: 'builder-shopstyle-featured-image',
  templateUrl: './shopstyle-featured-image.component.html',
  styleUrls: ['./shopstyle-featured-image.component.css'],
})
// @BuilderComponent({
//   name: 'Image',
//   inputs: [
//     {
//       name: 'image',
//       type: 'file',
//       required: true,
//     },
//     {
//       name: 'width',
//       type: 'number',
//     },
//   ],
// })
export class ShopstyleFeaturedImageComponent implements OnInit {
  @Input() image: string;
  @Input() width: number;

  constructor() {}

  ngOnInit() {}
}
