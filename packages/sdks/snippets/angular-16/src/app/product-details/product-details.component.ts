import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  fetchOneEntry,
  isPreviewing,
  type BuilderContent,
} from '@builder.io/sdk-angular';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="!notFound">
      <h1>{{ productDetails?.data?.['name'] }}</h1>
      <img
        [src]="productDetails?.data?.['image']"
        [alt]="productDetails?.data?.['name']"
      />
      <p>{{ productDetails?.data?.['collection'].value.data.copy }}</p>
      <p>
        Price:
        {{ productDetails?.data?.['collection'].value.data.price }}
      </p>
    </div>

    <div *ngIf="notFound">
      <p>404 - Product not found</p>
    </div>
  `,
})
export class ProductDetailsComponent {
  productDetails: BuilderContent | null = null;
  apiKey: string = 'ee9f13b4981e489a9a1209887695ef2b';
  notFound = false;

  async ngOnInit() {
    this.productDetails = await fetchOneEntry({
      model: 'product-details',
      apiKey: this.apiKey,
      query: {
        'data.handle': 'jacket',
      },
    });
    this.notFound = !this.productDetails && !isPreviewing();
  }
}
