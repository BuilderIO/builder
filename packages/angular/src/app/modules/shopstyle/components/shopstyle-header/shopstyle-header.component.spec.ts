import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopstyleHeaderComponent } from './shopstyle-header.component';

describe('ShopstyleHeaderComponent', () => {
  let component: ShopstyleHeaderComponent;
  let fixture: ComponentFixture<ShopstyleHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShopstyleHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopstyleHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
