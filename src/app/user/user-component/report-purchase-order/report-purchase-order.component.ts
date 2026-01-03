import { Component, ViewChild, ElementRef } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { VendorEvaluationModalComponent } from '../vendor-evaluation-modal/vendor-evaluation-modal.component';
import { environment } from 'src/app/environments/environment.prod';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { CheckService } from 'src/app/services/check.service';
import { retry } from 'rxjs/operators';
import { PurchaseOrderViewComponent } from '../purchase-order-view/purchase-order-view.component';
import { FilesService } from 'src/app/services/files.service';

@Component({
  selector: 'app-report-purchase-order',
  templateUrl: './report-purchase-order.component.html',
  styleUrls: ['./report-purchase-order.component.scss']
})
export class ReportPurchaseOrderComponent {
  @ViewChild('tablepurchaseOrder') tablepurchaseOrder!: ElementRef;

  isDataorNot: boolean = true;
  empltyDataList = [];
  datesforpofilter = {
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

  lastfinnancialyrDate: any;
  nextfinnancialyrDate: any;
  purchaseId: any;
  previousUrl: any;
  baseUrl: any
  itemsData: any[] = [];
  // itemsData: any[] = [];
  filteredpoData: any[] = [];
  // filteredpoData: any[] = [];
  searchTerm: string = '';
  totalItems: number = 0;
  currentdate: any;
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  isRotating: boolean = false;
  private isNavigatedBack: boolean = false; // Flag to check navigation source
  sortingorder: any;
  mode: string = '';

  constructor(private sharedService: SharedService, private router: Router, private matdialog: MatDialog,
    private location: Location, private spinner: NgxSpinnerService, private checkService: CheckService, private activatedRoute: ActivatedRoute, private fileService: FilesService) {
    const today = moment();
    this.currentdate = today.format('YYYY-MM-DD');
  }

  ngOnInit(): void {
    this.statemanagement();
    this.getpurchaseData();
    this.baseUrl = environment.BASE_URL;
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
          this.datesforpofilter.start_date = params['from'];
          this.datesforpofilter.end_date = params['to'];
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

  getFinancialYear() {
    const today = moment();
    const curMonth = today.month() + 1;
    const curYear = today.year();

    if (curMonth > 3) {
      this.lastfinnancialyrDate = moment(`${curYear}-04-01`).format('YYYY-MM-DD');
      this.nextfinnancialyrDate = moment(`${curYear + 1}-03-31`).format('YYYY-MM-DD');
    } else {
      this.lastfinnancialyrDate = moment(`${curYear - 1}-04-01`).format('YYYY-MM-DD');
      this.nextfinnancialyrDate = moment(`${curYear}-03-31`).format('YYYY-MM-DD');
    }
  }

  async getpurchaseData() {
    try {
      this.spinner.show();
      const results: any = await this.sharedService.getreportpurchaseorderData().pipe(
        retry(3), // Retry the request up to 3 times
        // catchError((error: HttpErrorResponse) => {
        //   console.error('Error fetching accepted requests:', error);
        //   return of([]); // Return an empty array if an error occurs
        // })
      ).toPromise();

      console.log(results, "results");

      if (results?.length == 0) {
        this.spinner.hide();
        this.isDataorNot = false;
      }
      else {
        this.isDataorNot = true;
        const filteredResults = results.map((item: any) => {
          const splitcreateddate = item.created_date ? moment(item.created_date).format('DD-MM-YYYY') : null;
          const splitmodifieddate = item.modified_date ? moment(item.modified_date).format('DD-MM-YYYY') : null;
          const splitsentdata = item.sent_date ? moment(item.sent_date).format('YDD-MM-YYYY') : null;
          return { ...item, created_date: splitcreateddate, modified_date: splitmodifieddate, sent_date: splitsentdata };
        });

        this.filteredpoData = filteredResults;

        console.log(filteredResults, "filteredResults")

        this.itemsData = filteredResults;
        this.purchaseId = filteredResults[0].purchase_id;
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


  async filterData(): Promise<void> {
    // If the originalData is not set, initialize it with the current itemsData
    if (!this.itemsData) {
      this.itemsData = this.itemsData;
    }
    // Start with the original data or the previously filtered data
    let filteredData: any[] = this.itemsData;

    // 🔹 Filter by mode
    if (this.mode !== '' && this.mode !== undefined && this.mode !== null) {
      filteredData = filteredData.filter(item => item.category?.toString() === this.mode.toString());
    }
    // // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();


      filteredData = filteredData.filter((item: any) => {

        // Convert category to text (Online/Offline)
        const categoryText = item.category?.toString() === '1' ? 'online' : 'offline';

        // If user searches "online" or "offline"
        if (categoryText.includes(term)) {
          return true;
        }

        // const categoryText = item.category?.toString() === '1' ? 'Online' : 'Offline';

        // return Object.keys(item).some(key => {

        //   if (item[key] !== null && item[key] !== '' && key === 'created_date' || key === 'modified_date' || key === 'sent_date') {
        //     return item[key]?.includes(this.searchTerm);
        //   }
        //    else if (item[key] !== null && item[key] !== '') {
        //     return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
        //   }
        //   return false;
        // });

        return Object.keys(item).some(key => {

          const value = item[key];

          // Special fields: created_date, modified_date, sent_date
          if (
            ['created_date', 'modified_date', 'sent_date'].includes(key) &&
            value
          ) {
            return value.toString().toLowerCase().includes(term);
          }

          // Normal Fields
          if (value !== null && value !== '') {
            return value.toString().toLowerCase().includes(term);
          }

          return false;
        });
      });
    }

    // Filter by date range only if there is a valid date range
    if (this.datesforpofilter?.start_date && this.datesforpofilter?.end_date) {
      if (this.datesforpofilter.start_date <= this.datesforpofilter.end_date) {
        filteredData = filteredData.filter((item: any) => {
          const filteredcreateddate = moment(item?.created_date, 'DD-MM-YYYY').format('YYYY-MM-DD');
          if (filteredcreateddate) {
            return filteredcreateddate >= this.datesforpofilter.start_date &&
              filteredcreateddate <= this.datesforpofilter.end_date;
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
    this.filteredpoData = filteredData;



    this.totalItems = this.filteredpoData.length;
    this.count = filteredData.length;
    this.mode = '';
    this.page = 1; // Reset to the first page when filtering occurs
  }

  refreshfilter() {
    this.isRotating = true;
    this.getpurchaseData().then(() => {
      // Clear date filters
      if (this.datesforpofilter?.start_date || this.datesforpofilter?.end_date) {
        this.datesforpofilter.start_date = '';
        this.datesforpofilter.end_date = '';
      }
      // If the originalData is not set, initialize it with the current itemsData
      if (!this.itemsData) {
        this.itemsData = this.itemsData;
      }
      // Start with the original data or the previously filtered data
      let filteredData: any[] = this.itemsData;

      // // Filter by search term
      if (this.searchTerm) {
        filteredData = filteredData.filter((item: any) => {
          return Object.keys(item).some(key => {
            if (item[key] !== null && item[key] !== '' && key === 'created_date' || key === 'modified_date' || key === 'sent_date') {
              return item[key]?.includes(this.searchTerm);
            } else if (item[key] !== null && item[key] !== '') {
              return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
            }
            return false;
          });
        });
      }
      // Update filtered data and totalItems
      this.filteredpoData = filteredData;
      this.totalItems = this.filteredpoData.length;
      this.page = 1; // Reset to the first page when filtering occurs
      setTimeout(() => {
        this.isRotating = false;
      }, 500);
    });
  }

  supplierEvaluationData(id: any) {
    //setting height width of the model and sending data to the VendorEvaluationModalComponent...
    this.matdialog.open(VendorEvaluationModalComponent, {
      width: 'auto', height: 'auto',
      data: {
        supplier_id: id
      }
    });
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

  exportToexcelfromnode(): any {
    const modifiedItemsDataList = this.filteredpoData.map((item: any, index: any) => {

      const convertedOrderedItems = item.products.join(", "); // to change array item like ["1 CPU", "2 Mouse"](array) --> 1 CPU, 2 Mouse(string)

      return {
        ...item,  // Spread the original object properties
        "products": convertedOrderedItems,
        "S.No.": index + 1, // Add the S.No. field with the appropriate value
        "category": item.category == '1' ? 'Online' : 'Offline'
      };
    });

    const reportRequest = {
      reportTitle: "Report Purchase Order",
      columns: [
        { header: 'S.No.', key: 'S.No.', width: 10, filterButton: false },
        { header: 'Purchase Id', key: 'purchase_id', width: 35, filterButton: true },
        { header: 'Vendor Name', key: 'supplier_name', width: 55, filterButton: true },
        { header: 'Purchase Mode', key: 'category', width: 25, filterButton: true },
        { header: 'Purchase Date', key: 'created_date', width: 35, format: 'date', filterButton: false },
        { header: 'Ordered Items', key: 'products', width: 80, format: 'date', filterButton: false },
      ],

      data: modifiedItemsDataList, // Data to populate the report
      totalsrow: false,

      filters: [
        { filterBy: (this.datesforpofilter.start_date && this.datesforpofilter.end_date) ? 'Purchase Date' : '', startDate: this.datesforpofilter.start_date || '', endDate: this.datesforpofilter.end_date || '' }
      ]
    };

    this.fileService.exportToExcel(reportRequest).subscribe(
      (response: Blob) => {
        // Call downloadBlob to trigger the download with the response
        this.fileService.downloadBlob(response, 'report_purchase_order.xlsx');
      },
      (error) => {
        console.error('Error exporting to Excel', error);
      }
    );
  }

  toggleExpand(item: any) {
    item.isExpanded = !item.isExpanded;
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

    this.filteredpoData.sort((a: any, b: any) => {
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
      from: this.datesforpofilter.start_date || '',
      to: this.datesforpofilter.end_date || '',
      sort: this.sortingorder || '',
    }

    this.previousUrl = this.location.path().split('?')[0];
    // console.log(this.previousUrl, "this.previousUrl")
    // localStorage.setItem('backUrl', this.previousUrl);

    // Store the current URL with query params
    localStorage.setItem('backUrl', this.previousUrl + this.buildQueryString(queryParams));
    localStorage.setItem('navigated', 'true'); // Set the flag for navigation
    this.router.navigate(['user/purchase-order-view', items.purchase_id], { queryParams });
  }

  buildQueryString(params: any): string {
    return '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&');
  }

  invoicenotuploaded() {
    Swal.fire({
      icon: 'warning',
      title: 'Warning!',
      text: 'Invoice not uploaded yet!'
    }).then(() => {
      this.ngOnInit();
    })
  }

  checkAndOpenFile(filePath: string) {
    if (filePath) {
      const fullPath = this.baseUrl + filePath;
      this.checkService.checkFileExistence(this.baseUrl + filePath).subscribe(exists => {
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
    this.matdialog.open(PurchaseOrderViewComponent, {
      width: '1200px',
      maxHeight: '85vh',
      data: data.purchase_id
    })
  }

}
