import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomingItemDetailsComponent } from './incoming-item-details.component';

describe('IncomingItemDetailsComponent', () => {
  let component: IncomingItemDetailsComponent;
  let fixture: ComponentFixture<IncomingItemDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncomingItemDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomingItemDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
