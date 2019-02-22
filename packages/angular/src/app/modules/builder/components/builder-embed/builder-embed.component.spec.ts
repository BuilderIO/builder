import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuilderEmbedComponent } from './builder-embed.component';

describe('BuilderEmbedComponent', () => {
  let component: BuilderEmbedComponent;
  let fixture: ComponentFixture<BuilderEmbedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuilderEmbedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuilderEmbedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
