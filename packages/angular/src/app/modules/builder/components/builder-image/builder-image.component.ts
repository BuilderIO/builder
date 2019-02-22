import { Component, OnInit, Input } from '@angular/core';
import { BuilderComponent } from '../../../builder/decorators/builder-component.dectorator';

@Component({
  selector: 'builder-image',
  templateUrl: './builder-image.component.html',
  styleUrls: ['./builder-image.component.css'],
})
@BuilderComponent({
  name: 'Image',
  image:
    // tslint:disable-next-line:max-line-length
    'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/images%2Fbaseline-insert_photo-24px.svg?alt=media&token=4e5d0ef4-f5e8-4e57-b3a9-38d63a9b9dc4',
  inputs: [
    {
      name: 'image',
      type: 'file',
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg'],
      required: true,
      // TODO
      defaultValue: '',
    },
    // TODO: custom controls like squarespace for position etc
    // Canvas stuff like forced height, width 100%, object positioning
    // {
    //   name: 'height',
    //   type: 'number',
    // },
    // {
    //   name: 'backgroundSize',
    //   type: 'text',
    //   defaultValue: 'contain',
    //   enum: ['contain', 'cover', 'fill'],
    // },
    // {
    //   name: 'backgroundPosition',
    //   type: 'text',
    //   defaultValue: 'center',
    //   enum: [
    //     'center',
    //     'top',
    //     'left',
    //     'right',
    //     'bottom',
    //     'top left',
    //     'top right',
    //     'bottom left',
    //     'bottom right',
    //   ],
    // },
  ],
})
export class BuilderImageComponent implements OnInit {
  @Input() image?: string;
  @Input() backgroundSize?: string;
  @Input() backgroundPosition?: string;
  // Mayeb max width and height 100% and can shrink it's container hm
  @Input() height?: number;
  @Input() width?: number;

  constructor() {}

  ngOnInit() {}
}
