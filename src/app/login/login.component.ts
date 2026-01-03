import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from '../environments/environment.prod';
import { Observable, throwError, retry, firstValueFrom } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  // ViewChild decorator to get a reference to the input element
  @ViewChild('useremail', { static: false }) useremail!: ElementRef;

  isLoading: boolean = false;
  resContainer: any;
  container: any;
  container2: any;
  formLogin: any;
  rememberMe: boolean = false;
  user_email: string = '';
  user_password: string = '';
  showPassword: boolean = false; // Add this variable to your component
  companyLogo = '';
  companyName = '';
  companyData: any;

  constructor(private loginService: LoginService, private router: Router, private sharedService: SharedService, private spinner: NgxSpinnerService,
    public httpClient: HttpClient) { }

  ngOnInit(): void {
    this.validation();
    // this.getCompanyData();
    const rememberMePreference = localStorage.getItem('rememberMe');
    this.rememberMe = rememberMePreference === 'true';

    if (this.rememberMe) {
      this.user_email = localStorage.getItem('user_email') || '';
      this.user_password = localStorage.getItem('user_password') || '';
    }
  }

  healthysystem() {
    const timeoutValue = 5000;
    // Set a timeout of, for example, 5 seconds

    let url = environment.BASE_URL + 'health';
    return this.httpClient.get<any>(url).pipe(
      timeout(timeoutValue),
      retry(2), // Retry the request up to 2 times before failing
      catchError((error) => this.handleError(error))
    );
  }

  private handleError(error: any): Observable<never> {
    console.error(error);
    this.spinner.hide();

    Swal.fire({
      icon: 'error',
      title: 'Server is temporarily down!',
      text: 'Please try after some time!',
      footer: 'Please restart service again!',
    });

    // Return an observable with a user-facing error message
    return throwError('Something went wrong; please try again later.');
  }


  validation() {
    this.formLogin = new FormGroup({
      user_email: new FormControl('', [Validators.required]),
      user_password: new FormControl('', [Validators.required]),
    })
  }



  onSubmit(data: any) {
    if (this.formLogin.invalid) {
      this.formLogin.controls['user_email'].markAsTouched();
      this.formLogin.controls['user_password'].markAsTouched();
    }
    else {
      this.spinner.show();

      if (this.rememberMe) {
        // Store remember me preference and user credentials in local storage
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('user_email', this.user_email);
        localStorage.setItem('user_password', this.user_password);
      } else {
        // Remove remember me preference and user credentials from local storage
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_password');
      }

      this.healthysystem().subscribe((results: any) => {

        if (results) {

          this.loginService.userLogin(data).subscribe({
            next: (respond: any) => {
              this.spinner.hide();
              //normal user can not login
              if (respond.data && respond.data.level < 4) {
                this.resContainer = respond;

                //storing data in localStorage
                localStorage.setItem("Token", this.resContainer.token);

                if (this.resContainer.data !== undefined || null) {

                  localStorage.setItem('name', this.resContainer.data.user_name);
                  localStorage.setItem('login_id', this.resContainer.data.user_id);
                  localStorage.setItem('level', this.resContainer.data.level);

                  if (this.resContainer.message !== 0) {
                    if (this.resContainer.data.level == 1 || 2 || 3) {
                      this.router.navigate(['/user']);
                    }
                    else {
                      this.router.navigate(['/login']);
                    }

                  }
                }
                else {
                  this.spinner.hide();

                  Swal.fire({
                    icon: 'warning',
                    title: 'Oops...',
                    text: 'Invalid Email or Password..',
                  }).then(() => {
                    setTimeout(() => {
                      this.useremail.nativeElement.focus();

                    }, 500);
                  })

                }
              }
              else {
                Swal.fire({
                  icon: 'warning',
                  title: 'Access Denied!',
                  text: 'You are not authorized to access this application!',
                });
              }

            },
            error: (error) => {
              // this.spinner.hide();

              if (error.status == 403) {

                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: 'Token expired....',
                  footer: '<a href="../login">Please Login..</a>'
                }).then(() => {
                  this.router.navigate(['../login']);
                })
              }
              else {
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: 'Internal Server Error!',
                  footer: '<a href="../login">Please try after some time.</a>'
                }).then(() => {
                  this.router.navigate(['../login']);
                })
              }
            }

          })
        }
        else {
          console.error('Server Problem!')
        }
      })

    }
  }


  // private handleRememberMe(): void {
  //   if (this.rememberMe) {
  //     localStorage.setItem('rememberMe', 'true');
  //     localStorage.setItem('user_email', this.user_email);
  //     localStorage.setItem('user_password', this.user_password);
  //   } else {
  //     localStorage.removeItem('rememberMe');
  //     localStorage.removeItem('user_email');
  //     localStorage.removeItem('user_password');
  //   }
  // }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }


}
