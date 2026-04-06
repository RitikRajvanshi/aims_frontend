import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentRejectionMailComponent } from './payment-rejection-mail.component';

describe('PaymentRejectionMailComponent', () => {
  let component: PaymentRejectionMailComponent;
  let fixture: ComponentFixture<PaymentRejectionMailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentRejectionMailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentRejectionMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
