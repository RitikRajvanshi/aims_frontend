import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportItemWithLocationanduserComponent } from './report-item-with-locationanduser.component';

describe('ReportItemWithLocationanduserComponent', () => {
  let component: ReportItemWithLocationanduserComponent;
  let fixture: ComponentFixture<ReportItemWithLocationanduserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportItemWithLocationanduserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportItemWithLocationanduserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
