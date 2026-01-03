import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoRejectionMailComponent } from './po-rejection-mail.component';

describe('PoRejectionMailComponent', () => {
  let component: PoRejectionMailComponent;
  let fixture: ComponentFixture<PoRejectionMailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoRejectionMailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoRejectionMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
