import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportItemWithPriceComponent } from './report-item-with-price.component';

describe('ReportItemWithPriceComponent', () => {
  let component: ReportItemWithPriceComponent;
  let fixture: ComponentFixture<ReportItemWithPriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportItemWithPriceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportItemWithPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
