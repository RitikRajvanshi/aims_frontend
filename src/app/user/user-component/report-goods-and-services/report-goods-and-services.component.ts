import { Component, ViewChild, OnInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { AdminService } from 'src/app/services/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { filter, map } from 'rxjs/operators';
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';
import { Location } from '@angular/common';
import { environment } from 'src/app/environments/environment.prod';
import { CheckService } from 'src/app/services/check.service';
import { MatDialog } from '@angular/material/dialog'; 
import { PurchaseOrderViewComponent } from '../purchase-order-view/purchase-order-view.component';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FilesService } from 'src/app/services/files.service';
declare var $: any;


interface Item {
  purchase_id: string | number; // Assuming purchase_id can be either string or number
  purchase_amount: number;
  date_: string | null;
  warrantyend_date: string | null;
  invoice_amount: number | null;
}

@Component({
  selector: 'app-report-goods-and-services',
  templateUrl: './report-goods-and-services.component.html',
  styleUrls: ['./report-goods-and-services.component.scss']
})
export class ReportGoodsAndServicesComponent {
  isDataorNot: boolean = true;
  itemDescription = {
    item_id: 0,
    date_: '',
    description: '',
    warrantyend_date: ''
  }

  itemData: any[] = [];
  filteredItemData: any[] = [];
  searchTerm: string = '';
  totalItems: number = 0;
  empltyDataList = [];
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];
  isEditing = false;
  isRotating: boolean = false;
  // Initial descriptions for resetting when toggling back from editing mode
  initialDescriptions: { [key: number]: string } = {};
  @ViewChild('description') descriptionInput!: ElementRef;
  userRole = localStorage.getItem('level');
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  filterbydate = {
    start_date: '',
    end_date: ''
  }
  selectedItemType: string = 'All';
  selectedTimeRange: string = 'All';
  itemTypes = [
    { value: 'All', viewValue: 'All' },
    { value: 'Goods', viewValue: 'Goods' },
    { value: 'Services', viewValue: 'Services' }
  ];


  timeRanges = [
    { value: 'All', viewValue: 'All' },
    { value: 'Current Financial Year', viewValue: 'Current Financial Year' },
    { value: 'Current Month', viewValue: 'Current Month' },
    { value: 'Last 3 Months', viewValue: 'Last 3 Months' },
    { value: 'Last 6 Months', viewValue: 'Last 6 Months' }
  ];

  reportData: any[] = [];
  isModalOpen: boolean = false; // Control modal visibility
  private isNavigatedBack: boolean = false; // Flag to check navigation source
  sortingorder: any;
  previousUrl: any;
  baseUrl: any;
  displayDateRange: boolean = false;
  displaySelectPeriod: boolean = false;
  uniquePurchaseIds:any;
  sumofInvoiceamount:number=0;
  selectedPurchaseId: any;
  pdfUrl: any;
  selectedRadio: string | null = null; // Tracks the selected radio button value

  searchedData:any;

  // isModalOpen = false;


  constructor(private sharedService: SharedService, private adminService: AdminService,
    private cdr: ChangeDetectorRef, private router: Router, private ele: ElementRef,
    private spinner: NgxSpinnerService,
    private location: Location, private checkService: CheckService, private activatedRoute: ActivatedRoute,  private dialog:MatDialog, 
    private sanitizer: DomSanitizer, private fileService:FilesService) {
    this.baseUrl = environment.BASE_URL;
   
  }

  ngOnInit() {
    this.statemanagement();
    this.itemsDataList();
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
          this.filterbydate.start_date = params['from'];
          this.filterbydate.end_date = params['to'];
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

          if ((params['selectedItemType'] && params['selectedItemType'] !== '') || (params['selectedTimeRange'] && params['selectedTimeRange'] !== '')) {
            this.selectedItemType = params['selectedItemType'] ? params['selectedItemType'] : 'all';
            this.selectedTimeRange = params['selectedTimeRange'] ? params['selectedTimeRange'] : 'all';
            this.applyFilter();
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

  async itemsDataList() {
    this.spinner.show();
    try {
      const results: any = await this.sharedService.getGoodsandServices().pipe(
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
        console.log(results, "alldata");


        const filteredResults: Item[] = results.map((item: any) => {

          // if (item.date_ && item.warrantyend_date && item.created_date) {
          const splitdate = item.date_ ? moment(item.date_).format('DD-MM-YYYY') : null;
          const splitwarrantyenddate = item.warrantyend_date ? moment(item.warrantyend_date).format('DD-MM-YYYY') : null;
          const filteredinvoicedate = item.invoice_date ? moment(item.invoice_date).format('DD-MM-YYYY') : null;

          // Extract unique purchase_ids
      
          // const splitcreateddate = item.created_date ? moment(item.created_date).format('DD-MM-YYYY') : null;
          return { ...item, date_: splitdate, warrantyend_date: splitwarrantyenddate, invoice_date: filteredinvoicedate };
          // }
          // return item;
        });


        this.filteredItemData = filteredResults;

        this.searchedData = filteredResults;

        this.itemData = filteredResults;

        this.count = filteredResults.length;

        console.log(this.filteredItemData, "fitlereddata");
       this.getSumofInvoices(filteredResults);

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

  getSumofInvoices(filteredResults:any[]){
    this.uniquePurchaseIds = Array.from(
      new Map(
        filteredResults.map((item: Item) => [
          item.purchase_id,
          item.invoice_amount ?? 0  // If purchase_amount is null, replace it with 0
        ])
      ).entries()
    ).map(([purchase_id, invoice_amount]) => invoice_amount)

    console.log(filteredResults, "filteredResults");

    this.sumofInvoiceamount = this.uniquePurchaseIds.reduce((sum:any, amount:any) => sum+amount,0);
    console.log(this.uniquePurchaseIds);  // This will output the array of unique purchase_ids
    console.log(this.sumofInvoiceamount, "sumofInvoiceamount");  // This will output the array of unique purchase_ids
  }

  // applyFilter(event:any) {
  //   console.log(event.target.value, "applyfilter");
  //   const filerValue = event.target.value;
  //   const filteredValue = [...this.filteredItemData];
  //   switch(filerValue) {
  //     case "services":
  //       this.filteredItemData = this.filteredItemData.filter((items:any)=>{
  //         return [2,3030].includes(items.category_id);
  //       })
  //       // code block
  //       break;
  //     case 'goods':
  //       this.filteredItemData = this.filteredItemData.filter((items:any)=>{
  //         return ![2,3030].includes(items.category_id);
  //       })
  //       // code block
  //       break;
  //       case 'goods':
  //       this.filteredItemData = this.filteredItemData.filter((items:any)=>{
  //         return ![2,3030].includes(items.category_id);
  //       })
  //       // code block
  //       break;
  //       case 'goods':
  //       this.filteredItemData = this.filteredItemData.filter((items:any)=>{
  //         return ![2,3030].includes(items.category_id);
  //       })
  //       // code block
  //       break;
  //       case 'goods':
  //       this.filteredItemData = this.filteredItemData.filter((items:any)=>{
  //         return ![2,3030].includes(items.category_id);
  //       })
  //       // code block
  //       break;
  //       case 'goods':
  //       this.filteredItemData = this.filteredItemData.filter((items:any)=>{
  //         return ![2,3030].includes(items.category_id);
  //       })
  //       // code block
  //       break;
  //     default:
  //       this.filteredItemData = [...this.filteredItemData];
  //       // return this.filteredItemData;

  //       // code block
  //   }

  // }

  applyFilter(): void {
    // Add a slight delay to ensure any other operations have completed
    setTimeout(() => {
      // Start with the full dataset (reset the filtered data to the complete list every time)
      let filteredData = [...this.itemData];  // Always start with the full list

      // Apply Item Type Filter
      if (this.selectedItemType === 'Goods') {
        // Filter for goods (category_id is neither 2 nor 3030)
        filteredData = filteredData.filter(item => ![2, 3030, 1004].includes(item.category_id));
      } else if (this.selectedItemType === 'Services') {
        // Filter for services (category_id is 2 or 3030)
        filteredData = filteredData.filter(item => [2, 3030, , 1004].includes(item.category_id));
      }

      // Apply Time Range Filter using Moment.js
      const currentDate = moment();  // Get the current date using Moment.js

      // Apply Time Range Filters
      if (this.selectedTimeRange === 'Current Financial Year') {
        // For 'Annually', filter the items for the current financial year (starting from April 1st of the current year)
        const startOfFinancialYear = moment().month(3).startOf('month');  // April 1st of the current year
        // Filter for items from April 1st till the current date
        filteredData = filteredData.filter(item => moment(item.date_, 'DD-MM-YYYY').isBetween(startOfFinancialYear, currentDate, null, '[]'));
      } else if (this.selectedTimeRange === 'Current Month') {
        // For 'Monthly', filter the items for the current month
        filteredData = filteredData.filter(item => moment(item.date_, 'DD-MM-YYYY').isSame(currentDate, 'month'));
      } else if (this.selectedTimeRange === 'Last 3 Months') {
        // For 'Quarterly', filter the items for the past 3 months from today
        const startOfQuarter = currentDate.clone().subtract(3, 'months');  // 3 months back
        filteredData = filteredData.filter(item => moment(item.date_, 'DD-MM-YYYY').isBetween(startOfQuarter, currentDate, null, '[]'));
      } else if (this.selectedTimeRange === 'Last 6 Months') {
        // For 'Half-Yearly', filter the items for the past 6 months from today
        const startOfHalfYear = currentDate.clone().subtract(6, 'months');  // 6 months back
        filteredData = filteredData.filter(item => moment(item.date_, 'DD-MM-YYYY').isBetween(startOfHalfYear, currentDate, null, '[]'));
      }

      // Apply Date Range Filter if applicable
      if (this.filterbydate?.start_date && this.filterbydate?.end_date) {
        if (this.filterbydate.start_date <= this.filterbydate.end_date) {
          filteredData = filteredData.filter((item: any) => {
            const filteredCreatedDate = moment(item?.invoice_date, 'DD-MM-YYYY').format('YYYY-MM-DD');
            return filteredCreatedDate >= this.filterbydate.start_date && filteredCreatedDate <= this.filterbydate.end_date;
          });
        } else {
          Swal.fire({
            title: 'Warning',
            text: 'End date should be later than start date.',
            icon: 'warning'
          });
          filteredData = []; // If date range is invalid, return an empty result
        }
      }

      // After applying all filters, update filteredItemData
      this.getSumofInvoices(filteredData);
      this.filteredItemData = filteredData;

      this.searchedData = filteredData;

      this.totalItems = this.filteredItemData.length;
      this.count = this.totalItems;
      this.page = 1; // Reset to the first page when filtering occurs
      

    }, 200);  // Adjust the delay (in milliseconds) as needed (300 ms in this case)
  }



  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }

  toggleExpand(item: any) {
    console.log(item, "toggleExpand")
    // Close other expanded items
    this.filteredItemData.forEach((otherItem: any) => {
      if (otherItem !== item) {
        // item.isEditing = !item.isEditing;
        otherItem.isExpanded = false;
        otherItem.isEditing = false;
      }
    });

    item.isExpanded = !item.isExpanded;
    // If the item is expanded, close editing mode
    if (item.isExpanded) {
      item.isEditing = false;
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

    this.filteredItemData.sort((a: any, b: any) => {
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

  refreshfilter() {
    this.isRotating = true;
    this.itemsDataList().then(() => {
      // Clear date filters
      if (this.filterbydate?.start_date || this.filterbydate?.end_date) {
        this.filterbydate.start_date = '';
        this.filterbydate.end_date = '';
      }

      setTimeout(() => {
        // Initialize itemsData if not already set (assuming you have some original data to refer to)
        if (!this.itemData) {
          this.itemData = []; // or fetch your initial data here
        }

        // Start with the original data or the previously filtered data
        let filteredData: any[] = [...this.itemData];

        // Log the search term for debugging
        console.log(this.searchTerm, "searchTerm");

        // Filter by search term
        if (this.searchTerm && this.searchTerm.trim() !== '') {
          const searchTermLower = this.searchTerm.toLowerCase();

          filteredData = filteredData.filter((item: any) => {
            return Object.keys(item).some(key => {
              const value = item[key];

              // Skip null or undefined values
              if (value === null || value === undefined) {
                return false;
              }

              // Handle created_date and modified_date fields specifically if needed
              if (key === 'invoice_date' || key === 'warrantyend_date') {
                // Assuming these fields are in string format. If not, you might need to format them accordingly
                return value.toString().includes(this.searchTerm);
              }

              // General case: Convert to string and check for inclusion of search term
              return value.toString().toLowerCase().includes(searchTermLower);
            });
          });
        };
        this.selectedItemType = 'All';
        this.selectedTimeRange = 'All';
        this.displayDateRange = false;
        this.displaySelectPeriod = false;

        // Update filtered data and totalItems
        this.filteredItemData = filteredData;

        this.getSumofInvoices(filteredData);
        
        this.totalItems = this.filteredItemData.length;
        this.page = 1; // Reset to the first page when filtering occurs
        this.isRotating = false;
        this.clearSelection() ;
      }, 500);


    });
  }

//   exportToExcel() {
//     const randomDate = new Date().valueOf();
//     const uri = 'data:application/vnd.ms-excel;base64,';
//     let itemType: any = '';
//     const template = `
//       <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
//       <head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
//       <body>{table}</body>
//       </html>
//     `;

//     const base64 = function (s: any) { return window.btoa(unescape(encodeURIComponent(s))) };
//     const format = function (s: any, c: any) { return s.replace(/{(\w+)}/g, function (m: any, p: any) { return c[p]; }) };
//     if (this.selectedItemType == 'All') {
//       itemType = 'Goods & Services Report'
//     }

//     if (this.selectedItemType === 'All') {
//       if (this.selectedTimeRange !== 'All') {
//         itemType = `Goods & Services Report of ${this.selectedTimeRange}`;
//       }
//     } else if (this.selectedItemType === 'Goods') {
//       itemType = this.selectedTimeRange === 'All' ? 'Goods Report' : `Goods Reports of ${this.selectedTimeRange}`;
//     } else if (this.selectedItemType === 'Services') {
//       itemType = this.selectedTimeRange === 'All' ? 'Services Report' : `Services Reports of ${this.selectedTimeRange}`;
//     } else if (this.selectedTimeRange !== 'All') {
//       itemType = `${this.selectedItemType} Reports of ${this.selectedTimeRange}`;
//     }

//     // Define your column names
//     const columnNames = ['S.No.', 'Item code', 'Item Name', 'Purchase Id', 'Date of Purchase', 'Invoice Date','Warranty End Date', 'Description'];


//     // Create the table HTML with enhanced styling
//     const tableHtml = `
//     <table style="border-collapse: collapse; width: 80%; background-color: #fff; font-family: Arial, sans-serif; font-size: 12px;">
//   <thead>
// <!-- Title Row: AIMS -->
// <tr style="background-color: #007BFF;"> <!-- Rich Blue Color -->
//   <td colspan="${columnNames.length}" style="background-color: #007BFF; color: #fff; text-align: center; font-size: 18px; font-weight: bold; padding: 10px;">
//     AIMS
//   </td>
// </tr>

// <!-- Subtitle Row: Report Information (Item Type and Time Range) -->
// <tr style="background-color: #28A745;"> <!-- Rich Green Color -->
//   <td colspan="${columnNames.length}" style="background-color: #28A745; color: #fff; text-align: center; font-size: 18px; font-weight: bold; padding: 10px;">
//     ${itemType}
//   </td>
// </tr>
  

//       <!-- Column Headers -->
//       <tr style="background-color: #00008B; color: #fff;">
//         ${columnNames.map((name) => `
//           <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-weight: bold; background-color: #00008B;">
//             ${name}
//           </th>
//         `).join('')}
//       </tr>
//     </thead>

//     <tbody style="background-color: #fff;"> <!-- Table body with white background for empty spaces -->
//       <!-- Table Body: Data Rows -->
//       ${this.filteredItemData.map((item, index) => {
//       // Alternate row colors for striped effect
//       const rowColor = index % 2 === 0 ? '#f2f2f2' : '#e6f7ff'; // Light gray and light blue for alternating rows
//       return `
//           <tr style="border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: ${rowColor};">
//             <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${index + 1}</td>
//             <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.item_code ? item.item_code : 'NA'}</td>
//             <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.item_name ? item.item_name : 'NA'}</td>
//             <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.purchase_id ? item.purchase_id : 'NA'}</td>
//             <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.date_ ? item.date_ : 'NA'}</td>
//             <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.invoice_date ? item.invoice_date : 'NA'}</td>
//             <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.warrantyend_date ? item.warrantyend_date : 'NA'}</td>
//             <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.description ? item.description : 'NA'}</td>
//           </tr>
//         `;
//     }).join('')}
//     </tbody>
//   </table>
//    `;

//     const ctx = { worksheet: 'Worksheet', table: tableHtml };
//     const link = document.createElement('a');
//     // link.download = `rejected_request_${this.currentdate}_${randomDate}.xls`;
//     link.download = `${itemType}.xls`;
//     link.href = uri + base64(format(template, ctx));
//     link.click();
//   }

  exportToexcelfromnode(): any {
    let itemType: any = '';
    let filterByItems:any = '';

    if (this.selectedItemType == 'All') {
      itemType = 'Goods & Services Report'
    }

    if (this.selectedItemType === 'All') {
      if (this.selectedTimeRange !== 'All') {
        itemType = `Goods & Services Report of ${this.selectedTimeRange}`;
      }
    } else if (this.selectedItemType === 'Goods') {
      itemType = this.selectedTimeRange === 'All' ? 'Goods Report' : `Goods Reports of ${this.selectedTimeRange}`;
    } else if (this.selectedItemType === 'Services') {
      itemType = this.selectedTimeRange === 'All' ? 'Services Report' : `Services Reports of ${this.selectedTimeRange}`;
    } else if (this.selectedTimeRange !== 'All') {
      itemType = `${this.selectedItemType} Reports of ${this.selectedTimeRange}`;
    }

    // when filterby date 
   if(this.filterbydate.start_date && this.filterbydate.end_date){
    if (this.selectedItemType == 'All') {
      filterByItems = 'Goods & Services';
    }
    else if(this.selectedItemType == 'Goods'){
      filterByItems = 'Goods';
    }
    else{
      filterByItems = 'Services';
    }
   }

    const modifiedItemsDataList = this.filteredItemData.map((item: any, index: any) => {
      return {
        ...item,  // Spread the original object properties
        "S.No.": index + 1  // Add the S.No. field with the appropriate value
      };
    });

    // const columnNames = ['S.No.', 'Item code', 'Item Name', 'Purchase Id', 'Date of Purchase', 'Invoice Date','Warranty End Date', 'Description'];

    let reportRequest = {
      reportTitle: itemType,
      columns: [
        { header: 'S.No.', key: 'S.No.', width: 10, filterButton: false },
        { header: 'Item Code', key: 'item_code',width: 30, filterButton: true },
        { header: 'Item Name', key: 'item_name',width: 30, filterButton: true },
        { header: 'Category', key: 'category_name',width: 30, filterButton: true },
        { header: 'Description', key: 'description', width: 40, format: 'date', filterButton: false },
        { header: 'Purchase Id', key: 'purchase_id',width: 30, filterButton: true },
        { header: 'Purchase Date', key: 'date_', width: 30, format: 'date', filterButton: true },
        { header: 'Warranty End Date', key: 'warrantyend_date', width: 30, format: 'date', filterButton: false },
      ],

      data: modifiedItemsDataList , // Data to populate the report
      totalsrow:false,
      filters:[
        { filterBy:filterByItems|| '' , startDate:this.filterbydate.start_date||'', endDate:this.filterbydate.end_date||''}
      ]
    };


    this.fileService.exportToExcel(reportRequest).subscribe(
      (response: Blob) => {
        // Call downloadBlob to trigger the download with the response
        this.fileService.downloadBlob(response, 'report_goods_and_services.xlsx');
      },
      (error) => {
        console.error('Error exporting to Excel', error);
      }
    );
  }

  async filterData(): Promise<void> {
    const dataafterFilter = this.searchedData;

    if (!this.itemData) {
      this.itemData = dataafterFilter;
    }

    let filteredData: any[] = dataafterFilter;
    // Start with the original data or previously filtered data
    console.log(this.filteredItemData, "this.filteredItemData");

    // If search term exists, apply search filtering
    if (this.searchTerm) {
      filteredData = filteredData.filter((item: any) => {
        return Object.keys(item).some(key => {
          // Check if the key is date-related or general text
          if (item[key] !== null && item[key] !== '') {
            if (key === 'date_' || key === 'warrantyend_date' || key === 'invoice_date') {
              return item[key]?.includes(this.searchTerm);
            } else {
              return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
            }
          }
          return false;
        });
      });
    }

    // Apply date range filter if provided
    if (this.filterbydate?.start_date && this.filterbydate?.end_date) {
      if (this.filterbydate.start_date <= this.filterbydate.end_date) {
        // Reset Item Type and Time Range filter
        this.selectedItemType = 'All';
        this.selectedTimeRange = 'All';

        filteredData = filteredData.filter((item: any) => {
          const filteredcreateddate = moment(item?.invoice_date, 'DD-MM-YYYY').format('YYYY-MM-DD');
          if (filteredcreateddate) {
            return filteredcreateddate >= this.filterbydate.start_date &&
              filteredcreateddate <= this.filterbydate.end_date;
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


    this.getSumofInvoices(this.filteredItemData);
    // Update the filtered data with the search and date filters applied
    this.filteredItemData = filteredData;
    // this.searchedData = filteredData;
    // Update the total items count
    this.totalItems = this.filteredItemData.length;
    // Reset the page to the first page when new filters are applied
    this.page = 1;
  }




  navigateToNewRoute(items: any) {
    const queryParams = {
      searchTerm: this.searchTerm || '',
      page: this.page || 1,
      tableSize: this.tableSize || 10,
      from: this.filterbydate.start_date || '',
      to: this.filterbydate.end_date || '',
      sort: this.sortingorder || '',
      selectedItemType: this.selectedItemType || '',
      selectedTimeRange: this.selectedTimeRange || ''
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

  checkAndOpenFile(filePath: any) {
    console.log(filePath, "filepath");

    if (filePath) {
      const fullPath = this.baseUrl + filePath.filepath;
      this.checkService.checkFileExistence(this.baseUrl + filePath.filepath).subscribe(exists => {
        console.log(exists);
        if (exists) {
          window.open(fullPath, '_blank');
        } else {
          this.documentnotexists();
        }
      });
    }
    else {
      this.documentnotuploaded();
    }

  }

  openInvoiceModal(filePath: any) {
    if (filePath) {
      const fullPath = this.baseUrl + filePath.filepath;
      this.checkService.checkFileExistence(fullPath).subscribe(exists => {
        if (exists) {
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullPath); // Sanitize the URL
          $('#pdfModal').modal('show');
      
        } else {
          this.documentnotexists();
        }
      });
    } else {
      this.documentnotuploaded();
    }
  }

  closeModal() {
    this.pdfUrl = null; // Clear the PDF URL
    $('#pdfModal').modal('hide'); // Use jQuery to hide the modal
  }

  documentnotuploaded() {
    Swal.fire({
      icon: 'warning',
      title: 'Warning!',
      text: 'File not uploaded yet!'
    })
  }

  documentnotexists() {
    Swal.fire({
      icon: 'warning',
      title: 'Warning!',
      text: 'File does not exists!'
    })
  }

  openModal(data: any) {
    console.log(data, "data");
    if(!data.purchase_id.startsWith('BRND') && data.purchase_id!='NA'){
      this.dialog.open(PurchaseOrderViewComponent,{
      width:'1200px',
      maxHeight: '85vh',
      data:data.purchase_id
    }) 
    }else{
      Swal.fire({
        icon: 'warning',
        title: 'Warning!',
        text: 'PO does not exists!'
      })
    }
   
  }

  // closeModal() {
  //   this.isModalOpen = false; // Close the modal
  // }

  selectRange(): void {
    this.displayDateRange = true;
    this.displaySelectPeriod = false;
    this.selectedRadio = 'dateRange';

  }

  selectPeriod(): void {
    this.displayDateRange = false;
    this.displaySelectPeriod = true;
    this.selectedRadio = 'datePeriod';

  }

    // Clear the selected radio button
    clearSelection() {
      this.selectedRadio = null;
    }

}
