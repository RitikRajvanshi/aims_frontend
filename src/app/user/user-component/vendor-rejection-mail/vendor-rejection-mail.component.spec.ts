import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorRejectionMailComponent } from './vendor-rejection-mail.component';

describe('VendorRejectionMailComponent', () => {
  let component: VendorRejectionMailComponent;
  let fixture: ComponentFixture<VendorRejectionMailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorRejectionMailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorRejectionMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
