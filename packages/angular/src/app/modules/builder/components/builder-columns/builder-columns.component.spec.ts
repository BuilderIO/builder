import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuilderColumnsComponent } from './builder-columns.component';

describe('BuilderColumnsComponent', () => {
  let component: BuilderColumnsComponent;
  let fixture: ComponentFixture<BuilderColumnsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuilderColumnsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuilderColumnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
