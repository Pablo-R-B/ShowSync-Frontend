import { TestBed } from '@angular/core/testing';

import { GenerosMusicalesService } from './generos-musicales.service';

describe('GenerosMusicalesService', () => {
  let service: GenerosMusicalesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenerosMusicalesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
