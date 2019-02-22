import { Component, OnInit, Input } from '@angular/core';
import { BuilderComponent } from '../../../builder/decorators/builder-component.dectorator';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

type Product = any;

@Component({
  selector: 'shopstyle-products-list',
  templateUrl: './shopstyle-products-list.component.html',
  styleUrls: ['./shopstyle-products-list.component.css'],
})
@BuilderComponent({
  name: 'Products List',
  inputs: [
    {
      name: 'shopId',
      type: 'string',
      // TODO: type: 'shop'....
    },
  ],
})
export class ShopstyleProductsListComponent implements OnInit {
  constructor(private http: HttpClient) {}

  products = new BehaviorSubject<any[]>([]);

  @Input()
  set shopId(id: string) {
    if (!id) {
      return;
    }

    this.http
      .get(`https://www.shopstyle.com/api/v2/posts/${id}/products?limit=50&pid=shopstyle`)
      .subscribe((response: any) => {
        const products = response.products;
        if (products) {
          this.products.next(products);
        }
      });
  }

  ngOnInit() {}
}
