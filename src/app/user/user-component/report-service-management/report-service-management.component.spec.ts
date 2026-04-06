import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportServiceManagementComponent } from './report-service-management.component';

describe('ReportServiceManagementComponent', () => {
  let component: ReportServiceManagementComponent;
  let fixture: ComponentFixture<ReportServiceManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportServiceManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportServiceManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
