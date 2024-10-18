import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-product-info',
  standalone: true,
  template: ` <div style="display: flex; gap: 200px; max-width: 1200px">
    <div class="product-image">
      <img
        [src]="product.image"
        [style.width.px]="300"
        [style.height.px]="300"
        [alt]="product.title"
      />
    </div>
    <div class="product-info">
      <h2>{{ product.title }}</h2>
      <p>{{ product.description }}</p>
      <p>Price: {{ product.price }} $</p>
      <p>Rating: {{ product.rating.rate }} / 5</p>
      <button>Buy now</button>
    </div>
  </div>`,
})
export class ProductInfoComponent {
  @Input() product: any;
}
