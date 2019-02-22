import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopstyleHeadingComponent } from './shopstyle-heading.component';

describe('ShopstyleHeadingComponent', () => {
  let component: ShopstyleHeadingComponent;
  let fixture: ComponentFixture<ShopstyleHeadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShopstyleHeadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopstyleHeadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
