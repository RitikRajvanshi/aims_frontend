import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCompleteAssetComponent } from './report-complete-asset.component';

describe('ReportCompleteAssetComponent', () => {
  let component: ReportCompleteAssetComponent;
  let fixture: ComponentFixture<ReportCompleteAssetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportCompleteAssetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportCompleteAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
