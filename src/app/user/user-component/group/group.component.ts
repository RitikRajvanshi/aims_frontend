import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { CheckService } from 'src/app/services/check.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";
import { map } from 'rxjs';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent {
  isDataorNot: boolean = true;
  searchItem = '';

  //for add group
  grpData = {
    grp_name: '',
    modified_by: localStorage.getItem('login_id'),
    created_by: localStorage.getItem('login_id')
  }

  //for update group
  updategrpData = {
    grp_name: '',
    modified_by: localStorage.getItem('login_id'),
    grp_id: 0
  }

  //for deletion purpose
  grpId = {
    grp_id: 0
  }

  addgroupForm: any;
  grpdata: any;
  filteredgrpdata: any;
  itemData: any[] = [];
  displayaddgrp = false;      // for add button
  displayupdategrp = true;     // for update button
  toggleAddbtn = true;
  toggleListBtn = false;
  addGroupbtn = true;
  updateGroupbtn = false;
  addMessage: any;
  updateMessage: any;
  emptyDataList = [];
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];
  userRole = localStorage.getItem('level');
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  sortingorder:any;

  constructor(private adminService: AdminService, private checkService: CheckService, private router: Router, private spinner: NgxSpinnerService) {

  }

  ngOnInit(): void {
    this.validation();
    this.getGroupData();
  }


  async getGroupData() {
    try {
      this.spinner.show();
      const results: any = await this.checkService.getGroupdatabystatus().pipe(
        retry(3), // Retry the request up to 3 times
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching accepted requests:', error);
          return of([]); // Return an empty array if an error occurs
        })
      ).toPromise();

      if (results?.length == 0) {
        this.isDataorNot = false;
      }
      else {
        this.isDataorNot = true;
        const filteredResults: any = results.map((item: any) => {
          const splitcreateddate = item.created_date ? moment(item.created_date).format('DD-MM-YYYY') : null;
          return { ...item, created_date: splitcreateddate };
        });
        this.filteredgrpdata = filteredResults;
        console.log(this.filteredgrpdata, "this.filteredgrpdata")
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

  addGroupFunction() {
    // this.grpData.grp_name = data.grp_name
    if (this.addgroupForm.invalid) {
      this.addgroupForm.controls['grp_name'].markAsTouched();

    }
    else {
      //this.displayaddgrp is for for add button which will change to update button on click on edit from the list....
      this.adminService.addGroupService(this.grpData).subscribe(
        {
          next: (results: any) => {
            this.addMessage = JSON.parse(JSON.stringify(results)).message;

            if (this.addMessage !== 'true') {
              Swal.fire({
                title: 'Success!',
                text: 'Department added successfully!',
                icon: 'success',
              }).then(() => {
                this.addgroupForm.get('grp_name')?.reset();
                location.reload();
              })
            }

            else {
              Swal.fire({
                icon: 'warning',
                title: 'Warning',
                text: 'This department is already present!'
              })
            }
          },
          error: (error) => {
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
              // console.log('Other error:', error);
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

  updateGroupFunction() {
    if (this.addgroupForm.invalid) {
      this.addgroupForm.controls['grp_name'].markAsTouched();

    }
    else {
      // this.grpdata2.grp_name = data.grp_name
      this.updategrpData.grp_id = this.grpId.grp_id;
      this.updategrpData.grp_name = this.grpData.grp_name;

      this.adminService.updategroupData(this.updategrpData).subscribe(
        {
          next: (results: any) => {
            this.updateMessage = JSON.parse(JSON.stringify(results)).message;

            if (this.updateMessage !== 'true') {
              Swal.fire({
                title: 'Success!',
                text: 'Department updated successfully!',
                icon: 'success',
              }).then((result) => {
                if (result.isConfirmed) {
                  this.addgroupForm.get('grp_name')?.reset();
                  location.reload();
                }
              });
            }

            else {
              Swal.fire({
                icon: 'warning',
                title: 'Warning',
                 text: 'No changes detected!',
              })
              // .then(() => {
              //   location.reload();
              // })
            }
          },
          error: (error) => {
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


  toggleActionAdd() {
    this.toggleListBtn = true;
    this.toggleAddbtn = false;
    this.displayupdategrp = false;
    this.displayaddgrp = true;
    this.addgroupForm.reset();
  }

  toggleActionUpdate() {
    this.toggleListBtn = false;
    this.toggleAddbtn = true;
    this.displayaddgrp = false;
    this.displayupdategrp = true;
    this.addGroupbtn = true;
    this.updateGroupbtn = false;
    this.addgroupForm.reset();
  }

  updategrp(data: any) {
    this.addGroupbtn = false;
    this.updateGroupbtn = true;
    this.displayupdategrp = false;
    this.displayaddgrp = true;
    this.toggleListBtn = true;
    this.toggleAddbtn = false;

    Swal.fire({
      title: 'Loading...',
      didOpen: () => {
        Swal.showLoading();
        setTimeout(() => {
          this.grpData.grp_name = data.grp_name;
          this.grpId.grp_id = data.grp_id;
          Swal.close();
        }, 500);
      }
    });
  }

  removegrp(id: any) {
    this.grpId.grp_id = id;
    // console.log(this.grpId);
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

        this.checkService.deactivateGroupStatuscheck(this.grpId).subscribe(
          {
            next: (results: any) => {

              if (results[0].deactivate_group_detail_check == 0) {
                //this group is already present in other table(users), so can't be removed..
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: 'Sorry, deletion is not possible!',
                }).then(() => {
                  this.ngOnInit();
                })
              }
              else {
                swalWithBootstrapButtons.fire(
                  'Deleted!',
                  'Department deleted successfully!',
                  'success'
                ).then(() => {
                  this.ngOnInit();
                })
              }
            },
            error: (error) => {

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
                  text: 'Internal Server Error...',
                  footer: '<a href="../login">Please Login..</a>'
                }).then(() => {
                  this.router.navigate(['../login']);
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
          'Department is not deleted!',
          'error'
        ).then(() => {
          this.ngOnInit();
        })
      }
    })
  }

  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }

  ontableDatachange(event: any) {
    this.page = event;
    // this.getSystemData();
  }

   ontableSizechange(event: any): void {
    const Value = event.target.value
    // this.tableSize = ;
    if(Value == "All"){
      this.tableSize = +this.count;
    }
    else {
      // Otherwise, set the table size to the selected value
      this.tableSize = +Value;
    }

    this.page = 1;
    // this.getSystemData();
  }

  // sort(columnName: string) {
  //   if (this.currentSortColumn === columnName) {
  //     this.isAscending = !this.isAscending; // Toggle sorting order
  //   } else {
  //     this.currentSortColumn = columnName; // Update current sort column
  //     this.isAscending = true; // Set sorting order to ascending for the new column
  //   }

  //   this.filteredgrpdata.sort((a: any, b: any) => {
  //     let comparison = 0;
  //     const valueA = a[columnName];
  //     const valueB = b[columnName];

  //     // Handle null or undefined values
  //     if (valueA === null || valueA === undefined) {
  //       comparison = valueB === null || valueB === undefined ? 0 : -1;
  //     } else if (valueB === null || valueB === undefined) {
  //       comparison = 1;
  //     } else {
  //       if (this.isDate(valueA) && this.isDate(valueB)) {
  //         const dateA = moment(valueA);
  //         const dateB = moment(valueB);
  //         comparison = dateA.diff(dateB);
  //       } else if (this.isNumber(valueA) && this.isNumber(valueB)) {
  //         comparison = valueA - valueB;
  //       } else {
  //         comparison = valueA.toString().localeCompare(valueB.toString());
  //       }
  //     }

  //     return this.isAscending ? comparison : -comparison;
  //   });
  // }

  // isDate(value: any): boolean {
  //   return moment(value, moment.ISO_8601, true).isValid();
  // }

  // isNumber(value: any): boolean {
  //   return !isNaN(value);
  // }

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

    this.filteredgrpdata.sort((a: any, b: any) => {
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
    this.addgroupForm = new FormGroup({
      grp_name: new FormControl('', [Validators.required]),
    })
  }


}
