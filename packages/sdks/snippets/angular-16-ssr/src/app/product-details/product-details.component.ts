import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BuilderContent } from '@builder.io/sdk-angular';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="productDetails">
      <h1>{{ productDetails.data?.['name'] }}</h1>
      <img
        [src]="productDetails.data?.['image']"
        [alt]="productDetails.data?.['name']"
        width="400"
        height="500"
      />
      <p>{{ productDetails.data?.['collection'].value.data.copy }}</p>
      <p>
        Price:
        {{ productDetails.data?.['collection'].value.data.price }}
      </p>
    </div>

    <div *ngIf="!productDetails">
      <p>Loading product details...</p>
    </div>
  `,
})
export class ProductDetailsComponent {
  productDetails: BuilderContent | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.data.subscribe((data: any) => {
      this.productDetails = data.productDetails;
    });
  }
}
