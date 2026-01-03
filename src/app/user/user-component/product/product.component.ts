import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { CheckService } from 'src/app/services/check.service';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";
import { firstValueFrom, forkJoin, map } from 'rxjs';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent {
  isDataorNot: boolean = true;
  searchItem = '';
  productData: {
    category_id: number,
    product_name: string,
    last_item_code: string,
    modified_by: string | null,
    is_asset: number | null,
    created_by: string | null,
    life_cycle: number | null
  }; // Allow number or null
  //for add product

  //for update product
  productData2: {
    category_id: number,
    product_name: string,
    modified_by: string | null,
    product_id: number,
    is_asset: number | null,
    life_cycle: number | null
  }

  //for deletion
  productId = {
    product_id: 0
  }

  productForm: any;
  categoryData: any;
  productdata: any;
  filteredproductdata: any;
  itemData: any[] = [];
  displayaddProduct = false;          // for add button
  displaycategoryList = true;         // for update button
  toggleAddbtn = true;
  toggleListBtn = false;
  addProductbtn = true;
  updateProductbtn = false;
  productServiceResponse: any;
  emptyDataList = [];
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];
  userRole = localStorage.getItem('level');
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  isChecked: boolean = false;
  isValid: boolean = true;
  private regex: RegExp = /^(?=.*[a-zA-Z].{4,})(?=^[^ ]*$)(?=.*-)(?=.*00$)[a-zA-Z0-9-]*$/;
  sortingorder: any;

  constructor(private adminService: AdminService, private checkService: CheckService, private sharedService: SharedService, private router: Router, private spinner: NgxSpinnerService) {
    this.productData = {
      category_id: 0,
      product_name: '',
      last_item_code: '',
      modified_by: localStorage.getItem('login_id'),
      is_asset: null as unknown as number,
      created_by: localStorage.getItem('login_id'),
      life_cycle: null
    }

    this.productData2 = {
      category_id: 0,
      product_name: '',
      modified_by: '' + localStorage.getItem('login_id'),
      product_id: 0,
      is_asset: null as unknown as number,
      life_cycle: null as unknown as number
    }
  }

  ngOnInit(): void {
    this.validation();
    this.getAlldata();
  }

  async getAlldata() {
    try {
      this.spinner.show();

      // Reusable sorting function
      const sortByProperty = (arr: any[], propertyName: string) => {
        return arr.sort((a, b) => {
          const itemA = a[propertyName].toUpperCase();
          const itemB = b[propertyName].toUpperCase();
          return itemA.localeCompare(itemB);
        });
      };
      const [categoryData, productdata]: any = await forkJoin([
        this.sharedService.getCategorydata().pipe(
          retry(3), // Retry the request up to 3 times
          // catchError((error: HttpErrorResponse) => {
          //   console.error('Error fetching accepted requests:', error);
          //   return of([]); // Return an empty array if an error occurs
          // })
        ),
        this.sharedService.getproductdatajoinbystatus().pipe(
          retry(3), // Retry the request up to 3 times
          // catchError((error: HttpErrorResponse) => {
          //   console.error('Error fetching accepted requests:', error);
          //   return of([]); // Return an empty array if an error occurs
          // })
        )
      ]).toPromise();

      this.categoryData = sortByProperty(JSON.parse(JSON.stringify(categoryData)), 'category_name');

      if (productdata?.length == 0) {
        this.isDataorNot = false;
      }
      else {
        this.isDataorNot = true;
        const filteredResults = productdata.map((item: any) => {
          const splitcreateddate = item.created_date ? moment(item.created_date).format('DD-MM-YYYY') : null;
          return { ...item, created_date: splitcreateddate };
        });

        this.filteredproductdata = filteredResults;
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

  categoryId(data: any) {
    this.productData.category_id = +data;
    this.productData2.category_id = +data;
  }

  isAsset(value: any) {
    if (value === 'null') { // Check if the user selected the "Select" option
      this.productData.is_asset = null as unknown as number; // Set is_asset to null
      this.productData2.is_asset = null as unknown as number; // Set is_asset to null
    } else {
      this.productData.is_asset = +value; // Convert the selected value to a number and assign it to is_asset
      this.productData2.is_asset = +value;
    }

  }

  addProductfunc() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
    }
    else if (!this.isValid) {
      this.productForm.markAllAsTouched();
    }
    else {

      this.adminService.addProductService(this.productData).subscribe(
        {
          next: (results: any) => {
            this.productServiceResponse = JSON.parse(JSON.stringify(results)).message;

            if (this.productServiceResponse !== 'true') {
              Swal.fire({
                title: 'Success!',
                text: 'Item added successfully!',
                icon: 'success',
              }).then(() => {
                this.productForm.get('category_name')?.reset();
                this.isChecked = false;
                this.productData = {
                  category_id: 0,
                  product_name: '',
                  last_item_code: '',
                  modified_by: '',
                  is_asset: null,
                  created_by: '',
                  life_cycle: null
                }
                this.ngOnInit();
              })

            }

            else {
              Swal.fire({
                icon: 'warning',
                title: 'Warning',
                text: 'This item is already present!',
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

  async UpdateProductFunction() {
    if (this.addProductbtn) {
      this.productForm.get('last_item_code').setValidators([Validators.required]);
    } else {
      this.productForm.get('last_item_code').clearValidators();
    }

    // Update the validity status of the form control after modifying validators
    this.productForm.get('last_item_code').updateValueAndValidity();

    if (this.productForm.invalid) {
      this.productForm.get('category_id').markAsTouched();
      this.productForm.get('product_name').markAsTouched();
    }
    else {
      this.productData2.product_name = this.productData.product_name;
      this.productData2.life_cycle = this.productData.life_cycle;
      this.productData2.is_asset = this.productData.is_asset;

      console.log(this.productData2, "this.productData2");

      try {

        const result: any = await firstValueFrom(this.adminService.updateProductservice(this.productData2));

        if (Number(result[0]?.update_product) == 1) {
          Swal.fire({
            title: 'Success!',
            text: 'Item updated successfully!',
            icon: 'success',
          }).then(() => {
            location.reload();
          });
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



      // 
      //   this.adminService.updateProductservice(this.productData2).subscribe(
      //     {
      //       next: (results: any) => {
      //         Swal.fire({
      //           title: 'Success!',
      //           text: 'Item updated successfully!',
      //           icon: 'success',
      //         }).then(() => {
      //           location.reload();
      //         });
      //       },
      //       error: (error) => {
      //         // console.log('error')
      //         if (error.status == 403) {
      //           Swal.fire({
      //             icon: 'error',
      //             title: 'Oops...',
      //             text: 'Token expired....',
      //             footer: '<a href="../login">Please Login..</a>'
      //           }).then(() => {
      //             this.router.navigate(['../login']);

      //           })
      //         }
      //         else {
      //           // console.log('Other error:', error);
      //           Swal.fire({
      //             icon: 'error',
      //             title: 'Oops...',
      //             text: 'Internal Server Error...',
      //             footer: '<a href="../login">Please Login..</a>'
      //           }).then(() => {
      //             this.router.navigate(['../login']);
      //           })
      //         }
      //       }
      //     })

    }
  }

  updateproduct(data: any) {
    console.log(data, "data");
    this.addProductbtn = false;
    this.updateProductbtn = true;
    this.displaycategoryList = false;
    this.displayaddProduct = true;
    this.toggleListBtn = true;
    this.toggleAddbtn = false;

    Swal.fire({
      title: 'Loading...',
      didOpen: () => {
        Swal.showLoading();
        setTimeout(() => {
          this.productId.product_id = data.product_id;
          this.productData2.product_name = data.product_name;
          this.productData2.category_id = data.category_id;
          this.productData2.product_id = data.product_id;
          this.productData.product_name = this.productData2.product_name;
          this.productData.category_id = data.category_id;
          this.productData.is_asset = data.is_asset;
          if (data.life_cycle) {
            const dataLifecycle = +data.life_cycle;
            console.log([12, 24, 36, 48, 60, 120].includes(dataLifecycle));
            if ([12, 24, 36, 48, 60, 120].includes(dataLifecycle)) {
              this.isChecked = false;
              this.productForm.get('life_cycle').enable();
            }
            else {
              this.isChecked = true;
              this.productForm.get('life_cycle').disable();
            }
          };
          this.productData.life_cycle = + data.life_cycle;
          this.productData2.life_cycle = + data.life_cycle;

          Swal.close();
        }, 500);
      }
    });

  }

  productRemove(id: any) {
    let data = {
      product_id: id
    }

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
        //below only deactivate the product only by making status 0
        this.checkService.deactivateProductStatuscheck(data).subscribe(
          {
            next: (results: any) => {
              swalWithBootstrapButtons.fire(
                'Deleted!',
                'Item deleted successfully!',
                'success'
              ).then(() => {
                this.ngOnInit();
              })
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
      else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Item is not deleted :)',
          'error'
        ).then(() => {
          this.ngOnInit();
        })
      }
    })

  }

  // sort(columnName: string) {
  //   if (this.currentSortColumn === columnName) {
  //     this.isAscending = !this.isAscending; // Toggle sorting order
  //   } else {
  //     this.currentSortColumn = columnName; // Update current sort column
  //     this.isAscending = true; // Set sorting order to ascending for the new column
  //   }

  //   this.filteredproductdata.sort((a: any, b: any) => {
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

    this.filteredproductdata.sort((a: any, b: any) => {
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

  toggleActionAdd() {

    this.toggleListBtn = true;
    this.toggleAddbtn = false;
    this.displaycategoryList = false;
    this.displayaddProduct = true;
    this.productForm.reset({
      product_name: '',
      category_id: 0,
      is_asset: null
    })
  }

  toggleActionUpdate() {
    this.toggleListBtn = false;
    this.toggleAddbtn = true;
    this.displayaddProduct = false;
    this.displaycategoryList = true;
    this.addProductbtn = true;
    this.updateProductbtn = false;
    this.productForm.reset({
      product_name: '',
      category_id: 0,
      is_asset: null
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

  checked() {
    this.isChecked = !this.isChecked;
    if (this.isChecked) {
      this.productForm.get('life_cycle').disable();
    }
    else {
      this.productForm.get('life_cycle').enable();
    }
  }

  preventDecimal(event: KeyboardEvent) {
    // Check if the pressed key is the dot (.) character
    if (event.key === '.') {
      event.preventDefault(); // Prevent the default action
    }
  }

  // Method to validate the input
  validateInput(event: any): void {
    const input = event.target.value;
    console.log(input);
    this.isValid = this.regex.test(input);
  }

  validation() {
    this.productForm = new FormGroup({
      product_name: new FormControl('', [Validators.required]),
      category_id: new FormControl(0, [Validators.pattern(/^(?=.*[1-9])[0-9]*[.,]?[0-9]{1,9}$/)]),
      last_item_code: new FormControl('', this.addProductbtn ? [Validators.required] : []),
      is_asset: new FormControl(null),
      life_cycle: new FormControl(null)
    })
  }
}
