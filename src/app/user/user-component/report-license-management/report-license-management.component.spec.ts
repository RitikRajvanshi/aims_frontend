import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportLicenseManagementComponent } from './report-license-management.component';

describe('ReportLicenseManagementComponent', () => {
  let component: ReportLicenseManagementComponent;
  let fixture: ComponentFixture<ReportLicenseManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportLicenseManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportLicenseManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
