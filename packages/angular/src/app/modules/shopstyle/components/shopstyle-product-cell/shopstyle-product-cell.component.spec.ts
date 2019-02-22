import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopstyleProductCellComponent } from './shopstyle-product-cell.component';

describe('ShopstyleProductCellComponent', () => {
  let component: ShopstyleProductCellComponent;
  let fixture: ComponentFixture<ShopstyleProductCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShopstyleProductCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopstyleProductCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
