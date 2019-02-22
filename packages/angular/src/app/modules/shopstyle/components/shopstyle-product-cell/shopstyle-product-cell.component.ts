import { Component, OnInit, Input } from '@angular/core';
import { BuilderComponent } from '../../../builder/decorators/builder-component.dectorator';

type Product = any;

@Component({
  selector: 'shopstyle-product-cell',
  templateUrl: './shopstyle-product-cell.component.html',
  styleUrls: ['./shopstyle-product-cell.component.css'],
})
// @BuilderComponent({
//   name: 'Product Cell',
//   inputs: [
//     {
//       name: 'product',
//       type: 'shopstyleProduct',
//     },
//   ],
// })
export class ShopstyleProductCellComponent implements OnInit {
  @Input() product: Product;

  constructor() {}

  ngOnInit() {}

  get priceRange() {
    return (
      (this.product.salePrice && this.product.maxSalePrice) ||
      (!this.product.salePrice && this.product.maxPrice)
    );
  }
}
