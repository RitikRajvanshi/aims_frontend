import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let loginService: LoginService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        {
          provide: LoginService,
          useValue: {
            userLogin: jasmine.createSpy('userLogin').and.returnValue(of({
              token: '12345',
              data: { user_name: 'John', user_id: 1, level: 1 },
              message: 1,
            })),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    loginService = TestBed.inject(LoginService);
    router = TestBed.inject(Router);
    fixture.detectChanges();

    // Mock the healthysystem method
    // spyOn(component, 'healthysystem').and.returnValue(of(true));
  });


  it('should create the component and initialize the controls', () => {
    component.ngOnInit();
    expect(component.formLogin).toBeDefined();
    expect(component.formLogin.controls['user_email']).toBeDefined();
    expect(component.formLogin.controls['user_password']).toBeDefined();
  });

  // it('should mark user_email and user_password as invalid when empty on submit',()=>{
  //   component.formLogin.controls['user_email'].setValue('');
  //   component.formLogin.controls['user_password'].setValue('');
  //   expect(component.formLogin.valid).toBeFalse();
  // })

  // test1
  it('should have invalid form when inputs are empty', () => {
    component.formLogin.controls['user_email'].setValue('');
    component.formLogin.controls['user_password'].setValue('');
    expect(component.formLogin.invalid).toBeTruthy();
  });

  // test2
  it('should validate email and password as required', () => {
    component.formLogin.controls['user_email'].setValue('');
    component.formLogin.controls['user_password'].setValue('');
    component.onSubmit(component.formLogin.value);

    expect(component.formLogin.controls['user_email'].touched).toBeTruthy();
    expect(component.formLogin.controls['user_password'].touched).toBeTruthy();
  });

  // test3
  it('should call loginService on valid form submission', fakeAsync(() => {
    component.formLogin.controls['user_email'].setValue('amit.tewari');
    component.formLogin.controls['user_password'].setValue('123');

    // Mock the healthysystem method
    spyOn(component, 'healthysystem').and.returnValue(of(true));
    // Simulate the passage of time for async calls
    tick();

    // component.onSubmit()
    component.onSubmit(component.formLogin.value);

    expect(loginService.userLogin).toHaveBeenCalledWith({
      user_email: 'amit.tewari',
      user_password: '123'
    });
  })
  )


  // it('should validate email', () => {
  //   spyOn(SweetAlert, 'default')
  // });
});

