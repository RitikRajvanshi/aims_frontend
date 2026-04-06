import { Component } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { AdminService } from 'src/app/services/admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { NgxSpinnerService } from "ngx-spinner";
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { PurchaseOrderViewComponent } from '../purchase-order-view/purchase-order-view.component';
import { FilesService } from 'src/app/services/files.service';

@Component({
  selector: 'app-purchase-order-list',
  templateUrl: './purchase-order-list.component.html',
  styleUrls: ['./purchase-order-list.component.scss']
})
export class PurchaseOrderListComponent {
  emptyDataList = [];
  isDataorNot: boolean = true;
  userRole = localStorage.getItem('level');

  purchaseData: any = [];
  purchaseDataacceptorReject: any = [];
  purchaseId = {
    purchase_id: ''
  }
  sentResponse: any;

  searchItem = '';
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];
  lastfinnancialyrDate: any;
  nextfinnancialyrDate: any;
  previousUrl: any;

  itemsData: any[] = [];
  itemsDataAcceptedorrejected: any[] = [];
  filteredpoData: any[] = [];
  filteredpoDataAcceptedorrejected: any[] = [];
  searchTerm: string = '';
  totalItems: number = 0;
  podatabydate = {
    start_date: '',
    end_date: ''
  };
  currentdate: any;
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  isRotating: boolean = false;
  private isNavigatedBack: boolean = false; // Flag to check navigation source
  sortingorder: any;
  isDirectPurchase: boolean = false;
  mode: string = '';
  showDiscountModal = false;

  selectedPO: any = null;

  discountModal = {
    grandTotal: 0,
    currency: '₹',
    type: 'rs',
    value: 0,
    percent: 0,
    finalTotal: 0
  };

  originalDiscountValue: number = 0;
  originalDiscountType: string = 'rs';
  isitemLeveldiscount:boolean = false;
  isExistingDiscount = false;

  private round2(n: number): number {
    const val = Math.round((n + Number.EPSILON) * 100) / 100;
    return val === 0 ? 0 : val;
  }

  constructor(private sharedService: SharedService, private adminService: AdminService, private router: Router, private location: Location, private spinner: NgxSpinnerService, private activatedRoute: ActivatedRoute, private dialog: MatDialog, private fileService: FilesService) {
    const today = moment();
    this.currentdate = today.format('YYYY-MM-DD');
    console.log(this.currentdate, "this.currentdate");
    console.log(this.userRole, "userRole")
  }

  ngOnInit(): void {
    this.statemanagement();
    this.getpurchaseData();
    this.getPurchasefulldata();
  }

  statemanagement() {
    this.isNavigatedBack = localStorage.getItem('navigated') === 'true';
    localStorage.removeItem('navigated');
    this.activatedRoute.queryParams.subscribe(async (params: any) => {
      // console.log(params['sort'].split('-'), "sortsplit");
      if (this.isNavigatedBack === true) {
        if (params['searchTerm'] && params['searchTerm'] !== '') {
          this.searchTerm = params['searchTerm'];
        }
        if (params['from'] && params['from'] !== '' && params['to'] && params['to'] !== '') {
          this.podatabydate.start_date = params['from'];
          this.podatabydate.end_date = params['to'];
        }

        setTimeout(() => {
          // Call the filter method to apply the saved state
          this.filterData();

          if (params['page'] && params['page'] !== null) {
            this.page = +params['page'];
          }
          if (params['tableSize'] && params['tableSize'] !== null) {
            this.tableSize = +params['tableSize'];
            console.log(this.tableSize);
          }

          if (params['sort'] && params['sort'] !== '') {
            const [column, sortParams] = params['sort'].split('-');
            console.log(params['sort'].split('-')[1]);
            const ascending = sortParams === 'asc' ? true : false;
            this.isAscending = ascending;
            // Ensure sortingorder is set properly when restoring state
            this.sortingorder = `${column}-${this.isAscending}`;
            this.sort(column);
          }
        }, 800)
      }
      else {

        console.log('notnavigated')
        // Remove all query params when isNavigatedBack is false
        this.router.navigate([], {
          relativeTo: this.activatedRoute, // Navigate relative to the current route
          queryParams: {}, // Empty object to clear the query parameters
          queryParamsHandling: '' // Explicitly state that no query params should be handled
        });
      }
    });

    this.isNavigatedBack === false;
  }

  async getpurchaseData() {
    this.spinner.show();
    try {
      const results: any = await this.sharedService.getpurchasedatathatareacceptorreject().pipe(
        retry(3), // Retry the request up to 3 times
        // catchError((error: HttpErrorResponse) => {
        //   console.error('Error fetching accepted requests:', error);
        //   return of([]); // Return an empty array if an error occurs
        // })
      ).toPromise();

      console.log(results, "getpurchaseData");

      if (results?.length == 0) {
        this.isDataorNot = false;
      }
      else {
        // console.log()
        this.isDataorNot = true;
        const filteredResults = results.map((item: any) => {
          const splitcreateddate = item.created_date ? moment(item.created_date).format('DD-MM-YYYY') : null;
          const splitmodifieddate = item.modified_date ? moment(item.modified_date).format('DD-MM-YYYY') : null;
          const splitsentdata = item.sent_date ? moment(item.sent_date).format('DD-MM-YYYY') : null;
          const splitpoapprovaldate = item.po_approval_date ? moment(item.po_approval_date).format('DD-MM-YYYY') : null;
          if (item.po_approval_date) {

            return { ...item, created_date: splitcreateddate, modified_date: splitmodifieddate, sent_date: splitsentdata, po_approval_date: splitpoapprovaldate };
          }

          else {
            return { ...item, created_date: splitcreateddate, modified_date: splitmodifieddate, sent_date: splitsentdata };
          }
        });
        this.filteredpoDataAcceptedorrejected = filteredResults;
        this.itemsDataAcceptedorrejected = filteredResults;
        // this.count = filteredResults.length;
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

  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }


  async getPurchasefulldata() {
    this.spinner.show();
    try {
      const results: any = await this.sharedService.getpurchaseorderdata().pipe(
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

        console.log(results, "result before filtering");

        const filteredResults = results.map((item: any) => {
          const isDirectPurchase = (item.purchase_id).startsWith('DP-');
          const splitcreateddate = item.created_date ? moment(item.created_date).format('DD-MM-YYYY') : null;
          const splitmodifieddate = item.modified_date ? moment(item.modified_date).format('DD-MM-YYYY') : null;
          const splitsentdata = item.sent_date ? moment(item.sent_date).format('DD-MM-YYYY') : null;
          const splitpoapprovaldate = item.po_approval_date ? moment(item.po_approval_date).format('DD-MM-YYYY') : null;


          if (item.po_approval_date) {
            return { ...item, created_date: splitcreateddate, modified_date: splitmodifieddate, sent_date: splitsentdata, po_approval_date: splitpoapprovaldate, isDirectPurchase: isDirectPurchase };
          }
          else {
            return { ...item, created_date: splitcreateddate, modified_date: splitmodifieddate, sent_date: splitsentdata, isDirectPurchase: isDirectPurchase };
          }
        });

        console.log(filteredResults, "getpurchaseorderdata");

        this.filteredpoData = filteredResults;
        this.itemsData = filteredResults;
        this.count = filteredResults.length;
        // console.log(this.filteredpoData, "this.filteredpoData");
      }
    }
    catch (error: unknown) {
      this.spinner.hide();
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

  //   async filterData(): Promise<void> {
  //     // If the originalData is not set, initialize it with the current itemsData
  //     if (!this.itemsData) {
  //       this.itemsData = this.itemsData;
  //     }
  //     // Start with the original data or the previously filtered data
  //     let filteredData: any[] = this.itemsData;

  //       // 🔹 Filter by mode
  //   if (this.mode !== '' && this.mode !== undefined && this.mode !== null) {
  //     filteredData = filteredData.filter(item => item.category?.toString() === this.mode.toString());
  //   }

  //     // // Filter by search term
  //     // if (this.searchTerm) {
  //     //   if (this.userRole !== '1') {
  //     //     filteredData = filteredData.filter((item: any) => {
  //     //       return Object.keys(item).some(key => {
  //     //         if (item[key] !== null && item[key] !== '' && key === 'created_date') {
  //     //           return item[key]?.includes(this.searchTerm);
  //     //         } else if (item[key] !== null && item[key] !== '') {
  //     //           return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
  //     //         }
  //     //         return false;
  //     //       });
  //     //     });
  //     //   }
  //     //   else {
  //     //     filteredData = filteredData.filter((item: any) => {
  //     //       return Object.keys(item).some(key => {
  //     //         if (item[key] !== null && item[key] !== '' && key === 'created_date' || key === 'po_approval_date') {

  //     //           return item[key]?.includes(this.searchTerm);

  //     //         } else if (item[key] !== null && item[key] !== '') {
  //     //           return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
  //     //         }
  //     //         return false;
  //     //       });
  //     //     });
  //     //   }
  //     // }

  //     if (this.searchTerm) {
  //   const term = this.searchTerm.toLowerCase();

  //   if (this.userRole !== '1') {
  //     // For non-admin users
  //     filteredData = filteredData.filter((item: any) => {
  //       return Object.keys(item).some(key => {
  //         if (item[key] !== null && item[key] !== '' && key === 'created_date') {
  //           return item[key]?.includes(this.searchTerm);
  //         }
  //         else if (item[key] !== null && item[key] !== '') {
  //           return item[key].toString().toLowerCase().includes(term);
  //         }
  //         return false;
  //       });
  //     });
  //   }

  //   else {
  //     // For userRole = 1 (Admin)
  //     filteredData = filteredData.filter((item: any) => {
  //       return Object.keys(item).some(key => {

  //         // ⭐ Correct date condition with proper brackets
  //         if (
  //           item[key] !== null &&
  //           item[key] !== '' &&
  //           (key === 'created_date' || key === 'po_approval_date')
  //         ) {
  //           return item[key]?.includes(this.searchTerm);
  //         }

  //         // ⭐ All other fields including category
  //         else if (item[key] !== null && item[key] !== '') {
  //           return item[key].toString().toLowerCase().includes(term);
  //         }

  //         return false;
  //       });
  //     });
  //   }
  // }


  //     // Filter by date range only if there is a valid date range
  //     if (this.podatabydate?.start_date && this.podatabydate?.end_date) {
  //       if (this.podatabydate.start_date <= this.podatabydate.end_date) {
  //         filteredData = filteredData.filter((item: any) => {
  //           const filteredcreateddate = moment(item?.created_date, 'DD-MM-YYYY').format('YYYY-MM-DD');
  //           if (filteredcreateddate) {
  //             return filteredcreateddate >= this.podatabydate.start_date &&
  //               filteredcreateddate <= this.podatabydate.end_date;
  //           }
  //           return false;
  //         });
  //       } else {
  //         Swal.fire({
  //           title: 'Warning',
  //           text: 'End date should be later than start date.',
  //           icon: 'warning'
  //         });
  //         // If there's a date range error, return an empty array to show no results
  //         filteredData = [];
  //       }
  //     }

  //     // Update filtered data and totalItems
  //     this.filteredpoData = filteredData;
  //     this.totalItems = this.filteredpoData.length;
  //     this.count = filteredData.length;
  //     this.page = 1; // Reset to the first page when filtering occurs
  //   }

  filterData() {
    let dataToFilter;

    // Decide dataset based on userRole
    if (this.userRole === '1') {
      dataToFilter = [...this.itemsDataAcceptedorrejected];   // approved/rejected only
    } else {
      dataToFilter = [...this.itemsData];                     // full data
    }

    const start = this.podatabydate.start_date
      ? new Date(this.podatabydate.start_date)
      : null;

    const end = this.podatabydate.end_date
      ? new Date(this.podatabydate.end_date)
      : null;

    const mode = this.mode; // '' | '1' | '0'
    const search = this.searchTerm ? this.searchTerm.toLowerCase() : '';

    this.filteredpoData = dataToFilter.filter((item) => {
      const createdDate = item.created_date
        ? new Date(item.created_date.split('-').reverse().join('-'))
        : null;

      // DATE FILTER
      if (start && createdDate && createdDate < start) return false;
      if (end && createdDate && createdDate > end) return false;

      // CATEGORY FILTER
      if (mode !== '' && item.category?.toString() !== mode.toString()) return false;

      // SEARCH FILTER
      if (search) {
        const categoryText = item.category?.toString() === '1' ? 'Online' : 'Offline';
        const matches =
          item.purchase_id?.toLowerCase().includes(search) ||
          item.supplier_name?.toLowerCase().includes(search) ||
          categoryText.toLowerCase().includes(search);

        if (!matches) return false;
      }

      return true;
    });

    // For userRole == 1 (approved/rejected view)
    if (this.userRole === '1') {
      this.filteredpoDataAcceptedorrejected = this.filteredpoData;
    }
  }




  // refreshfilter() {
  //   this.isRotating = true;
  //   this.getPurchasefulldata().then(() => {
  //     // Clear date filters
  //     if (this.podatabydate?.start_date || this.podatabydate?.end_date) {
  //       this.podatabydate.start_date = '';
  //       this.podatabydate.end_date = '';
  //     }

  //     // If the originalData is not set, initialize it with the current itemsData
  //     if (!this.itemsData) {
  //       this.itemsData = this.itemsData;
  //     }

  //     // Start with the original data or the previously filtered data
  //     let filteredData: any[] = this.itemsData;

  //     // // Filter by search term
  //     if (this.searchTerm) {
  //       if (this.userRole !== '1') {
  //         filteredData = filteredData.filter((item: any) => {
  //           return Object.keys(item).some(key => {
  //             if (item[key] !== null && item[key] !== '' && key === 'created_date') {
  //               return item[key]?.includes(this.searchTerm);
  //             } else if (item[key] !== null && item[key] !== '') {
  //               return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
  //             }
  //             return false;
  //           });
  //         });
  //       }
  //       else {
  //         filteredData = filteredData.filter((item: any) => {
  //           return Object.keys(item).some(key => {
  //             if (item[key] !== null && item[key] !== '' && key === 'created_date' || key === 'po_approval_date') {

  //               return item[key]?.includes(this.searchTerm);

  //             } else if (item[key] !== null && item[key] !== '') {
  //               return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
  //             }
  //             return false;
  //           });
  //         });
  //       }
  //     }
  //     // Update filtered data and totalItems
  //     this.filteredpoData = filteredData;
  //     this.totalItems = this.filteredpoData.length;
  //     this.mode = '';
  //     this.page = 1; // Reset to the first page when filtering occurs
  //     setTimeout(() => {
  //       this.isRotating = false;
  //     }, 500);
  //   });
  // }

  refreshfilter() {
    this.isRotating = true;

    const refreshPromise = this.userRole === '1'
      ? this.getpurchaseData()       // approved/rejected data
      : this.getPurchasefulldata();  // full data

    refreshPromise.then(() => {
      // Clear date filters
      if (this.podatabydate) {
        this.podatabydate.start_date = '';
        this.podatabydate.end_date = '';
      }

      // Reset mode and page
      this.mode = '';
      this.page = 1;

      // Reset filtered data based on userRole
      if (this.userRole === '1') {
        this.filteredpoDataAcceptedorrejected = [...this.itemsDataAcceptedorrejected];
      } else {
        this.filteredpoData = [...this.itemsData];
      }

      // Reset searchTerm and reapply if needed
      const searchTerm = this.searchTerm;
      this.searchTerm = '';
      if (searchTerm) {
        this.searchTerm = searchTerm;
        this.filterData(); // reuse existing filtering logic
      }

      setTimeout(() => {
        this.isRotating = false;
      }, 500);
    });
  }


  sendOrder(data: any) {
    this.purchaseId.purchase_id = data;

    this.adminService.updateSentinpurchaseOrder(this.purchaseId).subscribe(
      {
        next: async (results: any) => {
          this.sentResponse = results;
          await Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'PO sent for approval!',
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            this.ngOnInit();
          })
        }, error: (error) => {
          // console.log('error')
          if (error.status == 403) {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Token expired. Please login..',
              footer: '<a href="../login">Login..</a>'
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


  ontableDatachange(event: any) {
    this.page = event;
    // this.getpurchaseData();
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


    let dataToSort = this.userRole === '1' ? this.filteredpoDataAcceptedorrejected : this.filteredpoData;


    dataToSort.sort((a: any, b: any) => {
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


  navigateToNewRoute(items: any) {
    const queryParams = {
      searchTerm: this.searchTerm || '',
      page: this.page || 1,
      tableSize: this.tableSize || 10,
      from: this.podatabydate.start_date || '',
      to: this.podatabydate.end_date || '',
      sort: this.sortingorder || '',
    }

    this.previousUrl = this.location.path().split('?')[0];
    // Store the current URL with query params
    localStorage.setItem('backUrl', this.previousUrl + this.buildQueryString(queryParams));
    localStorage.setItem('navigated', 'true'); // Set the flag for navigation
    this.router.navigate(['user/purchase-order-view', items.purchase_id], { queryParams });
  }

  buildQueryString(params: any): string {
    return '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&');
  }

  //this is for when data comes with api call(array of object)
  //   exportToExcel() {
  //     const randomDate = new Date().valueOf();
  //     const uri = 'data:application/vnd.ms-excel;base64,';
  //     const template = `
  //     <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  //     <head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
  //     <body>{table}</body>
  //     </html>
  //   `;
  //     const base64 = function (s: any) { return window.btoa(unescape(encodeURIComponent(s))) };
  //     const format = function (s: any, c: any) { return s.replace(/{(\w+)}/g, function (m: any, p: any) { return c[p]; }) };

  //     // Define your column names
  //     const columnNames = ['S.No.', 'Purchase Id', 'Vendor Name', 'Purchase Date', 'Approved/Rejected On'];

  //     const tableHtml = `<table style="border-collapse: collapse; width: 80%; background-color: #f2f2f2;">
  //   <thead>
  //     <tr style="background-color: #00008B; color:#fff;">
  //       ${columnNames.map((name) => `<th style="border: 1px solid #dddddd; text-align: left; padding: 1px;">${name}</th>`).join('')}
  //     </tr>
  //   </thead>
  //   <tbody>
  //     ${this.filteredpoData.map((item: any, index: number) => {
  //       return `
  //         <tr style="border: 1px solid #dddddd; text-align: left; padding: 1px;">
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${index + 1}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.purchase_id}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.supplier_name}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.created_date}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.po_approval_date ? item.po_approval_date : 'NA'}</strong></td>
  //         </tr>`;
  //     }).join('')}
  //   </tbody>
  // </table>`;

  //     const ctx = { worksheet: 'Worksheet', table: tableHtml };
  //     const link = document.createElement('a');
  //     // link.download = `po_data_${this.currentdate}_${randomDate}.xls`;
  //     link.download = `report_PO_data.xls`;
  //     link.href = uri + base64(format(template, ctx));
  //     link.click();
  //   }

  exportToexcelfromnode(): any {
    const modifiedItemsDataList = this.filteredpoData.map((item: any, index: any) => {
      let statusLable = '';
      switch (item.is_sent) {
        case 0:
          statusLable = 'To Send for Approval';
          break;

        case 1:
          statusLable = 'Sent for Approval';
          break;

        case 2:
          statusLable = 'Approved';
          break;

        case 3:
          statusLable = 'Rejected';
          break;

          case 4:
          statusLable = 'Approved';
          break;

          case 4:
          statusLable = 'Rejected';
          break;
      }

      return {
        ...item,  // Spread the original object properties
        "status": statusLable,
        "S.No.": index + 1,  // Add the S.No. field with the appropriate value
        "category": item.category == '1' ? 'Online' : 'Offline'
      };
    });

    const reportRequest = {
      reportTitle: "Purchase Order List",
      columns: [
        { header: 'S.No.', key: 'S.No.', width: 10, filterButton: false },
        { header: 'Purchase Id', key: 'purchase_id', width: 35, filterButton: true },
        { header: 'Vendor Name', key: 'supplier_name', width: 45, filterButton: true },
        { header: 'Purchase Mode', key: 'category', width: 25, filterButton: true },
        { header: 'Purchase Date', key: 'created_date', width: 35, format: 'date', filterButton: false },
        { header: 'Action/Status', key: 'status', width: 35, filterButton: true },
        { header: 'Approved/Rejected On', key: 'po_approval_date', width: 40, format: 'date', filterButton: false },
      ],

      data: modifiedItemsDataList, // Data to populate the report

      filters: [
        { filterBy: (this.podatabydate.start_date && this.podatabydate.end_date) ? 'Purchase Date' : '', startDate: this.podatabydate.start_date || '', endDate: this.podatabydate.end_date || '' }
      ]
    };

    this.fileService.exportToExcel(reportRequest).subscribe(
      (response: Blob) => {
        // Call downloadBlob to trigger the download with the response
        this.fileService.downloadBlob(response, 'purchase_order_list_report.xlsx');
      },
      (error) => {
        console.error('Error exporting to Excel', error);
      }
    );
  }

  navigateTopurchaseinfo(items: any) {
    const queryParams: any = {};

    // Add properties to queryParams only if their values are not empty or undefined
    if (this.searchTerm) queryParams.searchTerm = this.searchTerm;
    if (this.page) queryParams.page = this.page;
    if (this.tableSize) queryParams.tableSize = this.tableSize;

    this.previousUrl = this.location.path().split('?')[0];
    // Store the current URL with query params
    localStorage.setItem('backUrl', this.previousUrl + this.buildQueryString(queryParams));
    localStorage.setItem('navigated', 'true'); // Set the flag for navigation
    this.router.navigate(['user/purchase-info', items.purchase_id], { queryParams });
  }

  openModal(data: any) {
    this.dialog.open(PurchaseOrderViewComponent, {
      width: '1200px',
      maxHeight: '85vh',
      data: data.purchase_id
    })
  }

  isApprovedOrPreApproved(item: any): boolean {
    return (item.is_sent == 2 || item.is_sent == 4) || item.purchase_id?.startsWith('DP-');
  }

  getStatusLabel(item: any): string {
    if (item.purchase_id?.startsWith('DP-')) {
      return 'Pre-approved';
    } else if (item.is_sent == 2 || item.is_sent == 4) {
      return 'Approved';
    } else if (item.is_sent === 3 || item.is_sent == 5) {
      return 'Rejected';
    } else {
      return '';
    }
  }


  async openDiscountPopup(item: any) {
     if (item.filepath) return;   // stop execution
     if(item.is_sent==3 || item.is_sent==5) return;  // stop execution

    this.selectedPO = item;

    console.log(item, "Original PO");

    const Pid = { purchase_id: item.purchase_id };

    const purchaseItems: any =
      await this.sharedService.getPurchaseJoinDatabyPid(Pid).toPromise();

    // 🔥 Reset modal values FIRST (very important)
    this.discountModal = {
      grandTotal: 0,
      currency: '₹',
      type: 'rs',
      value: 0,
      percent: 0,
      finalTotal: 0
    };



    // 🔥 Calculate grand total
    let total = 0;

    purchaseItems.forEach((row: any) => {

     if(row.discount_in_rs > 0){
        this.isitemLeveldiscount = true;
     }

      total += Number(
        (row.total || 0).toString().replace(/,/g, '')
      );
    });

    this.discountModal.grandTotal = this.round2(total);
    this.discountModal.currency = purchaseItems?.[0]?.currency || item.currency || '₹';

    // 🔥 Restore existing discount
    const firstRow = purchaseItems?.[0];

    if (firstRow?.po_discount) {

      this.discountModal.type =
        firstRow.discount_type || 'rs';

      this.discountModal.value =
        Number(firstRow.po_discount);

      if (
        this.discountModal.type === 'percent' &&
        this.discountModal.grandTotal > 0
      ) {
        
        this.discountModal.percent =
          this.round2(
            (this.discountModal.value /
              this.discountModal.grandTotal) * 100
          );
      }

    }

    this.originalDiscountValue = this.discountModal.value;
    this.originalDiscountType = this.discountModal.type;

    // 🔥 Always recalculate properly
    this.calculateDiscount();

    this.showDiscountModal = true;
  }

  calculateDiscount() {

    if (this.discountModal.type === 'percent') {

      this.discountModal.value =
        this.round2(
          (this.discountModal.grandTotal *
            this.discountModal.percent) / 100
        );

    } else {

      this.discountModal.percent =
        this.discountModal.grandTotal > 0
          ? this.round2(
            (this.discountModal.value /
              this.discountModal.grandTotal) * 100
          )
          : 0;
    }

    // 🔥 Safety: discount cannot exceed total
    if (this.discountModal.value > this.discountModal.grandTotal) {
      this.discountModal.value = this.discountModal.grandTotal;
    }

    // 🔥 Calculate final total
    this.discountModal.finalTotal =
      this.round2(
        this.discountModal.grandTotal -
        this.discountModal.value
      );
  }

  applyDiscount() {

    // 🔥 Show loader first
    Swal.fire({
      title: 'Applying Discount...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.adminService.applyFinalDiscount({
      purchase_id: this.selectedPO.purchase_id,
      po_discount: this.discountModal.value,
      discount_type: this.discountModal.type
    }).subscribe({

      next: () => {

        // update row locally
        this.selectedPO.po_discount =
          this.discountModal.value;

        this.selectedPO.discount_type =
          this.discountModal.type;

        Swal.fire({
          icon: 'success',
          title: 'Discount Applied Successfully!',
          showConfirmButton: false,
          timer: 1500
        });

        this.showDiscountModal = false;
      },

      error: () => {

        Swal.fire({
          icon: 'error',
          title: 'Failed to Apply Discount',
          text: 'Something went wrong. Please try again.'
        });

      }

    });
  }


  isDiscountChanged(): boolean {
  return (
    this.discountModal.value !== this.originalDiscountValue ||
    this.discountModal.type !== this.originalDiscountType
  );
}

  closeModal() {
  this.showDiscountModal = false;
  this.isitemLeveldiscount =false;
}


}
