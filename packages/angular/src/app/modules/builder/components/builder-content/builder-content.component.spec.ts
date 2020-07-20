import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuilderContentComponent } from './builder-content.component';

describe('BuilderContentComponent', () => {
  let component: BuilderContentComponent;
  let fixture: ComponentFixture<BuilderContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BuilderContentComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuilderContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
