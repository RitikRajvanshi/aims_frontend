import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { CheckService } from 'src/app/services/check.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent {
  isDataorNot: boolean = true;
  searchItem = '';
  //for add category
  addCategroryData = {
    category_name: '',
    modified_by: localStorage.getItem('login_id'),
    created_by: localStorage.getItem('login_id')
  }

  //for update desingation
  updateCategoryData = {
    category_name: '',
    modified_by: localStorage.getItem('login_id'),
    category_id: 0,
  }

  //for deletion purpose
  categoryId = {
    category_id: 0
  }

  addcategoryForm: any;
  categorydata: any;
  filteredcategorydata: any;
  itemData: any[] = [];
  displayaddCategory = false;          // for add button
  displaycategoryList = true;         // for update button
  toggleAddbtn = true;
  toggleListBtn = false;
  addCategorybtn = true;
  updateCategorybtn = false;


  addcategoryserviceResponse: any;
  updatecategoryserviceResponse: any;
  emptyDataList = [];
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];

  userRole = localStorage.getItem('level');

  currentdate: any;
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  sortingorder:any;
  
  constructor(private adminService: AdminService, private checkService: CheckService, private router: Router, private spinner: NgxSpinnerService) {

  }
  ngOnInit(): void {
    this.validation();
    this.getCategoryData();
  }

  async getCategoryData() {
    try {
      this.spinner.show();
      const results: any = await this.checkService.getCategorydatabystatus().pipe(
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
        const filteredResults = results.map((item: any) => {
          const splitcreateddate = item.created_date ? moment(item.created_date).format('DD-MM-YYYY') : null;
          return { ...item, created_date: splitcreateddate };
        });

        this.filteredcategorydata = filteredResults;
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
    finally {
      this.spinner.hide();

    }
  }

  updatecategory(data: any) {
    this.addCategorybtn = false;
    this.updateCategorybtn = true;
    this.displaycategoryList = false;
    this.displayaddCategory = true;
    this.toggleListBtn = true;
    this.toggleAddbtn = false;
    Swal.fire({
      title: 'Loading...',
      didOpen: () => {
        Swal.showLoading();
        setTimeout(() => {
          this.categoryId.category_id = data.category_id;
          this.addCategroryData.category_name = data.category_name;
          this.updateCategoryData.category_name = data.category_name;
          this.updateCategoryData.category_id = data.category_id;
          Swal.close();
        }, 500);
      }
    });

  }


  removecategory(id: any) {
    try {
      this.categoryId.category_id = id;
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
      }).then(async (result) => {
        if (result.isConfirmed) {
          const deactivateCategory: any = await this.checkService.deactivateCategoryStatuscheck(this.categoryId).toPromise();
          if (deactivateCategory?.deactivate_category_detail_check == 0) {
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
              'Category deleted successfully!',
              'success'
            ).then(() => {
              this.ngOnInit();
            })

          }
        }
        else if (
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Cancelled',
            'Category is not deleted :)',
            'error'
          ).then(() => {
            this.ngOnInit();
          })
        }
      })
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

  }


  async addCategoryfunc() {
    try {
      if (this.addcategoryForm.invalid) {
        this.addcategoryForm.controls['category_name'].markAsTouched();
      }

      else {
        const results: any = await this.adminService.addCategoryservice(this.addCategroryData).toPromise();
        this.addcategoryserviceResponse = JSON.parse(JSON.stringify(results)).message;
        if (this.addcategoryserviceResponse !== 'true') {
          Swal.fire({
            title: 'Success!',
            text: 'Category added successfully!',
            icon: 'success',
          }).then(() => {
            this.addcategoryForm.get('category_name')?.reset();
            this.ngOnInit();
          })
        }

        else {
          Swal.fire({
            icon: 'warning',
            title: 'Warning',
            text: 'This category is already present!',
          }).then(() => {
            this.ngOnInit();
          })

        }
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

  }

  async UpdateCategoryFunction() {
    try {
      if (this.addcategoryForm.invalid) {
        this.addcategoryForm.controls['category_name'].markAsTouched();
      }

      this.updateCategoryData.category_name = this.addCategroryData.category_name;
      const results: any = await this.adminService.updatecategoryservice(this.updateCategoryData).toPromise();
      this.updatecategoryserviceResponse = JSON.parse(JSON.stringify(results)).message;

      if (this.updatecategoryserviceResponse !== 'true') {
        Swal.fire({
          title: 'Success!',
          text: 'Category updated successfully!',
          icon: 'success',
        }).then((result) => {
          if (result.isConfirmed) {
            this.addcategoryForm.get('grp_name')?.reset();
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
        //   this.ngOnInit();
        // })
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
  }

  toggleActionAdd() {
    this.toggleListBtn = true;
    this.toggleAddbtn = false;
    this.displaycategoryList = false;
    this.displayaddCategory = true;
    this.addcategoryForm.reset();
  }

  toggleActionUpdate() {
    this.toggleListBtn = false;
    this.toggleAddbtn = true;
    this.displayaddCategory = false;
    this.displaycategoryList = true;

    this.addCategorybtn = true;
    this.updateCategorybtn = false;
    this.addcategoryForm.reset();
  }

  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }

  }

  // sort(columnName: string) {
  //   if (this.currentSortColumn === columnName) {
  //     this.isAscending = !this.isAscending; // Toggle sorting order
  //   } else {
  //     this.currentSortColumn = columnName; // Update current sort column
  //     this.isAscending = true; // Set sorting order to ascending for the new column
  //   }

  //   this.filteredcategorydata.sort((a: any, b: any) => {
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

    this.filteredcategorydata.sort((a: any, b: any) => {
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

  validation() {
    this.addcategoryForm = new FormGroup({
      category_name: new FormControl('', [Validators.required])
    })
  }

}
