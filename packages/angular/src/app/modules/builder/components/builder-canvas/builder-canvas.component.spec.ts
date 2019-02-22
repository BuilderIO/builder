import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuilderCanvasComponent } from './builder-canvas.component';

describe('BuilderCanvasComponent', () => {
  let component: BuilderCanvasComponent;
  let fixture: ComponentFixture<BuilderCanvasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuilderCanvasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuilderCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
