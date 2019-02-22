import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopstyleProductsListComponent } from './shopstyle-products-list.component';

describe('ShopstyleProductsListComponent', () => {
  let component: ShopstyleProductsListComponent;
  let fixture: ComponentFixture<ShopstyleProductsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShopstyleProductsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopstyleProductsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
