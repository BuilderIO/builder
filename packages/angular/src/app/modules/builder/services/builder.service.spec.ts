import { TestBed, inject } from '@angular/core/testing';

import { BuilderService } from './builder.service';

describe('BuilderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BuilderService],
    });
  });

  it('should be created', inject([BuilderService], (service: BuilderService) => {
    expect(service).toBeTruthy();
  }));
});
