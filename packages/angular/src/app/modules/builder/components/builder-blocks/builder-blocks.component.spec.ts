import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuilderBlocksComponent } from './builder-blocks.component';

describe('BuilderBlocksComponent', () => {
  let component: BuilderBlocksComponent;
  let fixture: ComponentFixture<BuilderBlocksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BuilderBlocksComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuilderBlocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
