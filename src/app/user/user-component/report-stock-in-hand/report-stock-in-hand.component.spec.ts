import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportStockInHandComponent } from './report-stock-in-hand.component';

describe('ReportStockInHandComponent', () => {
  let component: ReportStockInHandComponent;
  let fixture: ComponentFixture<ReportStockInHandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportStockInHandComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportStockInHandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
