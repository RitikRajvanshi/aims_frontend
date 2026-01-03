import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeDirectpurchaseOrderComponent } from './make-directpurchase-order.component';

describe('MakeDirectpurchaseOrderComponent', () => {
  let component: MakeDirectpurchaseOrderComponent;
  let fixture: ComponentFixture<MakeDirectpurchaseOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MakeDirectpurchaseOrderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MakeDirectpurchaseOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
