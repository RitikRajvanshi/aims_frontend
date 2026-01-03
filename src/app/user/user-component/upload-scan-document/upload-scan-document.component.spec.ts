import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadScanDocumentComponent } from './upload-scan-document.component';

describe('UploadScanDocumentComponent', () => {
  let component: UploadScanDocumentComponent;
  let fixture: ComponentFixture<UploadScanDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadScanDocumentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadScanDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
