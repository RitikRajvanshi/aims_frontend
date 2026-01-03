import { Component, HostListener, } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { AdminService } from 'src/app/services/admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { map } from 'rxjs/operators';
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';
import { FilesService } from 'src/app/services/files.service';

  


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent {
  private isNavigatedBack: boolean = false; // Flag to check navigation source
  isDataorNot: boolean = true;
  getuserData: any = [];
  usercreatedData: any;

  userId = {
    user_id: 0
  }
  searchItem = '';
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];
  currentPage: number = 1; // Initialize it to page 1
  emptyDataList: any = [];


  itemsData: any[] = [];
  filtereduserData: any[] = [];
  searchTerm: string = '';
  totalItems: number = 0;

  filteredBydate = false;

  UserdatabyDate = {
    start_date: '',
    end_date: ''
  }
  previousUrl: any;
  currentdate: any;
  // isExpanded: boolean = false;
  userRole = localStorage.getItem('level');
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  isRotating: boolean = false;
  sortingorder: any;
  itemsperPage:any = 20;

  constructor(private sharedSerive: SharedService, private adminService: AdminService, private router: Router, private spinner: NgxSpinnerService, 
    private location: Location, private activatedRoute: ActivatedRoute, private fileService:FilesService) {
    const today = moment();
    this.currentdate = today.format('YYYY-MM-DD');
  }

  ngOnInit(): void {
    this.statemanagement();
    console.log(this.userRole);
    this.getUserDataByStatus();
  }

  onSearchChange() {
    this.currentPage = 1;
  }

  statemanagement() {
    this.isNavigatedBack = localStorage.getItem('navigated') === 'true';
    localStorage.removeItem('navigated');
    this.activatedRoute.queryParams.subscribe(async (params: any) => {
      if (this.isNavigatedBack === true) {
        if (params['searchTerm'] && params['searchTerm'] !== '') {
          this.searchTerm = params['searchTerm'];
        }
        if (params['from'] && params['from'] !== '' && params['to'] && params['to'] !== '') {
          this.UserdatabyDate.start_date = params['from'];
          this.UserdatabyDate.end_date = params['to'];
        }
        if(params['itemsperPage']){
          this.itemsperPage = params['itemsperPage'];
        }

        setTimeout(() => {
          // Call the filter method to apply the saved state
          this.filterData();
          if (params['page'] && params['page'] !== null) {
            this.page = +params['page'];
          }
          if (params['tableSize'] && params['tableSize'] !== null) {
            this.tableSize = +params['tableSize'];
          }
          if (params['sort'] && params['sort'] !== '') {

            const [column, sortParams] = params['sort'].split('-');
            console.log(params['sort'].split('-')[1]);
            const ascending = sortParams === 'asc' ? true : false;
            this.isAscending = ascending;

            // Ensure sortingorder is set properly when restoring state
            this.sortingorder = `${column}-${this.isAscending}`;

            this.sort(column);

            // this.isAscending = params['sort'].split('-')[1];
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

  async getUserDataByStatus() {
    try {
      this.spinner.show();
      const results: any = await this.sharedSerive.getUsersdatabystatus().pipe(
        retry(3), // Retry the request up to 3 times
        // catchError((error: HttpErrorResponse) => {
        //   console.error('Error fetching user data:', error);
        //   return of([]); // Return an empty array if an error occurs
        // })
      ).toPromise();

      if (results?.length == 0) {
        this.isDataorNot = false;
      }
      else {
        this.isDataorNot = true;
        const filteredResults = results.map((item: any) => {
          const splitcreateddate = item.user_created_date ? moment(item.user_created_date).format('DD-MM-YYYY') : null;
          return { ...item, user_created_date: splitcreateddate };
        });

        this.filtereduserData = filteredResults;
        this.itemsData = filteredResults;
        this.count = filteredResults.length;
      }
    }
    catch (error: unknown) {
      if (error instanceof HttpErrorResponse && error.status === 403) {
        console.log(error.status, "error.status")
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
    } finally {
      this.spinner.hide();
    }
  }

  async filterData(): Promise<void> {
    // Ensure itemsData is set
    if (!this.itemsData) {
      // Initialize with an empty array if not set
      this.itemsData = [];
    }

    // Create a copy of itemsData to preserve the original data for filtering
    const originalData = [...this.itemsData];

    // Start with the original data
    let filteredData: any[] = originalData;

    // Filter by search term
    if (this.searchTerm) {
      filteredData = filteredData.filter((item: any) => {
        return Object.keys(item).some(key => {
          if (item[key] !== null && item[key] !== '' && key === 'user_created_date') {
            return item[key]?.includes(this.searchTerm);
          } else if (item[key] !== null && item[key] !== '') {
            return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
          }
          return false;
        });
      });
    }

    console.log(this.UserdatabyDate?.start_date, this.UserdatabyDate?.end_date);

    // Filter by date range only if there is a valid date range
    if (this.UserdatabyDate?.start_date && this.UserdatabyDate?.end_date) {
      if (this.UserdatabyDate.start_date <= this.UserdatabyDate.end_date) {
        filteredData = filteredData.filter((item: any) => {
          const filteredCreatedDate = moment(item?.user_created_date, 'DD-MM-YYYY').format('YYYY-MM-DD');

          if (filteredCreatedDate) {
            return filteredCreatedDate >= this.UserdatabyDate.start_date &&
              filteredCreatedDate <= this.UserdatabyDate.end_date;
          }
          return false;
        });
      } else {
        Swal.fire({
          title: 'Warning',
          text: 'End date should be later than start date.',
          icon: 'warning'
        });
        // If there's a date range error, return an empty array to show no results
        filteredData = [];
      }
    }

    // Update filtered data and totalItems
    this.filtereduserData = filteredData;
    this.totalItems = this.filtereduserData.length;
    this.count = this.totalItems;
    this.page = 1;                                // Reset to the first page when filtering occurs
  }


  refreshfilter() {
    this.isRotating = true;
    this.getUserDataByStatus().then(() => {

      if (this.UserdatabyDate?.start_date || this.UserdatabyDate?.end_date) {
        this.UserdatabyDate.start_date = '';
        this.UserdatabyDate.end_date = '';
      }
      // If the originalData is not set, initialize it with the current itemsData
      if (!this.itemsData) {
        this.itemsData = this.itemsData;
      }

      // Start with the original data or the previously filtered data
      let filteredData: any[] = this.itemsData;

      // Filter by search term
      if (this.searchTerm) {

        filteredData = filteredData.filter((item: any) => {
          return Object.keys(item).some(key => {
            if (item[key] !== null && item[key] !== '' && key === 'user_created_date') {
              return item[key]?.includes(this.searchTerm);
            } else if (item[key] !== null && item[key] !== '') {
              return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
            }
            return false;
          });
        });
      }
      // Update filtered data and totalItems
      this.filtereduserData = filteredData;
      this.totalItems = this.filtereduserData.length;
      this.page = 1; // Reset to the first page when filtering occurs
      setTimeout(() => {
        this.isRotating = false;
      }, 500);

    })
  }

  toggleExpand(item: any) {
    item.isExpanded = !item.isExpanded;
  }

  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }

  deleteUser(id: any) {
    this.userId.user_id = id;
    // // console.log(this.userId);

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

        this.adminService.deactivateUserStatusbyid(this.userId).subscribe(
          {
            next: (results: any) => {
              swalWithBootstrapButtons.fire(
                'Deleted!',
                'User deleted successfully!',
                'success'
              )
              this.getUserDataByStatus();
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

      }
      else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'User is not deleted!',
          'error'
        )
      }
    })

  }

  //this is for when data comes with api call(array of object)
//   exportToExcel() {
//     const randomDate = (new Date().valueOf() / 1000);
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
//     const columnNames = ['S.No.', 'User Name', 'Email', 'Privilege', 'Group', 'Designation', 'Created Date'];
//     const tableHtml = `<table style="border-collapse: collapse; width: 80%; background-color: #f2f2f2;">
//   <thead>
//     <tr style="background-color: #00008B; color:#fff;">
//       ${columnNames.map((name) => `<th style="border: 1px solid #dddddd; text-align: left; padding: 1px;">${name}</th>`).join('')}
//     </tr>
//   </thead>
//   <tbody>
//     ${this.filtereduserData.map((item: any, index: number) => {
//       return `
//         <tr style="border: 1px solid #dddddd; text-align: left; padding: 1px;">
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${index + 1}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.user_name}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.user_email}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.privilege_name}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.grp_name}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.designation_name}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.user_created_date}</strong></td>
//         </tr>`;
//     }).join('')}
//   </tbody>
// </table>`;

//     const ctx = { worksheet: 'Worksheet', table: tableHtml };
//     const link = document.createElement('a');
//     link.download = `report_users_list.xls`;
//     link.href = uri + base64(format(template, ctx));
//     link.click();
//   }

  exportToexcelfromnode(): any {
    const modifiedItemsDataList = this.filtereduserData.map((item: any, index: any) => {
      return {
        ...item,  // Spread the original object properties
        "S.No.": index + 1  // Add the S.No. field with the appropriate value
      };
    });
    const reportRequest = {
      reportTitle: "Users' List",
      columns: [
        { header: 'S.No.', key: 'S.No.', width: 10, filterButton: false },
        { header: 'User Name', key: 'user_name',width: 25, filterButton: true },
        { header: 'Email', key: 'user_email', filterButton: true },
        { header: 'Privilege', key: 'privilege_name',width: 25, filterButton: true },
        { header: 'Department', key: 'grp_name', width:25, filterButton: true},
        { header: 'Designation', key: 'designation_name', width: 25, filterButton: false},
        { header: 'Created Date', key: 'user_created_date', width: 25, filterButton: false },

      ],
      totalsrow:false,
      data: modifiedItemsDataList , // Data to populate the report

       // Data to populate the report

      filters:[
        { filterBy:(this.UserdatabyDate.start_date && this.UserdatabyDate.end_date)?'Created Date':'' , startDate:this.UserdatabyDate.start_date||'', endDate:this.UserdatabyDate.end_date||''}
      ]
    };

    this.fileService.exportToExcel(reportRequest).subscribe(
      (response: Blob) => {
        // Call downloadBlob to trigger the download with the response
        this.fileService.downloadBlob(response, 'report_users_list.xlsx');
      },
      (error) => {
        console.error('Error exporting to Excel', error);
      }
    );
  }

  navigateToNewRoute(items: any) {
    const queryParams: any = {};
    // Conditionally add parameters to queryParams based on their values

    if (this.searchTerm) queryParams.searchTerm = this.searchTerm;
    if (this.page) queryParams.page = this.page;
    if (this.tableSize) queryParams.tableSize = this.tableSize;
    if (this.sortingorder) queryParams.sort = this.sortingorder;
    if (this.itemsperPage) queryParams.itemsperPage = this.itemsperPage;

    if (this.UserdatabyDate) {
      if (this.UserdatabyDate.start_date) queryParams.from = this.UserdatabyDate.start_date;
      if (this.UserdatabyDate.end_date) queryParams.to = this.UserdatabyDate.end_date;
    }

    this.previousUrl = this.location.path().split('?')[0];
    // console.log(this.previousUrl, "this.previousUrl")
    // localStorage.setItem('backUrl', this.previousUrl);

    // Store the current URL with query params
    localStorage.setItem('backUrl', this.previousUrl + this.buildQueryString(queryParams));
    localStorage.setItem('navigated', 'true'); // Set the flag for navigation
    this.router.navigate(['user/update-user', items.user_id], { queryParams });
  }

  buildQueryString(params: any): string {
    return '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&');
  }

  ontableDatachange(event: any) {
    this.page = event;
    // this.getUserDataByStatus();
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

  this.filtereduserData.sort((a: any, b: any) => {
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


// debounce time
// In ngOnInit() 

// import { Subject } from 'rxjs';
// import { debounceTime } from 'rxjs/operators';
//   searchSubject: Subject<string> = new Subject<string>();

// this.searchSubject.pipe(
//       debounceTime(500) // debounce for 300 milliseconds
//     ).subscribe(() => {
//       this.currentPage = 1; // Reset pagination if needed
//       this.filterData();    // Call your actual filtering logic
//     });

// //normal function which should in the keyup event in the search

//   onSearchChange() {
//     this.searchSubject.next(this.searchTerm);

//     // this.currentPage = 1;
//   }

}
