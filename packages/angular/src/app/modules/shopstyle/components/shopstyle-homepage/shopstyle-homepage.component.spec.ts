import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopstyleHomepageComponent } from './shopstyle-homepage.component';

describe('ShopstyleHomepageComponent', () => {
  let component: ShopstyleHomepageComponent;
  let fixture: ComponentFixture<ShopstyleHomepageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShopstyleHomepageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopstyleHomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
