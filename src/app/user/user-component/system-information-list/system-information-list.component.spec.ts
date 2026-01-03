import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemInformationListComponent } from './system-information-list.component';

describe('SystemInformationListComponent', () => {
  let component: SystemInformationListComponent;
  let fixture: ComponentFixture<SystemInformationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemInformationListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemInformationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
