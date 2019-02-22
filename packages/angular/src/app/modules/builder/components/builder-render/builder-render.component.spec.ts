import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuilderRenderComponent } from './builder-render.component';

describe('BuilderRenderComponent', () => {
  let component: BuilderRenderComponent;
  let fixture: ComponentFixture<BuilderRenderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuilderRenderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuilderRenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
