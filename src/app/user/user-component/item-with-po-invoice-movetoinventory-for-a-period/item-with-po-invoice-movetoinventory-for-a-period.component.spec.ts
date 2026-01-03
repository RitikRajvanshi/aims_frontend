import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemWithPoInvoiceMovetoinventoryForAPeriodComponent } from './item-with-po-invoice-movetoinventory-for-a-period.component';

describe('ItemWithPoInvoiceMovetoinventoryForAPeriodComponent', () => {
  let component: ItemWithPoInvoiceMovetoinventoryForAPeriodComponent;
  let fixture: ComponentFixture<ItemWithPoInvoiceMovetoinventoryForAPeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemWithPoInvoiceMovetoinventoryForAPeriodComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemWithPoInvoiceMovetoinventoryForAPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
