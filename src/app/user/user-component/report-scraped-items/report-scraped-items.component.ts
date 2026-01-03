import { Component } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { map } from 'rxjs/operators';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';
import { FilesService } from 'src/app/services/files.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-report-scraped-items',
  templateUrl: './report-scraped-items.component.html',
  styleUrls: ['./report-scraped-items.component.scss']
})
export class ReportScrapedItemsComponent {
  isDataorNot: boolean = true;
  empltyDataList = [];
  Dates = {
    start_date: '',
    end_date: ''
  }
  displayList = false;
  purchaseDataList: any = [];
  searchItem = '';

  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];
  itemsperPage: any = 20;

  lastfinnancialyrDate: any;
  nextfinnancialyrDate: any;
  purchaseId: any;
  previousUrl: any;
  baseUrl: any

  itemsData: any[] = [];
  // itemsData: any[] = [];
  filtereditemsdata: any[] = [];
  // filteredpoData: any[] = [];
  searchTerm: string = '';
  totalItems: number = 0;
  currentdate: any;
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  isRotating: boolean = false;
  sortingorder: any;
  private isNavigatedBack: boolean = false; // Flag to check navigation source
  filerBylocation: number = 0;
  // allLocations:unknown=[];
  allLocations: { location_id: number; location_name: string }[] = [{location_id:0, location_name:'All'}];

  constructor(private sharedService: SharedService, private router: Router,
    private location: Location, private spinner: NgxSpinnerService, private fileService: FilesService, private activatedRoute: ActivatedRoute) {
    const today = moment();
    this.currentdate = today.format('YYYY-MM-DD');
  }

  ngOnInit() {
    this.getscrappedgiftedandsoldoutfromitems();
    this.statemanagement();
  }


  statemanagement() {
    this.isNavigatedBack = localStorage.getItem('navigated') === 'true';
    localStorage.removeItem('navigated');
    this.activatedRoute.queryParams.subscribe(async (params: any) => {
      if (this.isNavigatedBack === true) {
        if (params['searchTerm'] && params['searchTerm'] !== '') {
          this.searchTerm = params['searchTerm'];
        }

        if (params['itemsperPage']) {
          this.itemsperPage = params['itemsperPage'];
        }

        if(params['filerBylocation']){
          this.filerBylocation = Number(params['filerBylocation']);
        }

        if (params['from'] && params['from'] !== '' && params['to'] && params['to'] !== '') {
          this.Dates.start_date = params['from'];
          this.Dates.end_date = params['to'];
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
            // console.log(params['sort'].split('-')[1]);
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



  async getscrappedgiftedandsoldoutfromitems() {
    this.spinner.show();
    try {
      const results: any = await this.sharedService.getscrapedgiftedsoldoutdatafromitems().pipe(
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
        const seenLocationIds = new Set<number>();
        this.allLocations = [{location_id:0, location_name:'All'}]; // ✅ Reset before adding new ones

        const filteredResults = results.map((item: any) => {
          const splittransferdate = item?.transfer_date ? moment(item?.transfer_date).format('DD-MM-YYYY') : null;
          const splitpurchasedate = item?.purchase_date ? moment(item?.purchase_date).format('DD-MM-YYYY') : null;
          const splitinvoicedate = item?.invoice_date ? moment(item?.invoice_date).format('DD-MM-YYYY') : null;

          // ✅ collect unique locations while mapping
          if (item.location_id && !seenLocationIds.has(item.location_id)) {
            seenLocationIds.add(item.location_id);
            this.allLocations.push({
              location_id: item.location_id,
              location_name: item.location_name
            });
          }

          return { ...item, transfer_date: splittransferdate, purchase_date: splitpurchasedate, invoice_date: splitinvoicedate };

        });
        console.log(filteredResults, "filteredResults");
        this.filtereditemsdata = filteredResults;
        this.itemsData = filteredResults;
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

  async filterData() {
    // If the originalData is not set, initialize it with the current itemsData
    if (!this.itemsData) {
      this.itemsData = this.itemsData;
    }
    // Start with the original data or the previously filtered data
    let filteredData: any[] = this.itemsData;

      // ✅ Filter by selected location
  if (this.filerBylocation && this.filerBylocation !== 0) {
    filteredData = filteredData.filter(
      (item: any) => item.location_id === Number(this.filerBylocation)
    );
  }


  if ( this.filerBylocation == 0) {
    filteredData = this.itemsData;
  }

    
    // // Filter by search term
    if (this.searchTerm) {
      console.log(this.searchTerm, "this.searchTerm");
      filteredData = filteredData.filter((item: any) => {
        return Object.keys(item).some(key => {
          if (item[key] !== null && item[key] !== '' && key === 'transfer_date') {
            return item[key]?.includes(this.searchTerm);
          } else if (item[key] !== null && item[key] !== '') {
            return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
          }
          return false;
        });
      });
    }


    // Filter by date range only if there is a valid date range
    if (this.Dates?.start_date && this.Dates?.end_date) {
      if (this.Dates.start_date <= this.Dates.end_date) {
        filteredData = filteredData.filter((item: any) => {
          const filteredtransferdate = moment(item?.transfer_date, 'DD-MM-YYYY').format('YYYY-MM-DD');
          if (filteredtransferdate) {
            return filteredtransferdate >= this.Dates.start_date &&
              filteredtransferdate <= this.Dates.end_date;
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
    this.filtereditemsdata = filteredData;
    this.totalItems = this.filtereditemsdata?.length;
    this.count = this.totalItems;
    this.page = 1; // Reset to the first page when filtering occurs
  }

  refreshfilter() {
    this.isRotating = true;
    this.getscrappedgiftedandsoldoutfromitems().then(() => {
      // Clear date filters
      if (this.Dates?.start_date || this.Dates?.end_date) {
        this.Dates.start_date = '';
        this.Dates.end_date = '';
      }

      this.filerBylocation = 0;

      // If the originalData is not set, initialize it with the current itemsData
      if (!this.itemsData) {
        this.itemsData = this.itemsData;
      }
      // Start with the original data or the previously filtered data
      let filteredData: any[] = this.itemsData;
      // // Filter by search term
      if (this.searchTerm) {
        // console.log(this.searchTerm, "this.searchTerm");
        filteredData = filteredData.filter((item: any) => {
          return Object.keys(item).some(key => {
            if (item[key] !== null && item[key] !== '' && key === 'transfer_date') {
              return item[key]?.includes(this.searchTerm);
            } else if (item[key] !== null && item[key] !== '') {
              return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
            }
            return false;
          });
        });
      }

      // Update filtered data and totalItems
      this.filtereditemsdata = filteredData;
      this.totalItems = this.filtereditemsdata.length;
      this.page = 1; // Reset to the first page when filtering occurs
      // Simulate async operation and stop rotation after completion
      setTimeout(() => {
        this.isRotating = false;
      }, 500); // Adjust the duration as needed
    });
  }


  // sort(columnName: string) {
  //   if (this.currentSortColumn === columnName) {
  //     this.isAscending = !this.isAscending; // Toggle sorting order
  //   } else {
  //     this.currentSortColumn = columnName; // Update current sort column
  //     this.isAscending = true; // Set sorting order to ascending for the new column
  //   }

  //   this.filtereditemsdata.sort((a: any, b: any) => {
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

    this.filtereditemsdata.sort((a: any, b: any) => {
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

  exportToExcel() {
    const randomDate = new Date().valueOf();
    const uri = 'data:application/vnd.ms-excel;base64,';
    const template = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
      <body>{table}</body>
      </html>
    `;
    const base64 = function (s: any) { return window.btoa(unescape(encodeURIComponent(s))) };
    const format = function (s: any, c: any) { return s.replace(/{(\w+)}/g, function (m: any, p: any) { return c[p]; }) };

    // Define your column names
    const columnNames = ['S.No.', 'Item Code', 'Item Name', 'Location', 'Transfer Date', 'Transferred By'];

    const tableHtml = `<table style="border-collapse: collapse; width: 80%; background-color: #f2f2f2;">
    <thead>
      <tr style="background-color: #00008B; color:#fff;">
        ${columnNames.map((name) => `<th style="border: 1px solid #dddddd; text-align: left; padding: 1px;">${name}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${this.filtereditemsdata.map((item: any, index: number) => {
      return `
          <tr style="border: 1px solid #dddddd; text-align: left; padding: 1px;">
            <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${index + 1}</strong></td>
            <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.item_code ? item.item_code : 'NA'}</strong></td>
            <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.item_name ? item.item_name : 'NA'}</strong></td>
            <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.location_name ? item.location_name : 'NA'}</strong></td>
            <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.transfer_date ? item.transfer_date : 'NA'}</strong></td>
            <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.user_name ? item.user_name : 'NA'}</strong></td>
          </tr>`;
    }).join('')}
    </tbody>
  </table>`;

    const ctx = { worksheet: 'Worksheet', table: tableHtml };
    const link = document.createElement('a');
    // link.download = `scrapped/soldout/gifted_data${this.currentdate}_${randomDate}.xls`;
    link.download = `report_scrapped/soldout/gifted_data.xls`;
    link.href = uri + base64(format(template, ctx));
    link.click();
  }

  exportToexcelfromnode(): any {

    const modifiedItemsDataList = this.filtereditemsdata.map((item: any, index: any) => {

      return {
        ...item,  // Spread the original object properties
        purchase_date: (item.invoice_date ? item.invoice_date : item.purchase_date) || 'NA',
        "S.No.": index + 1  // Add the S.No. field with the appropriate value
      };
    });

    const reportRequest = {
      reportTitle: "Report Scrapped/Soldout/Gifted",
      columns: [
        { header: 'S.No.', key: 'S.No.', width: 10, filterButton: false },
        { header: 'Item Code', key: 'item_code', width: 55, filterButton: false },
        { header: 'Item Name', key: 'item_name', width: 35, filterButton: true },
        { header: 'Purchase Date', key: 'purchase_date', width: 35, filterButton: true },
        { header: 'Location', key: 'location_name', width: 35, filterButton: true },
        { header: 'Transfer Date', key: 'transfer_date', width: 35, format: 'date', filterButton: true },
        { header: 'Transferred By', key: 'user_name', width: 30, filterButton: true },
      ],

      data: modifiedItemsDataList, // Data to populate the report
      totalsrow: false,
      filters: [
        { filterBy: (this.Dates.start_date && this.Dates.end_date) ? 'Transfer Date' : '', startDate: this.Dates.start_date || '', endDate: this.Dates.end_date || '' }
      ]
    };

    this.fileService.exportToExcel(reportRequest).subscribe(
      (response: Blob) => {
        // Call downloadBlob to trigger the download with the response
        this.fileService.downloadBlob(response, 'report_items_scrapped/soldout/gifted.xlsx');
      },
      (error) => {
        console.error('Error exporting to Excel', error);
      }
    );
  }

  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }

  }

  ontableDatachange(event: any) {
    this.page = event;
    // this.submitDate();
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
    // this.submitDate();
  }


  navigateTopurchaseinfo(items: any) {
    const queryParams: any = {};

    // Add properties to queryParams only if their values are not empty or undefined
    if (this.searchTerm) queryParams.searchTerm = this.searchTerm;
    if (this.page) queryParams.page = this.page;
    if (this.tableSize) queryParams.tableSize = this.tableSize;
    if (this.Dates && this.Dates.start_date) queryParams.from = this.Dates.start_date;
    if (this.Dates && this.Dates.end_date) queryParams.to = this.Dates.end_date;
    if (this.purchaseId) queryParams.purchaseId = this.purchaseId;
    if (this.sortingorder) queryParams.sort = this.sortingorder;
    if (this.itemsperPage) queryParams.itemsperPage = this.itemsperPage;
    if (this.filerBylocation) queryParams.filerBylocation = this.filerBylocation;

    this.previousUrl = this.location.path().split('?')[0];
    // Store the current URL with query params
    localStorage.setItem('backUrl', this.previousUrl + this.buildQueryString(queryParams));
    localStorage.setItem('navigated', 'true'); // Set the flag for navigation
    this.router.navigate(['user/purchase-info', items.purchase_id], { queryParams });
  }

  buildQueryString(params: any): string {
    return '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&');
  }

}
