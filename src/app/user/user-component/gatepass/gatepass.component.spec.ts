import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GatepassComponent } from './gatepass.component';

describe('GatepassComponent', () => {
  let component: GatepassComponent;
  let fixture: ComponentFixture<GatepassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GatepassComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GatepassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
