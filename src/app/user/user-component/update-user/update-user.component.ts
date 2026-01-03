import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { ActivatedRoute } from '@angular/router';
import { CheckService } from 'src/app/services/check.service';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.scss']
})
export class UpdateUserComponent {
  updateUserForm: any;

  userData = {
    "user_id": 0,
    "user_name": '',
    "user_password": '',
    "user_email": '',
    "grp_id": 0,
    "privilege_id": 0,
    "designation_id": 0,
    "modified_by": localStorage.getItem('login_id'),
  };

  userId = {
    user_id: 0
  }
  privilegeData: any;
  groupData: any;
  designationData: any;
  useridfromparams: any;
  userRole = localStorage.getItem('level');
  searchTerm:any;
  tableSize:any;
  page:any;

  constructor(private adminService: AdminService, private route: ActivatedRoute, private checkService: CheckService, private sharedService: SharedService, private router: Router) {

  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['searchTerm'] || '';
      this.page = +params['page'] || 1;
      this.tableSize = +params['tableSize']|| null ;
    });

    this.validation();

    Swal.fire({
      title: 'Loading...',
      didOpen: () => {
        Swal.showLoading();
        setTimeout(() => {
          Swal.close()
        }, 500);
      }
    }).then(() => {
      this.getuserDatafromparams();
    })

  }


  getuserDatafromparams() {
    this.route.params.subscribe({
      next: (params: any) => {
        this.useridfromparams = +params['id'];

        this.userId.user_id = this.useridfromparams;

        this.userData.user_id = this.useridfromparams;
        this.getUserdatabyId(this.userId);
      },
      error: (error) => {
        if (error.status == 403) {
          Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'Token expired.',
            footer: '<a href="../login">Please login again!</a>'
          }).then(() => {
            this.router.navigate(['../login']);
          })
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'Internal server error.Please try after some time!',
            footer: '<a href="../login">Login</a>'
          }).then(() => {
            location.reload();
          })
        }
      }
    })

    this.getAlldata();
  }


  async getAlldata() {
    try {
      const sortByProperty = (arr: any[], propertyName: string) => {
        return arr.sort((a, b) => {
          const itemA = a[propertyName].toUpperCase();
          const itemB = b[propertyName].toUpperCase();
          return itemA.localeCompare(itemB);
        });
      }

      const [privilegeData, groupData, designationData]:any =  
        await forkJoin([
        this.checkService.getPrivilegedatabystatus().pipe(
          retry(3), // Retry the request up to 3 times
          // catchError((error: HttpErrorResponse) => {
          //   console.error('Error fetching user data:', error);
          //   return of([]); // Return an empty array if an error occurs
          // })
        ),
        this.checkService.getGroupdatabystatus().pipe(
          retry(3), // Retry the request up to 3 times
          // catchError((error: HttpErrorResponse) => {
          //   console.error('Error fetching user data:', error);
          //   return of([]); // Return an empty array if an error occurs
          // })
        ),
        this.checkService.getDesingationdatabystatus().pipe(
          retry(3), // Retry the request up to 3 times
          // catchError((error: HttpErrorResponse) => {
          //   console.error('Error fetching user data:', error);
          //   return of([]); // Return an empty array if an error occurs
          // })
        ),
      ]).toPromise();

      this.privilegeData = sortByProperty(JSON.parse(JSON.stringify(privilegeData)), 'privilege_name');
      this.groupData = sortByProperty(JSON.parse(JSON.stringify(groupData)), 'grp_name');
      this.designationData = sortByProperty(JSON.parse(JSON.stringify(designationData)), 'designation_name');

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

  getUserdatabyId(userId: any) {
    this.sharedService.getUsersdatabyid(userId).subscribe({
      next: (results: any) => {
        this.userData.user_name = results[0]?.user_name;
        this.userData.user_email = results[0]?.user_email;
        // this.userData.user_password = results[0]?.user_password;
        this.userData.privilege_id = results[0]?.privilege_id;
        this.userData.grp_id = results[0]?.grp_id;
        this.userData.designation_id = results[0]?.designation_id;

      }, error: (error) => {
        if (error.status == 403) {
          Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'Token expired.',
            footer: '<a href="../login">Please login again!</a>'
          }).then(() => {
            this.router.navigate(['../login']);
          })
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'Internal server error.Please try after some time!',
            footer: '<a href="../login">Login</a>'
          }).then(() => {
            location.reload();
          })
        }
      }
    })
  }

  updateuser() {
    if (this.updateUserForm.invalid) {
      this.updateUserForm.controls['user_name'].markAsTouched();
      this.updateUserForm.controls['user_email'].markAsTouched();
      // this.updateUserForm.controls['user_password'].markAsTouched();
      this.updateUserForm.controls['privilege_id'].markAsTouched();
      this.updateUserForm.controls['grp_id'].markAsTouched();
      this.updateUserForm.controls['designation_id'].markAsTouched();
    }
    else {
      Swal.fire({
        title: 'Do you want to save the changes?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Save',
        denyButtonText: `Don't save`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          this.adminService.updateUser(this.userData).subscribe({
            next: (res: any) => {

              Swal.fire({
                title: 'Success!',
                text: 'User updated successfully!',
                icon: 'success',
              }).then((result: any) => {
                const swalWithBootstrapButtons = Swal.mixin({
                  customClass: {
                    confirmButton: 'btn btn-success text-light ml-2',
                    cancelButton: 'btn btn-danger text-light'
                  },
                  buttonsStyling: false
                })


                swalWithBootstrapButtons.fire({
                  title: 'You want to edit more?',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonText: 'Yes',
                  cancelButtonText: 'No',
                  reverseButtons: true
                }).then((result) => {
                  if (result.isConfirmed) {
                    location.reload();
                  } else if (
                    /* Read more about handling dismissals below */
                    result.dismiss === Swal.DismissReason.cancel
                  ) {
                    this.router.navigateByUrl('user/user-list');
                  }
                })
              })
            },
            error: (error) => {
              if (error.status == 403) {
                Swal.fire({
                  icon: 'error',
                  title: 'Oops!',
                  text: 'Token expired.',
                  footer: '<a href="../login">Please login again!</a>'
                }).then(() => {
                  this.router.navigate(['../login']);
                })
              }
              else {
                Swal.fire({
                  icon: 'error',
                  title: 'Oops!',
                  text: 'Internal server error.Please try after some time!',
                  footer: '<a href="../login">Login</a>'
                }).then(() => {
                  location.reload();
                })
              }
            }
          })
          Swal.fire('Saved!', '', 'success')
        } else if (result.isDenied) {
          Swal.fire('Changes are not saved', '', 'info')
        }

      })
    }
  }

  privilegeId(id: any) {
    this.userData.privilege_id = + id;

  }

  grpId(id: any) {
    this.userData.grp_id = + id;

  }

  designId(id: any) {
    this.userData.designation_id = + id;
  }

  navigateBack() {
      let variable = localStorage.getItem('backUrl');
      console.log(variable, "url");
      localStorage.removeItem('backUrl');
      console.log(localStorage.getItem('backUrl'));
      if(localStorage.getItem('backUrl')==null){
        this.router.navigateByUrl(`${variable}`);
      }
  }
  



  validation() {
    const emailPattern = '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,64}';
    this.updateUserForm = new FormGroup({
      user_name: new FormControl('', [Validators.required]),
      user_email: new FormControl('', [Validators.required, Validators.email, Validators.pattern(emailPattern)]),
      privilege_id: new FormControl(0, [Validators.pattern(/^(?=.*[1-9])[0-9]*[.,]?[0-9]{1,9}$/)]),
      grp_id: new FormControl(0, [Validators.pattern(/^(?=.*[1-9])[0-9]*[.,]?[0-9]{1,9}$/)]),
      designation_id: new FormControl(0, [Validators.pattern(/^(?=.*[1-9])[0-9]*[.,]?[0-9]{1,9}$/)])

    })
  }

}
