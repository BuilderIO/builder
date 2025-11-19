import { Component, inject, type OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  Content,
  fetchOneEntry,
  type BuilderContent,
} from '@builder.io/sdk-angular';
import { BuilderFetchService } from '../builder-fetch.service';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { ProductInfoComponent } from './product-info/product-info.component';

@Component({
  selector: 'app-product-editorial',
  standalone: true,
  imports: [Content, ProductInfoComponent, HeaderComponent, FooterComponent],
  template: `
    <app-header />

    @if (product) {
      <app-product-info [product]="product" />
    }

    @if (editorial) {
      <div>
        <builder-content
          [content]="editorial"
          [model]="model"
          [apiKey]="apiKey"
        />
      </div>
    } @else {
      <div>Editorial not found</div>
    }

    <app-footer />
  `,
})
export class ProductEditorialComponent implements OnInit {
  private router = inject(Router);
  private builderFetch = inject(BuilderFetchService);

  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  model = 'product-editorial';
  editorial: BuilderContent | null = null;
  product: any;
  productId?: string;

  async ngOnInit() {
    this.productId = this.router.url.split('/').pop() || '';
    if (this.productId) {
      await this.fetchProductAndEditorial();
    }

    const urlPath = this.router.url || '';

    this.editorial = await fetchOneEntry({
      model: this.model,
      apiKey: this.apiKey,
      userAttributes: {
        urlPath,
      },
      fetch: this.builderFetch.fetch,
    });
  }

  private async fetchProductAndEditorial() {
    try {
      // Fetch product data from external API or your own CMS
      const response = await fetch(
        `https://fakestoreapi.com/products/${this.productId}`
      );

      if (!response.ok) {
        console.error(`Failed to fetch product: ${response.status}`);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('application/json')) {
        console.error(`Expected JSON but got ${contentType}`);
        return;
      }

      this.product = await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  }
}
