import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadInspectionFormComponent } from './upload-inspection-form.component';

describe('UploadInspectionFormComponent', () => {
  let component: UploadInspectionFormComponent;
  let fixture: ComponentFixture<UploadInspectionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadInspectionFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadInspectionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
