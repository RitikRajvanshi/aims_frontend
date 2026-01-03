import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportGoodsAndServicesComponent } from './report-goods-and-services.component';

describe('ReportGoodsAndServicesComponent', () => {
  let component: ReportGoodsAndServicesComponent;
  let fixture: ComponentFixture<ReportGoodsAndServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportGoodsAndServicesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportGoodsAndServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
