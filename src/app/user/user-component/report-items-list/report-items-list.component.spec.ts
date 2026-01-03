import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportItemsListComponent } from './report-items-list.component';

describe('ReportItemsListComponent', () => {
  let component: ReportItemsListComponent;
  let fixture: ComponentFixture<ReportItemsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportItemsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportItemsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
