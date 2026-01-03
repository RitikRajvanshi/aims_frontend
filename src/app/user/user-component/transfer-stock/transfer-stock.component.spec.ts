import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferStockComponent } from './transfer-stock.component';

describe('TransferStockComponent', () => {
  let component: TransferStockComponent;
  let fixture: ComponentFixture<TransferStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferStockComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
