import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GatepassidListComponent } from './gatepassid-list.component';

describe('GatepassidListComponent', () => {
  let component: GatepassidListComponent;
  let fixture: ComponentFixture<GatepassidListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GatepassidListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GatepassidListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
