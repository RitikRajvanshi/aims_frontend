import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorEvaluationModalComponent } from './vendor-evaluation-modal.component';

describe('VendorEvaluationModalComponent', () => {
  let component: VendorEvaluationModalComponent;
  let fixture: ComponentFixture<VendorEvaluationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorEvaluationModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorEvaluationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
