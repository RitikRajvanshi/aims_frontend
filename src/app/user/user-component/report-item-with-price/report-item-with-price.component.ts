import { Component, ViewChild, ElementRef } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { map, debounceTime } from 'rxjs';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';
import { FilesService } from 'src/app/services/files.service';
import { Subject } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-report-item-with-price',
  templateUrl: './report-item-with-price.component.html',
  styleUrls: ['./report-item-with-price.component.scss']
})
export class ReportItemWithPriceComponent {
  isDataorNot: boolean = true;
  itemsDataList: any = [];
  searchItem = '';
  itemCode: any;
  empltyDataList: any[] = [];
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];

  itemData: any[] = [];
  searchTerm: string = '';
  totalItems: number = 0;
  reportitemsdatabydate = {
    start_date: '',
    end_date: ''
  }
  currentdate: any;
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  isRotating: boolean = false;
  sortingorder: any;

  sumofamount: any;
  uniquePurchaseIds: any;
  searchSubject: Subject<string> = new Subject<string>();
  filterDatabycurrency: any[] = [];
  sumofamountByCurrency: any;
  allCurrencies: { currency: string }[] = [{ currency: 'All' }]
  filterBycurrency: string = '';
  previousUrl: any;


  constructor(private sharedService: SharedService, private router: Router, private spinner: NgxSpinnerService, private filesServices: FilesService, private location:Location) {
    const today = moment();
    this.currentdate = today.format('YYYY-MM-DD');
    this.getitemsDataListwithPrice();
  }

  ngOnInit(): void {
    this.getitemsDataListwithPrice();
  }


  async getitemsDataListwithPrice() {
    this.spinner.show();
    try {
      const results: any = await this.sharedService.getreportItemwithPrice()
        .pipe(retry(3))
        .toPromise();

      console.log(results, "reportitemsdatabydate");

      if (!results?.length) {
        this.isDataorNot = false;
        return;
      }

      this.isDataorNot = true;
      const uniqueCurrency = new Set<string>();

      // ✅ Step 1: Format dates and collect currencies
      const formattedResults = results.map((item: any) => {
        if (item.created_date) {
          item.created_date = moment(item.created_date).format('DD-MM-YYYY');
        }

         if (item.issue_date) {
          item.issue_date = moment(item.issue_date).format('DD-MM-YYYY');
        }

        if (item.currency) {
          uniqueCurrency.add(item.currency);
        }

        return item;
      });

      // ✅ Step 2: Create dropdown list (with 'All' first)
      this.allCurrencies = [
        { currency: 'All' },
        ...Array.from(uniqueCurrency).map(currency => ({ currency }))
      ];

      // ✅ Step 3: Default selection "All" (show everything)
      this.filterBycurrency = this.filterBycurrency || 'All';

      // ✅ Step 4: Filter data only if user selected specific currency
      let filteredResults = formattedResults;
      if (this.filterBycurrency && this.filterBycurrency !== 'All') {
        filteredResults = formattedResults.filter(
          (item: any) => item.currency === this.filterBycurrency
        );
      }

      // ✅ Step 5: Assign to component variables
      this.itemsDataList = filteredResults;
      this.itemData = formattedResults; // Keep full copy for resetting
      this.count = filteredResults.length;

      console.log(filteredResults, "getitemsDataListwithPrice with this.getSumgroupbycurrency");

      // ✅ Step 6: Calculate currency totals
      this.getSumgroupbycurrency(filteredResults);

      console.log(this.allCurrencies, "Dropdown currencies");
      console.log(filteredResults, "Filtered Results");
    } catch (error: any) {
      if (error instanceof HttpErrorResponse && error.status === 403) {
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Token expired.',
          footer: '<a href="../login">Please login again!</a>'
        }).then(() => this.router.navigate(['../login']));
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Internal server error. Please try again later!',
          footer: '<a href="../login">Login</a>'
        }).then(() => location.reload());
      }
    } finally {
      this.spinner.hide();
    }
  }





  async filterData(): Promise<void> {

    // If the originalData is not set, initialize it with the current itemsData
    if (!this.itemData) {
      this.itemData = this.itemData;
    }
    // Start with the original data or the previously filtered data
    let filteredData: any[] = this.itemData;

    // // Filter by search term
    if (this.searchTerm) {
      filteredData = filteredData.filter((item: any) => {
        return Object.keys(item).some(key => {
          if (item[key] !== null && item[key] !== '' && key === 'created_date') {
            return item[key]?.includes(this.searchTerm);
          } else if (item[key] !== null && item[key] !== '') {
            return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
          }
          return false;
        });
      });
    }



    // ✅ Filter by selected currency
    if (this.filterBycurrency && this.filterBycurrency !== 'All') {
      filteredData = filteredData.filter(
        (item: any) => item.currency === this.filterBycurrency
      );
    }

    // Filter by date range only if there is a valid date range
    if (this.reportitemsdatabydate?.start_date && this.reportitemsdatabydate?.end_date) {
      if (this.reportitemsdatabydate.start_date <= this.reportitemsdatabydate.end_date) {

        filteredData = filteredData.filter((item: any) => {
          const filtereddate = moment(item.created_date, 'DD-MM-YYYY').format('YYYY-MM-DD');

          if (filtereddate) {
            return filtereddate >= this.reportitemsdatabydate.start_date && filtereddate <= this.reportitemsdatabydate.end_date;
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
    this.itemsDataList = filteredData;
    // this.getSumofAmount(filteredData);
    this.getSumgroupbycurrency(filteredData)
    // this.getSumOfGroupedAmounts(filteredData);

    this.totalItems = this.itemsDataList.length;
    this.count = filteredData.length;
    this.page = 1; // Reset to the first page when filtering occurs
  }

  refreshfilter() {
    this.isRotating = true;
    this.getitemsDataListwithPrice().then(() => {
      // Clear date filters
      if (this.reportitemsdatabydate?.start_date || this.reportitemsdatabydate?.end_date) {
        this.reportitemsdatabydate.start_date = '';
        this.reportitemsdatabydate.end_date = '';
      }

      this.filterBycurrency ='All';

      // If the originalData is not set, initialize it with the current itemsData
      if (!this.itemData) {
        this.itemData = this.itemData;
      }
      // Start with the original data or the previously filtered data
      let filteredData: any[] = this.itemData;

      // // Filter by search term
      if (this.searchTerm) {
        filteredData = filteredData.filter((item: any) => {
          return Object.keys(item).some(key => {
            if (item[key] !== null && item[key] !== '' && key === 'created_date') {
              return item[key]?.includes(this.searchTerm);
            } else if (item[key] !== null && item[key] !== '') {
              return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
            }
            return false;
          });
        });
      }
      // Update filtered data and totalItems
      this.itemsDataList = filteredData;

      // this.getSumofAmount(filteredData);
      this.getSumgroupbycurrency(filteredData)
      filteredData
      this.totalItems = this.itemsDataList.length;
      this.page = 1; // Reset to the first page when filtering occurs
      this.count = filteredData.length;
      setTimeout(() => {
        this.isRotating = false;
      }, 500); // Adjust the duration as needed
    });

  }

  ontableDatachange(event: any) {
    this.page = event;
    // this.getitemsDataListwithPrice();

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
    // this.getitemsDataListwithPrice();

  }

  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
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

    this.itemsDataList.sort((a: any, b: any) => {
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

 

  getSumgroupbycurrency(data: any) {
    const result: Record<string, typeof data> = data.reduce((acc: any, item: any) => {
      const key = item.currency;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, typeof data>);
    console.log(result, "groupBy");

    // console.log(grouped, "this.filterDatabycurrency");
    this.getSumOfGroupedAmounts(result);
  }

  getSumofAmount(filteredResults: any[]) {
    const sumofTotals = filteredResults.reduce((sum: number, item: any) => {
      const total = typeof item.total === 'number' ? parseFloat(item.total.toFixed(2)) : 0;
      return sum + total;
    }, 0);
    this.sumofamount = sumofTotals ? sumofTotals.toFixed(2) : 0;
    console.log(this.sumofamount, "this.sumofamount");
  }

  getSumOfGroupedAmounts(groupedResults: Record<string, any[]>) {
    const sumsByCurrency: Record<string, number> = {};

    for (const currency in groupedResults) {
      const items = groupedResults[currency];
      sumsByCurrency[currency] = items.reduce((sum, item) => {
        const total = typeof item.total === 'number' ? item.total : parseFloat(item.total) || 0;
        return sum + total;
      }, 0);
      sumsByCurrency[currency] = parseFloat(sumsByCurrency[currency].toFixed(2));
    }

    this.sumofamountByCurrency = sumsByCurrency;
    console.log(this.sumofamountByCurrency, "sum of amounts by grouped currency");
  }


  exportToexcelfromnode(): any {
    const LRM = "\u200E";
    const priorityOrder = ['₹', '$'];  // You can add more symbols as needed
    const currencySummaryArray = Object.entries(this.sumofamountByCurrency)
      .sort(([a], [b]) => {
        if (a === '₹') return 1;  // Push '₹' down
        if (b === '₹') return -1; // Keep 'b' above if it's not '₹'
        return a.localeCompare(b); // Sort others alphabetically (or skip this line to keep original order)
      }).map(([currency, amount]) =>
   `${LRM}${currency} ${amount}`
  );

      // .map(([currency, amount]) => `${currency} ${amount}`);

   const currencySummaryText = currencySummaryArray.join(` ${LRM}+ `);

    const modifiedItemsDataList = this.itemsDataList.map((item: any, index: any) => {
      const toFixedsubtotal = item.sub_total ? +item.sub_total.toFixed(2) : 0;
      const toFixedTotalPrice = item.total ? +item.total.toFixed(2) : 0;
      const currencySymbol = item.currency || '₹';
      return {
        ...item,  // Spread the original object properties
        "sub_total": `${currencySymbol} ${toFixedsubtotal}`,
        "total": `${currencySymbol} ${toFixedTotalPrice}`,
        "S.No.": index + 1  // Add the S.No. field with the appropriate value
      };
    });

    const reportRequest = {
      reportTitle: "Report Items with Price",
      currencySummaryText,
      columns: [
        { header: 'S.No.', key: 'S.No.', width: 10, filterButton: false },
        { header: 'Purchase Id', key: 'purchase_id', width: 35, filterButton: true },
        { header: 'Item Code', key: 'item_code', width: 55, filterButton: true },
        { header: 'Item Name', key: 'item_name', width: 35, filterButton: true },
        { header: 'Vendor\'s Name', key: 'supplier_name', width: 55, filterButton: true },
        { header: 'Price', key: 'sub_total', width: 25, filterButton: false },
        { header: 'Price with GST', key: 'total', width: 25, filterButton: false },
        { header: 'Moved to Inventory Date', key: 'created_date', width: 30, format: 'date', filterButton: false },
      ],

      data: modifiedItemsDataList, // Data to populate the report
      totalsrow: false,
      filters: [
        { filterBy: (this.reportitemsdatabydate.start_date && this.reportitemsdatabydate.end_date) ? 'Moved to Inventory Date' : '', startDate: this.reportitemsdatabydate.start_date || '', endDate: this.reportitemsdatabydate.end_date || '' }
      ]
    };

    this.filesServices.exportToExcel(reportRequest).subscribe(
      (response: Blob) => {
        // Call downloadBlob to trigger the download with the response
        this.filesServices.downloadBlob(response, 'report_items_with_price.xlsx');
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

    if (this.reportitemsdatabydate && this.reportitemsdatabydate.start_date) queryParams.from = this.reportitemsdatabydate.start_date;
    if (this.reportitemsdatabydate && this.reportitemsdatabydate.end_date) queryParams.to = this.reportitemsdatabydate.end_date;

    this.previousUrl = this.location.path().split('?')[0];
    // console.log(this.previousUrl, "this.previousUrl")
    // localStorage.setItem('backUrl', this.previousUrl);

    // Store the current URL with query params
    localStorage.setItem('backUrl', this.previousUrl + this.buildQueryString(queryParams));
    localStorage.setItem('navigated', 'true'); // Set the flag for navigation
    this.router.navigate(['user/purchase-info', items.purchase_id], { queryParams });
  }

    buildQueryString(params: any): string {
    return '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&');
  }
}
