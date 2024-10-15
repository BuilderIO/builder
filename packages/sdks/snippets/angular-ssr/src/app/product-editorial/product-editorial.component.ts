import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BuilderContent, Content } from '@builder.io/sdk-angular';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { ProductInfoComponent } from './product-info/product-info.component';

@Component({
  selector: 'app-product-editorial',
  standalone: true,
  imports: [
    Content,
    CommonModule,
    ProductInfoComponent,
    HeaderComponent,
    FooterComponent,
  ],
  template: `
    <app-header />

    <app-product-info [product]="product" />

    <builder-content
      [content]="editorial"
      model="product-editorial"
      
    />

    <app-footer />
  `,
})
export class ProductEditorialComponent {
  product: any;
  editorial: BuilderContent | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.data.subscribe((data: any) => {
      this.product = data.productData.product;
      this.editorial = data.productData.editorial;
    });
  }
}
