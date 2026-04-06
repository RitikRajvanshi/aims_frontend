import { Component } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { CheckService } from 'src/app/services/check.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';


@Component({
  selector: 'app-designation',
  templateUrl: './designation.component.html',
  styleUrls: ['./designation.component.scss']
})
export class DesignationComponent {
  isDataorNot: boolean = true;
  searchItem = '';
  //for add designation
  designationData = {
    designation_name: '',
    modified_by: localStorage.getItem('login_id'),
    created_by: localStorage.getItem('login_id')
  }
  //for update desingation
  updatedesignationData = {
    designation_name: '',
    modified_by: localStorage.getItem('login_id'),
    designation_id: 0
  }
  //for deletion purpose
  designationId = {
    designation_id: 0
  }

  designationdata: any;
  filtereddesignationdata: any;
  itemData: any[] = [];
  addDesignationForm: any;
  displayDesignationForm = false;          // for add button
  displayDesignationList = true;         // for update button
  toggleAddbtn = true;
  toggleListBtn = false;
  addDesignbtn = true;
  updateDesignbtn = false;

  adddesingnationmessage: any;
  updatedesingnationmessage: any;
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
    this.getDesignationData();
  }

  async getDesignationData() {
    this.spinner.show();
    try {
      const results: any = await this.checkService.getDesingationdatabystatus().pipe(
        retry(3), // Retry the request up to 3 times
        // catchError((error: HttpErrorResponse) => {
        //   console.error('Error fetching accepted requests:', error);
        //   return of([]); // Return an empty array if an error occurs
        // })
      ).toPromise();

      if (results?.length == 0) {
        this.isDataorNot = false;
      }
      else {
        this.isDataorNot = true;
        const filteredResults = results.map((item: any) => {
            const splitcreateddate = item.designation_creation_date? moment(item.designation_creation_date).format('DD-MM-YYYY'): null;
            return { ...item, designation_creation_date: splitcreateddate };
        });
          this.filtereddesignationdata = filteredResults;
          this.count = filteredResults.length;
          this.itemData = filteredResults;
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
    finally{
       this.spinner.hide();
    }

  }


  updatedesign(data: any) {
    this.addDesignbtn = false;
    this.updateDesignbtn = true;
    this.displayDesignationList = false;
    this.displayDesignationForm = true;
    this.toggleListBtn = true;
    this.toggleAddbtn = false;

    Swal.fire({
      title: 'Loading...',
      didOpen: () => {
        Swal.showLoading();
        setTimeout(() => {
          this.designationId.designation_id = data.designation_id;
          this.designationData.designation_name = data.designation_name;
          Swal.close();
        }, 500);
      }
    });

  }


  designRemove(id: any) {
    this.designationId.designation_id = id;

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
        this.checkService.deactivateDesiginationStatuscheck(this.designationId).subscribe(
          {
            next: (results: any) => {

              if (results[0].deactivate_designation_detail_check == 0) {

                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: 'Sorry, deletion is not possible!',
                })
              }
              else {
                swalWithBootstrapButtons.fire(
                  'Deleted!',
                  'Desgination deleted successfully!',
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
                  title: 'Oops...',
                  text: 'Token expired..',
                  footer: '<a href="../login">Please Login..</a>'
                }).then(() => {
                  this.router.navigate(['../login']);
                })
              }
              else {
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: `Internal Server Error...`,
                  footer: '<a href="../login">Please Login..</a>'
                }).then(() => {
                  this.router.navigate(['../login']);
                })
              }
            }
          })

      } else if (

        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Designation is not deleted!',
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
    this.displayDesignationList = false;
    this.displayDesignationForm = true;
    this.addDesignationForm.reset();
  }

  toggleActionUpdate() {
    this.toggleListBtn = false;
    this.toggleAddbtn = true;
    this.displayDesignationForm = false;
    this.displayDesignationList = true;
    this.addDesignbtn = true;
    this.updateDesignbtn = false;
    this.addDesignationForm.reset();

  }

  addDesignationfunc() {
    if (this.addDesignationForm.invalid) {
      this.addDesignationForm.controls['designation_name'].markAsTouched();
      return;
    }
   
      this.adminService.addDesignationService(this.designationData).subscribe(
        {
          next: (results: any) => {
            this.adddesingnationmessage = JSON.parse(JSON.stringify(results)).adddesingnationmessage;

            if (this.adddesingnationmessage !== 'true') {
              Swal.fire({
                title: 'Success!',
                text: 'Desgination added successfully!',
                icon: 'success',
              }).then(() => {
                this.addDesignationForm.get('designation_name')?.reset();
                this.ngOnInit();
              })
            }

            else {
              Swal.fire({
                icon: 'warning',
                title: 'Warning',
                text: 'This designation is already present!',
              }).then(() => {
                this.ngOnInit();
              })
            }
          },
          error: (error) => {
            // console.log('error')
            if (error.status == 403) {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Token expired..',
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

  updateDesignationfunc() {

    if (this.addDesignationForm.invalid) {
      this.addDesignationForm.controls['designation_name'].markAsTouched();
    }
    this.updatedesignationData.designation_id = this.designationId.designation_id;
    this.updatedesignationData.designation_name = this.designationData.designation_name;

    this.adminService.updateDesingationData(this.updatedesignationData).subscribe(
      {
        next: (results: any) => {
          console.log(results, "updateDesignationfunc");
          this.updatedesingnationmessage = JSON.parse(JSON.stringify(results)).message;

          if (this.updatedesingnationmessage !== 'true') {
            Swal.fire({
              title: 'Success!',
              text: 'Designation updated successfully!',
              icon: 'success',
            });
            this.getDesignationData();
            return;
          }

            Swal.fire({
              icon: 'warning',
              title: 'Warning',
              text: 'No changes detected!',
            });

        },
        error: (error) => {
          // console.log('error')
          if (error.status == 403) {
            //  const expirationTime = error.error.expirationTime;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Token expired..',
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
    if(Value == "All"){
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

    this.filtereddesignationdata.sort((a: any, b: any) => {
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

  isDate(dateString:any): boolean {
    const isValidDate = moment(dateString, 'DD-MM-YYYY', true).isValid();
    return isValidDate;
  }

  isNumber(value: any): boolean {
    return !isNaN(value);
  }

  validation() {
    this.addDesignationForm = new FormGroup({
      designation_name: new FormControl('', [Validators.required])
    })
  }

}


