import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportActiveSupplierComponent } from './report-active-supplier.component';

describe('ReportActiveSupplierComponent', () => {
  let component: ReportActiveSupplierComponent;
  let fixture: ComponentFixture<ReportActiveSupplierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportActiveSupplierComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportActiveSupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
