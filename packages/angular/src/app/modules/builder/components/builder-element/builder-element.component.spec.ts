import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuilderElementComponent } from './builder-element.component';

describe('BuilderElementComponent', () => {
  let component: BuilderElementComponent;
  let fixture: ComponentFixture<BuilderElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuilderElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuilderElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
