import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportVendorEvaluationComponent } from './report-vendor-evaluation.component';

describe('ReportVendorEvaluationComponent', () => {
  let component: ReportVendorEvaluationComponent;
  let fixture: ComponentFixture<ReportVendorEvaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportVendorEvaluationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportVendorEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
