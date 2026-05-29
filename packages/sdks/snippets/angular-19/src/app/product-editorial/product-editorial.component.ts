import { Component } from '@angular/core';
import {
  Content,
  fetchOneEntry,
  type BuilderContent,
} from '@builder.io/sdk-angular';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { ProductInfoComponent } from './product-info/product-info.component';

@Component({
  selector: 'app-product-editorial',
  standalone: true,
  imports: [Content, ProductInfoComponent, HeaderComponent, FooterComponent],
  template: `
    <app-header />

    <app-product-info [product]="product" />

    <builder-content [content]="editorial" model="product-editorial" />

    <app-footer />
  `,
})
export class ProductEditorialComponent {
  product: any;
  editorial: BuilderContent | null = null;
  productId?: string;

  async ngOnInit() {
    this.productId = window.location.pathname.split('/').pop() || '';
    if (this.productId) {
      await this.fetchProductAndEditorial();
    }
  }

  private async fetchProductAndEditorial() {
    // Fetch product data from external API or your own CMS
    this.product = await fetch(
      `https://fakestoreapi.com/products/${this.productId}`
    ).then((res) => res.json());

    // Fetch editorial content from Builder.io
    this.editorial = await fetchOneEntry({
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      model: 'product-editorial',
      userAttributes: {
        urlPath: window.location.pathname || '/',
      },
    });
  }
}
