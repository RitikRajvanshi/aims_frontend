import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovetoItsmComponent } from './moveto-itsm.component';

describe('MovetoItsmComponent', () => {
  let component: MovetoItsmComponent;
  let fixture: ComponentFixture<MovetoItsmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MovetoItsmComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovetoItsmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
