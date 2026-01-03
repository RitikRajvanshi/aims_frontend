import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportPendingStockComponent } from './report-pending-stock.component';

describe('ReportPendingStockComponent', () => {
  let component: ReportPendingStockComponent;
  let fixture: ComponentFixture<ReportPendingStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportPendingStockComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportPendingStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
