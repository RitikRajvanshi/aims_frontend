import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportScrapedItemsComponent } from './report-scraped-items.component';

describe('ReportScrapedItemsComponent', () => {
  let component: ReportScrapedItemsComponent;
  let fixture: ComponentFixture<ReportScrapedItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportScrapedItemsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportScrapedItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
