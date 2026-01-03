import { TestBed } from '@angular/core/testing';

import { CompanyRegistrationGuard } from './company-registration.guard';

describe('CompanyRegistrationGuard', () => {
  let guard: CompanyRegistrationGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CompanyRegistrationGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
