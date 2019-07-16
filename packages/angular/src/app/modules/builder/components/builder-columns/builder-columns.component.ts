import { Component, OnInit, Input } from '@angular/core';

export interface BuilderComponentInfo {
  component: string;
  options: any;
}

export interface Column {
  content: BuilderComponentInfo[];
}

// @BuilderComponent({
//   name: 'Columns',
//   inputs: [
//     {
//       name: 'gutterSize',
//       type: 'number',
//     },
//     {
//       name: 'columns',
//       type: 'list',
//       subFields: [
//         // TODO: include width option?
//         {
//           name: 'content',
//           type: 'list',
//           subFields: [
//             {
//               name: 'component',
//               type: 'component',
//             },
//           ],
//         },
//       ],
//     },
//   ],
// })
@Component({
  selector: 'builder-columns',
  templateUrl: './builder-columns.component.html',
  styleUrls: ['./builder-columns.component.css'],
})
export class BuilderColumnsComponent implements OnInit {
  @Input() gutterSize = 10;
  @Input() columns: Column[] = [];

  get numColumns() {
    return this.columns.length;
  }

  get gridTemplateColumns() {
    const size = 100 / this.columns.length;
    return this.columns.map(item => size + '%').join(' ');
  }

  constructor() {}

  ngOnInit() {}
}
