import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GatepassViewComponent } from './gatepass-view.component';

describe('GatepassViewComponent', () => {
  let component: GatepassViewComponent;
  let fixture: ComponentFixture<GatepassViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GatepassViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GatepassViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
