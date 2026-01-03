import { Component } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { AdminService } from 'src/app/services/admin.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { filter, map } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FilesService } from 'src/app/services/files.service';

@Component({
  selector: 'app-system-information-list',
  templateUrl: './system-information-list.component.html',
  styleUrls: ['./system-information-list.component.scss']
})
export class SystemInformationListComponent {
  isDataorNot: boolean = true;
  searchItem: any;
  systemData: any[] = [];
  filteredSystemData: any[] = [];
  searchTerm: string = '';
  totalItems: number = 0;
  previousUrl: any;
  empltyDataList = [];
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];
  currentdate: any;
  userRole = localStorage.getItem('level');
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  private subscription: any;
  private isNavigatedBack: boolean = false; // Flag to check navigation source
  sortingorder: any;
  itemsperPage:any = 20;
  systemId:any;
  configureitemdetails:any;

  constructor(private sharedService: SharedService, private router: Router, private location: Location,
    private adminService: AdminService, private spinner: NgxSpinnerService, private activatedRoute: ActivatedRoute, private filesServices:FilesService) {
    const today = moment();
    this.currentdate = today.format('YYYY-MM-DD');
  }

  ngOnInit(): void {
    this.statemanagement();
    this.getSystemData();
    // this.clearsubjectbehavior();
  }

  statemanagement() {
    this.isNavigatedBack = localStorage.getItem('navigated') === 'true';
    localStorage.removeItem('navigated');
    this.activatedRoute.queryParams.subscribe(async (params: any) => {
      if (this.isNavigatedBack === true) {
        this.searchTerm = params['searchTerm'];

        // if (params['searchTerm'] && params['searchTerm'] !== '') {
        //   this.searchTerm = params['searchTerm'];
        // }
        setTimeout(() => {
          
        if(params['itemsperPage']){
          this.itemsperPage = params['itemsperPage'];
        }
          // Call the filter method to apply the saved state
          this.applyFilter();
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



  clearsubjectbehavior() {
    // if (this.subscription) {
    //   this.subscription.unsubscribe();
    // }
    this.subscription = this.adminService.selectedItem$.subscribe(
      item => {
        if (item && item !== null) {
          console.log("I am in");
          this.adminService.sendSelectedItem(null);
        }
      }
    );

  }


  async getSystemData() {
    this.spinner.show();
    try {
      const results: any = await this.sharedService.getSysteminformationList().pipe(
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
        console.log(results, "before filteration")

        const filteredResults = results.map((item: any) => {
          const splitdate_ = item.created_date ? moment(item.created_date).format('DD-MM-YYYY') : null;
          return { ...item, created_date: splitdate_ };
        })
        this.filteredSystemData = filteredResults;
        this.systemData = filteredResults;
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

  applyFilter(): void {
    if (this.searchTerm) {
      this.filteredSystemData = this.systemData.filter((item: any) => {
        // Check if any property matches the search term and is not null or empty
        return Object.keys(item).some(key => {
          if (item[key] !== null && item[key] !== '') {
            // Convert both the property value and search term to lowercase for case-insensitive comparison
            const value = item[key].toString().toLowerCase();
            const searchTerm = this.searchTerm.toLowerCase();
            if (key === 'created_date') {
              // For date property, you might want to use a date range picker or specific date filtering logic
              return value.includes(searchTerm);
            }
            // For other properties, check if they include the search term
            return value.includes(searchTerm);
          }
          return false; // Ignore null or empty properties
        });
      });
    } else {
      this.filteredSystemData = this.systemData;
    }
    this.totalItems = this.filteredSystemData.length;
    this.count = this.totalItems;
    this.page = 1; // Reset to the first page when filtering occurs 
  }

  deletesystemInfo(sid: any) {
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
        const SID = {
          sid: sid
        }
        this.adminService.deleteSysteminfo(SID).subscribe({
          next: async (results: any) => {
            await Swal.fire(
              'Deleted!',
              'System information deleted successfully!',
              'success'
            ).then(() => {
              this.ngOnInit();
            })
          },
          error: (error) => {
            console.log('error')
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
          'System information is not deleted!',
          'error'
        )
      }

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

  async updateSystemInfo(itemsobj: any) {
    this.adminService.sendSelectedItem(itemsobj);
    await this.router.navigateByUrl('user/newsystem-information');
    this.adminService.resetSelectedItem();
  }


  navigateToNewRoute(items: any) {
    const queryParams: any = {};
    console.log(items.sid, "items.sid");
    this.systemId = items.sid;
    
    if(this.systemId) queryParams.systemId = this.systemId;

    // Conditionally add parameters to queryParams based on their values
    if (this.searchTerm) queryParams.searchTerm = this.searchTerm;
    if (this.page) queryParams.page = this.page;
    if (this.tableSize) queryParams.tableSize = this.tableSize;
    if (this.sortingorder) queryParams.sort = this.sortingorder;
    if (this.itemsperPage) queryParams.itemsperPage = this.itemsperPage;

    this.previousUrl = this.location.path().split('?')[0];

    // Store the current URL with query params
    localStorage.setItem('backUrl', this.previousUrl + this.buildQueryString(queryParams));
    localStorage.setItem('navigated', 'true'); // Set the flag for navigation
    this.router.navigate(['user/newsystem-information'], { queryParams });
  }

  buildQueryString(params: any): string {
    return '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&');
  }


  ontableDatachange(event: any) {
    this.page = event;
    // this.getSystemData();
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
    this.itemsperPage = Value ;
    this.page = 1;
    // this.getSystemData();
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
//     const columnNames = ['S.No.', 'System Type', 'CPU Code', 'User Name', 'Processor', 'RAM1', 'RAM2', 'RAM3', 'RAM4', 'HDD1', 'HDD2', 'Graphic Card', 'SMPS', 'Cabinet', 'CMOS', 'MotherBoard', 'Description'];

//     const tableHtml = `<table style="border-collapse: collapse; width: 80%; background-color: #f2f2f2;">
//   <thead>
//     <tr style="background-color: #00008B; color:#fff;">
//       ${columnNames.map((name) => `<th style="border: 1px solid #dddddd; text-align: left; padding: 1px;">${name}</th>`).join('')}
//     </tr>
//   </thead>
//   <tbody>
//     ${this.filteredSystemData.map((item: any, index: number) => {
//       return `
//         <tr style="border: 1px solid #dddddd; text-align: left; padding: 1px;">
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${index + 1}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.system_type ? item.system_type : 'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.user_name ? item.user_name : 'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.cpucode ? item.cpucode : 'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.processor ? item.processor : 'N/A'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.ram1 ? item.ram1 : 'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.ram2 ? item.ram2 : 'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.ram3 ? item.ram3 : 'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.ram4 ? item.ram4 : 'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.hdd1 ? item.hdd1 : 'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.hdd2 ? item.hdd2 : 'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.graphiccard ? item.graphiccard : 'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.smps ? item.smps : 'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.cabinet ? item.cabinet : 'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.cmos ? item.cmos : 'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.motherboard ? item.motherboard : 'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.description ? item.description : 'NA'}</strong></td>
//         </tr>`;
//     }).join('')}
//   </tbody>
// </table>`;

//     const ctx = { worksheet: 'Worksheet', table: tableHtml };
//     const link = document.createElement('a');
//     link.download = `report_system_info_data.xls`;
//     link.href = uri + base64(format(template, ctx));
//     link.click();
//   }

  exportToexcelfromnode(): any {
    const modifiedItemsDataList = this.filteredSystemData.map((item: any, index: any) => {
      return {
        ...item,  // Spread the original object propertie
        "S.No.": index + 1  // Add the S.No. field with the appropriate value
      };
    });

  
    const reportRequest = {
      reportTitle: "Report System Information",
      columns: [
        { header: 'S.No.', key: 'S.No.', width: 10, filterButton: false },
        { header: 'System Type', key: 'system_type',width: 25, filterButton: true },
        { header: 'CPU Code', key: 'cpucode', width: 35, filterButton: true },
        { header: 'User Name', key: 'user_name', width: 30, filterButton: true },
        { header: 'Processor', key: 'processor', width: 30, filterButton: false, },
        { header: 'RAM1', key: 'ram1', width: 15, filterButton: false },
        { header: 'RAM2', key: 'ram2', width: 15, filterButton: false },
        { header: 'RAM3', key: 'ram3', width: 15, filterButton: false },
        { header: 'RAM4', key: 'ram4', width: 15, filterButton: false },
        { header: 'HDD1', key: 'hdd1', width: 25, filterButton: false },
        { header: 'HDD2', key: 'hdd2', width: 25, filterButton: false },
        { header: 'Graphic Card', key: 'graphiccard', width: 25, filterButton: false },
        { header: 'SMPS', key: 'smps', width: 25, filterButton: false },
        { header: 'Cabinet', key: 'cabinet', width: 25, filterButton: false },
        { header: 'CMOS', key: 'cmos', width: 25, filterButton: false },
        { header: 'Motherboard', key: 'motherboard', width: 25, filterButton: false },
        { header: 'Description', key: 'description', width: 45, filterButton: false },
      ],
  
      data: modifiedItemsDataList , // Data to populate the report
      totalsrow:false,

    };
  
    this.filesServices.exportToExcel(reportRequest).subscribe(
      (response: Blob) => {
        // Call downloadBlob to trigger the download with the response
        this.filesServices.downloadBlob(response, 'report_system_information.xlsx');
      },
      (error) => {
        console.error('Error exporting to Excel', error);
      }
    );
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

    this.filteredSystemData.sort((a: any, b: any) => {
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

  ngOnNavigateAway(): void {
    this.adminService.resetSelectedItem();
  }

  

}
