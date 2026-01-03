import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportUploadDocumentComponent } from './report-upload-document.component';

describe('ReportUploadDocumentComponent', () => {
  let component: ReportUploadDocumentComponent;
  let fixture: ComponentFixture<ReportUploadDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportUploadDocumentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportUploadDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
