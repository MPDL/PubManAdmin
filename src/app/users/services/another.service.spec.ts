import { TestBed, inject } from '@angular/core/testing';

import { AnotherService } from './another.service';

describe('AnotherService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnotherService]
    });
  });

  it('should be created', inject([AnotherService], (service: AnotherService) => {
    expect(service).toBeTruthy();
  }));
});
