import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentApprovalMailComponent } from './payment-approval-mail.component';

describe('PaymentApprovalMailComponent', () => {
  let component: PaymentApprovalMailComponent;
  let fixture: ComponentFixture<PaymentApprovalMailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentApprovalMailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentApprovalMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
