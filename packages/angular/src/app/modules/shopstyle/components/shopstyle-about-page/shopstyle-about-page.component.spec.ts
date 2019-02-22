import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopstyleAboutPageComponent } from './shopstyle-about-page.component';

describe('ShopstyleAboutPageComponent', () => {
  let component: ShopstyleAboutPageComponent;
  let fixture: ComponentFixture<ShopstyleAboutPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShopstyleAboutPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopstyleAboutPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
