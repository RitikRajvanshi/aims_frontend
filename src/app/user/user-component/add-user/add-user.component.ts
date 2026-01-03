import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { AdminService } from 'src/app/services/admin.service';
import { CheckService } from 'src/app/services/check.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent {

  respond: any;
  authdata: any;
  adduserForm: any;

  userData = {
    "user_name": '',
    "user_email": '',
    "grp_id": 0,
    "privilege_id": 0,
    "designation_id": 0,
    "modified_by": localStorage.getItem('login_id')
  };

  privilegedata: any;
  groupdata: any;
  designationdata: any;


  constructor(private adminSerivice: AdminService, private checkService: CheckService, private router: Router) { }

  ngOnInit(): void {
    this.validation();
    this.getAlldata();
  }


  async getAlldata() {
    try{
  // Reusable sorting function
  const sortByProperty = (arr: any[], propertyName: string) => {
    return arr.sort((a, b) => {
      const itemA = a[propertyName].toUpperCase();
      const itemB = b[propertyName].toUpperCase();
      return itemA.localeCompare(itemB);
    });
  };

  const [privilegedata, groupdata, designationdata]:any =
  await forkJoin([
    this.checkService.getPrivilegedatabystatus().pipe(
      retry(3), // Retry the request up to 3 times
      // catchError((error: HttpErrorResponse) => {
      //   console.error('Error fetching accepted requests:', error);
      //   return of([]); // Return an empty array if an error occurs
      // })
    ),
    this.checkService.getGroupdatabystatus().pipe(
      retry(3), // Retry the request up to 3 times
      // catchError((error: HttpErrorResponse) => {
      //   console.error('Error fetching accepted requests:', error);
      //   return of([]); // Return an empty array if an error occurs
      // })
    ),
    this.checkService.getDesingationdatabystatus().pipe(
      retry(3), // Retry the request up to 3 times
      // catchError((error: HttpErrorResponse) => {
      //   console.error('Error fetching accepted requests:', error);
      //   return of([]); // Return an empty array if an error occurs
      // })
    )
  ]).toPromise();

  this.privilegedata = sortByProperty(JSON.parse(JSON.stringify(privilegedata)), 'privilege_name');
  this.groupdata = sortByProperty(JSON.parse(JSON.stringify(groupdata)), 'grp_name');
  this.designationdata = sortByProperty(JSON.parse(JSON.stringify(designationdata)), 'designation_name');
    }
    catch(error:unknown){
      if (error instanceof HttpErrorResponse && error.status === 403) {   
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: 'Token expired.',
        footer: '<a href="../login">Please login again!</a>'
      }).then(() => {
        this.router.navigate(['../login']);
      });
    } else {
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
  }


  addUserfunction() {
    if (this.adduserForm.invalid) {
      this.adduserForm.controls['user_name'].markAsTouched();
      this.adduserForm.controls['user_email'].markAsTouched();
      this.adduserForm.controls['grp_id'].markAsTouched();
      this.adduserForm.controls['privilege_id'].markAsTouched();
      this.adduserForm.controls['designation_id'].markAsTouched();
    }
    else {
      this.adminSerivice.addUser(this.userData).subscribe(
        {
          next: (results: any) => {
            this.respond = JSON.parse(JSON.stringify(results[0])).adduser;
            if (this.respond !== 'Invalid token Access') {

              if (this.respond == 0) {
                Swal.fire({
                  title: 'Success!',
                  text: 'User added successfully!',
                  icon: 'success',
                }).then(() => {
                  this.ngOnInit();
                })
              }

              else {
                Swal.fire({
                  icon: 'warning',
                  title: 'Warning',
                  text: 'This email id is already registered!',
                }).then(() => {
                  this.ngOnInit();
                })

              }
            }
            else {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Token expired. Please login..',
                footer: '<a href="../login">Login..</a>'
              }).then(() => {
                this.router.navigate(['../login']);
              })


            }
          },
          error: (error) => {
            if (error.status == 403) {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Token expired. Please login..',
                footer: '<a href="../login">Please Login..</a>'
              }).then(() => {
                this.router.navigate(['../login']);
              })
            }
            else {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Internal Server Error...',
                footer: '<a href="../login">Please Login..</a>'
              }).then(() => {
                this.router.navigate(['../login']);
              })
            }
          }
        })
    }
  }


  privilageId(id: any) {
    this.userData.privilege_id = + id;
  }

  grpId(id: any) {
    this.userData.grp_id = + id;
  }

  designId(id: any) {
    this.userData.designation_id = + id;
  }

  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.keyCode === 32) {
      event.preventDefault();
    }

  }

  validation() {
    const emailPattern = '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,64}';

    this.adduserForm = new FormGroup({
      user_name: new FormControl(null, [Validators.required]),
      user_email: new FormControl(null, [Validators.required, Validators.pattern(emailPattern)]),
      privilege_id: new FormControl(0, [Validators.pattern(/^(?=.*[1-9])[0-9]*[.,]?[0-9]{1,9}$/)]),
      grp_id: new FormControl(0, [Validators.pattern(/^(?=.*[1-9])[0-9]*[.,]?[0-9]{1,9}$/)]),
      designation_id: new FormControl(0, [Validators.pattern(/^(?=.*[1-9])[0-9]*[.,]?[0-9]{1,9}$/)])

    })
  }
}
