import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { fetchOneEntry, type BuilderContent } from '@builder.io/sdk-angular';
import { BuilderFetchService } from '../builder-fetch.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [],
  template: `
    @if (productDetails) {
      <div>
        <h1>{{ productDetails.data?.['title'] }}</h1>
        <img
          [src]="productDetails.data?.['image']"
          [alt]="productDetails.data?.['title']"
        />
        <p>{{ productDetails.data?.['description'] }}</p>
        <p>Price: {{ productDetails.data?.['price'] }}</p>
      </div>
    } @else {
      <div>
        <p>Loading product details...</p>
      </div>
    }
  `,
})
export class ProductDetailsComponent {
  private router = inject(Router);
  private builderFetch = inject(BuilderFetchService);

  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  model = 'product-details';
  productDetails: BuilderContent | null = null;

  async ngOnInit() {
    const urlPath = this.router.url || '';

    this.productDetails = await fetchOneEntry({
      model: this.model,
      apiKey: this.apiKey,
      userAttributes: {
        urlPath,
      },
      fetch: this.builderFetch.fetch,
    });
  }
}
