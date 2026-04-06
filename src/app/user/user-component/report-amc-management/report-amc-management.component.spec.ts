import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportAmcManagementComponent } from './report-amc-management.component';

describe('ReportAmcManagementComponent', () => {
  let component: ReportAmcManagementComponent;
  let fixture: ComponentFixture<ReportAmcManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportAmcManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportAmcManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
