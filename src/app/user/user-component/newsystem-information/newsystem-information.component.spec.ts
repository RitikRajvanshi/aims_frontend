import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsystemInformationComponent } from './newsystem-information.component';

describe('NewsystemInformationComponent', () => {
  let component: NewsystemInformationComponent;
  let fixture: ComponentFixture<NewsystemInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewsystemInformationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsystemInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
