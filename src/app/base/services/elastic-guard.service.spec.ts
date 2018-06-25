import { TestBed, inject } from '@angular/core/testing';

import { ElasticGuardService } from './elastic-guard.service';

describe('ElasticGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ElasticGuardService]
    });
  });

  it('should be created', inject([ElasticGuardService], (service: ElasticGuardService) => {
    expect(service).toBeTruthy();
  }));
});
