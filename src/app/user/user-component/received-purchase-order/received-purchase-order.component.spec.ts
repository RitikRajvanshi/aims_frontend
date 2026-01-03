import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedPurchaseOrderComponent } from './received-purchase-order.component';

describe('ReceivedPurchaseOrderComponent', () => {
  let component: ReceivedPurchaseOrderComponent;
  let fixture: ComponentFixture<ReceivedPurchaseOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceivedPurchaseOrderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceivedPurchaseOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
