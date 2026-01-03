import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoApprovalMailComponent } from './po-approval-mail.component';

describe('PoApprovalMailComponent', () => {
  let component: PoApprovalMailComponent;
  let fixture: ComponentFixture<PoApprovalMailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoApprovalMailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoApprovalMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
