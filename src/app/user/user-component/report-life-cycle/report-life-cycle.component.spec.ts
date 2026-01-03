import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportLifeCycleComponent } from './report-life-cycle.component';

describe('ReportLifeCycleComponent', () => {
  let component: ReportLifeCycleComponent;
  let fixture: ComponentFixture<ReportLifeCycleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportLifeCycleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportLifeCycleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
