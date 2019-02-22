import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopstyleHeroComponent } from './shopstyle-hero.component';

describe('ShopstyleHeroComponent', () => {
  let component: ShopstyleHeroComponent;
  let fixture: ComponentFixture<ShopstyleHeroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShopstyleHeroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopstyleHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
