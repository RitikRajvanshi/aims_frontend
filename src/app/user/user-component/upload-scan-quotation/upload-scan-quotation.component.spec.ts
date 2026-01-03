import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadScanQuotationComponent } from './upload-scan-quotation.component';

describe('UploadScanQuotationComponent', () => {
  let component: UploadScanQuotationComponent;
  let fixture: ComponentFixture<UploadScanQuotationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadScanQuotationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadScanQuotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
