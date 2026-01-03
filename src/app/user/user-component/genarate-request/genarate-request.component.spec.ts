import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenarateRequestComponent } from './genarate-request.component';

describe('GenarateRequestComponent', () => {
  let component: GenarateRequestComponent;
  let fixture: ComponentFixture<GenarateRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenarateRequestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenarateRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
