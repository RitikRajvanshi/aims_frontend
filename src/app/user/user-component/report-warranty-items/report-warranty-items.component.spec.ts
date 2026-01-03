import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportWarrantyItemsComponent } from './report-warranty-items.component';

describe('ReportWarrantyItemsComponent', () => {
  let component: ReportWarrantyItemsComponent;
  let fixture: ComponentFixture<ReportWarrantyItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportWarrantyItemsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportWarrantyItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
