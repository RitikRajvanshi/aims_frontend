import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedRequestModalComponent } from './received-request-modal.component';

describe('ReceivedRequestModalComponent', () => {
  let component: ReceivedRequestModalComponent;
  let fixture: ComponentFixture<ReceivedRequestModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceivedRequestModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceivedRequestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
