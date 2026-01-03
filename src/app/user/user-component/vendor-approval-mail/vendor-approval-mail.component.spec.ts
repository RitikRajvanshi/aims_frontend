import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorApprovalMailComponent } from './vendor-approval-mail.component';

describe('VendorApprovalMailComponent', () => {
  let component: VendorApprovalMailComponent;
  let fixture: ComponentFixture<VendorApprovalMailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorApprovalMailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorApprovalMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
