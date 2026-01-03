import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";


@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {

  constructor(private router: Router, private spinner: NgxSpinnerService) { }

  handleError(error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      if (error.status == 403) {
        // Handle token expired (HTTP 403)
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Token expired.',
          footer: '<a href="../login">Please login again!</a>'
        }).then(() => {
          this.router.navigate(['../login']);
        });
      }
      else {
        // Handle generic internal server error (HTTP 500 or others)
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Internal server error. Please try again later!',
          footer: '<a href="../login">Login</a>'
        }).then(() => {
          location.reload();
        });
      }
    }
    // Handle unknown errors
    Swal.fire({
      icon: 'error',
      title: 'Oops!',
      text: 'An unknown error occurred. Please try again later.'
    });
  }
}
