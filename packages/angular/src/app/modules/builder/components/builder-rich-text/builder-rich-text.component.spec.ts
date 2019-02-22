import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuilderRichTextComponent } from './builder-rich-text.component';

describe('BuilderRichTextComponent', () => {
  let component: BuilderRichTextComponent;
  let fixture: ComponentFixture<BuilderRichTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuilderRichTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuilderRichTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
