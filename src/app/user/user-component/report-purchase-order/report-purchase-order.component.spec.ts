import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportPurchaseOrderComponent } from './report-purchase-order.component';

describe('ReportPurchaseOrderComponent', () => {
  let component: ReportPurchaseOrderComponent;
  let fixture: ComponentFixture<ReportPurchaseOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportPurchaseOrderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportPurchaseOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
