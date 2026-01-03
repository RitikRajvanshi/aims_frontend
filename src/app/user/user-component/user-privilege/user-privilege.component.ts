import { Component } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { CheckService } from 'src/app/services/check.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { firstValueFrom, of } from 'rxjs';

@Component({
  selector: 'app-user-privilege',
  templateUrl: './user-privilege.component.html',
  styleUrls: ['./user-privilege.component.scss']
})
export class UserPrivilegeComponent {
  isDataorNot: boolean = true;
  //for addition purpose
  searchItem = '';
  privilegedata = {
    privilege_name: '',
    modified_by: localStorage.getItem('login_id'),
    level: 0,
    created_by: localStorage.getItem('login_id'),
  }

  //for updation purpose
  updateprivilegeData = {
    privilege_name: '',
    modified_by: localStorage.getItem('login_id'),
    privilege_id: 0,
    level: 0,
  }

  //for deletion purpose
  privilegeId = {
    privilege_id: 0
  }

  addPrivilegeForm: any;
  privilegeData: any;
  filteredprivilegeData: any;
  itemData: any[] = [];
  privilegeName: any;
  displayCategoyForm = false;          // for add button
  displayCategoyList = true;         // for update button
  toggleAddbtn = true;
  toggleListBtn = false;
  addPrivilegebtn = true;
  updatePrivilegebtn = false;       // for update button
  addprivilegeResponse: any;
  updateprivilegeResponse: any;
  emptyDataList = [];
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];
  userRole = localStorage.getItem('level');
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  sortingorder: any;

  constructor(private sharedService: SharedService, private adminService: AdminService, private checkService: CheckService, private router: Router, private spinner: NgxSpinnerService) {

  }

  ngOnInit(): void {
    this.validation();
    this.getPrivilegeData();
  }

  async getPrivilegeData() {
    this.spinner.show();

    try {
      const results: any = await this.checkService.getPrivilegedatabystatus().pipe(
        retry(3),
        // Retry the request up to 3 times
        // catchError((error: HttpErrorResponse) => {
        //   console.error('Error fetching accepted requests:', error);
        //   return of([]); // Return an empty array if an error occurs
        // })
      ).toPromise();

      if (results?.length == 0) {
        this.isDataorNot = false;
        this.spinner.hide();
      }
      else {
        this.isDataorNot = true;
        const filteredResults = results.map((item: any) => {
          const splitcreateddate = item.privilege_creation_date ? moment(item.privilege_creation_date).format('DD-MM-YYYY') : null;
          return { ...item, privilege_creation_date: splitcreateddate };
        });

        this.filteredprivilegeData = filteredResults;
        this.itemData = filteredResults;
        this.count = filteredResults.length;
      }

    }
    catch (error: unknown) {
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
    finally {
      this.spinner.hide();

    }
  }

  userlevel(value: number) {
    this.privilegedata.level = + value;
    this.updateprivilegeData.level = +value;
  }

  addPrivilegefunc() {
    if (this.addPrivilegeForm.invalid) {
      this.addPrivilegeForm.markAllAsTouched();
    }
    else {
      this.adminService.addPrvilegeService(this.privilegedata).subscribe(
        {
          next: (results: any) => {

            this.addprivilegeResponse = JSON.parse(JSON.stringify(results)).message;

            if (this.addprivilegeResponse !== 'true') {
              Swal.fire({
                title: 'Success!',
                text: 'Privilege added successfully!',
                icon: 'success',
              }).then(() => {
                this.addPrivilegeForm.reset({
                  privilege_name: '',
                  level: 0
                });
                this.ngOnInit();
              })
            }

            else {
              Swal.fire({
                icon: 'warning',
                title: 'Warning',
                text: 'This privilege is already present!',
              }).then(() => {
                this.ngOnInit();
              })
            }
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
    }
  }

  async updatePrivilegefunc() {
    this.updateprivilegeData.privilege_name = this.privilegedata.privilege_name;

    console.log(this.updateprivilegeData, "this.updateprivilegeData");

    try {
      const data = await firstValueFrom(this.adminService.updateprivilegeData(this.updateprivilegeData));
      this.updateprivilegeResponse = JSON.parse(JSON.stringify(data)).result?.update_privilege;

      if (Number(this.updateprivilegeResponse) == 1) {
        Swal.fire({
          title: 'Success!',
          text: 'Privilege updated successfully!',
          icon: 'success',
        }).then(() => {
          this.addPrivilegeForm.reset({
            privilege_name: '',
            level: 0
          })
          location.reload();
        })
      }

      else {
        Swal.fire({
          icon: 'warning',
          title: 'Warning',
          text: 'No changes detected!',
        });
      }

    } catch (error: unknown) {
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

  updateprivilege(data: any) {
    this.addPrivilegebtn = false;
    this.updatePrivilegebtn = true;
    this.displayCategoyList = false;
    this.displayCategoyForm = true;
    this.toggleListBtn = true;
    this.toggleAddbtn = false;

    Swal.fire({
      title: 'Loading...',
      didOpen: () => {
        Swal.showLoading();
        setTimeout(() => {
          this.privilegedata.privilege_name = data?.privilege_name
          this.privilegeId.privilege_id = data?.privilege_id
          this.privilegedata.level = data?.level;
          // this.privilegedata.privilege_name =  data.privilege_name;
          this.updateprivilegeData.privilege_id = data?.privilege_id;
          this.privilegeId.privilege_id = data?.privilege_id;
          this.updateprivilegeData.level = data?.level;
          this.updateprivilegeData.privilege_name = data?.privilege_name;
          Swal.close();
        }, 500);
      }
    });


  }

  privilegeRemove(id: any) {
    this.privilegeId.privilege_id = id;

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success ml-2 text-light',
        cancelButton: 'btn btn-danger text-light'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.checkService.deactivatePrivilegeStatuscheck(this.privilegeId).subscribe(

          {
            next: (results: any) => {

              if (results[0].deactivate_privilege_detail_check == 0) {

                Swal.fire({
                  icon: 'error',
                  title: 'Oops',
                  text: 'Sorry deletion can\'t be possible!',
                }).then(() => {
                  this.ngOnInit();
                })

              }
              else {
                swalWithBootstrapButtons.fire(
                  'Deleted!',
                  'Privilege deleted successfully!',
                  'success'
                ).then(() => {
                  this.ngOnInit();
                })

              }
            },
            error: (error) => {
              // console.log('error')
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

      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Privilege is not deleted!',
          'error'
        ).then(() => {
          this.ngOnInit();
        })
      }
    })
  }

  toggleActionAdd() {

    this.toggleListBtn = true;
    this.toggleAddbtn = false;
    this.displayCategoyList = false;
    this.displayCategoyForm = true;
    this.addPrivilegeForm.reset({
      privilege_name: '',
      level: 0
    })
  }

  toggleActionUpdate() {
    this.toggleListBtn = false;
    this.toggleAddbtn = true;
    this.displayCategoyForm = false;
    this.displayCategoyList = true;
    this.addPrivilegebtn = true;
    this.updatePrivilegebtn = false;
    this.addPrivilegeForm.reset({
      privilege_name: '',
      level: 0
    })
  }

  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }

  }

  ontableDatachange(event: any) {
    this.page = event;
  }

  ontableSizechange(event: any): void {
    const Value = event.target.value
    // this.tableSize = ;
    if (Value == "All") {
      this.tableSize = +this.count;
    }
    else {
      // Otherwise, set the table size to the selected value
      this.tableSize = +Value;
    }

    this.page = 1;
  }


  sort(columnName: string) {
    console.log(columnName, "columnName");
    if (this.currentSortColumn === columnName) {
      this.isAscending = !this.isAscending; // Toggle sorting order
    }
    else {
      this.currentSortColumn = columnName; // Update current sort column
      this.isAscending = this.isAscending ? this.isAscending : false; // Set sorting order to ascending for the new column
    }

    // Update sortingorder with the new column and sorting order
    this.sortingorder = `${columnName}-${this.isAscending ? 'asc' : 'desc'}`;

    this.filteredprivilegeData.sort((a: any, b: any) => {
      let comparison = 0;
      const valueA = a[columnName];
      const valueB = b[columnName];

      // Handle null or undefined values
      if (valueA === null || valueA === undefined) {
        comparison = valueB === null || valueB === undefined ? 0 : -1;
      } else if (valueB === null || valueB === undefined) {
        comparison = 1;
      } else {
        // console.log(valueA, valueB, "sorting")
        if (this.isDate(valueA) && this.isDate(valueB)) {
          // Parse dates using moment.js with strict parsing
          const dateA = moment(valueA, 'DD-MM-YYYY', true);
          const dateB = moment(valueB, 'DD-MM-YYYY', true);
          comparison = dateA.diff(dateB);

        } else if (this.isNumber(valueA) && this.isNumber(valueB)) {
          comparison = valueA - valueB;
        } else {
          comparison = valueA.toString().localeCompare(valueB.toString());
        }
      }

      return this.isAscending ? comparison : -comparison;
    });
  }

  isDate(dateString: any): boolean {
    const isValidDate = moment(dateString, 'DD-MM-YYYY', true).isValid();
    return isValidDate;
  }

  isNumber(value: any): boolean {
    return !isNaN(value);
  }


  validation() {

    this.addPrivilegeForm = new FormGroup({
      privilege_name: new FormControl('', [Validators.required]),
      level: new FormControl(0, [Validators.pattern(/^(?=.*[1-9])[0-9]*[.,]?[0-9]{1,9}$/)]),
    })
  }
}
