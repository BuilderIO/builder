import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopstyleFeaturedImageComponent } from './shopstyle-featured-image.component';

describe('ShopstyleFeaturedImageComponent', () => {
  let component: ShopstyleFeaturedImageComponent;
  let fixture: ComponentFixture<ShopstyleFeaturedImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShopstyleFeaturedImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopstyleFeaturedImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
