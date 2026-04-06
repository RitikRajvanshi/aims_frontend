import { Component, ViewChild, ElementRef } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { retry } from 'rxjs/operators';
import { Location } from '@angular/common';
import { FilesService } from 'src/app/services/files.service';

@Component({
  selector: 'app-item-with-po-invoice-movetoinventory-for-a-period',
  templateUrl: './item-with-po-invoice-movetoinventory-for-a-period.component.html',
  styleUrls: ['./item-with-po-invoice-movetoinventory-for-a-period.component.scss']
})
export class ItemWithPoInvoiceMovetoinventoryForAPeriodComponent {
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
  selectItem: any = null;
  selectVendor: any = null;

  filteredByDates = [
    { value: 'invoice_date', viewValue: 'Invoice Date' },
    { value: 'po_created_date', viewValue: 'PO Creation Date' },
    { value: 'transfer_to_inventory_date', viewValue: 'Moved to Inventory Date' },
  ];

  items: String[] = [];
  vendors: String[] = [];

  filterByItemName: boolean = false;
  filterByVendorName: boolean = false;

  filteringBy: string = 'invoice_date';
  previousUrl: any;
  private isNavigatedBack: boolean = false; // Flag to check navigation source
  sortingorder: any;
  originalData: any;
  sumofamount: any;
  sumofamountByCurrency: any;

  constructor(private sharedService: SharedService, private router: Router, private spinner: NgxSpinnerService,
    private https: HttpClient, private location: Location, private activatedRoute: ActivatedRoute, private fileService: FilesService) {
    const today = moment();
    this.currentdate = today.format('YYYY-MM-DD');

  }

  ngOnInit(): void {
    this.statemanagement();
    this.getitemsDataListwithPrice();
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
          this.reportitemsdatabydate.start_date = params['from'];
          this.reportitemsdatabydate.end_date = params['to'];
        }

        if (params['filteringBy'] && params['filteringBy'] !== '') {
          this.filteringBy = params['filteringBy'];
        }

        if (params['selectItem'] && params['selectItem'] !== '') {
          this.selectItem = params['selectItem'];
        }

        if (params['selectVendor'] && params['selectVendor'] !== '') {
          this.selectVendor = params['selectVendor'];
        }

        setTimeout(() => {

          if (params['selectItem'] || params['selectVendor']) {
            this.filterDatabynames().then(() => {
              this.filterData();
            })

          }

          // Call the filter method to apply the saved state
          this.filterData().then(() => {
            this.filterDatabynames();
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
          })
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

  async getitemsDataListwithPrice() {
    this.spinner.show();
    try {
      const results: any = await this.sharedService.getreportitemwithpoinvoicemovetoinvenotryforaperiod().pipe(
        retry(3),
      ).toPromise();

      console.log(results, "reportitemsdatabydate");
      if (results?.length == 0) {
        this.spinner.hide();
        this.isDataorNot = false;
      }
      else {
        this.isDataorNot = true;
        this.items.length = 0;
        this.vendors.length = 0;
        const filteredResults = results.map((item: any) => {
          const splitePOcreateddate = item.po_created_date ? moment(item.po_created_date).format('DD-MM-YYYY') : null;
          const spliteInvoicedate = item.invoice_date ? moment(item.invoice_date).format('DD-MM-YYYY') : null;
          const splittransferDate = item.transfer_to_inventory_date ? moment(item.transfer_to_inventory_date).format('DD-MM-YYYY') : null;

          this.items.push(item.item_name);
          this.vendors.push(item.supplier_name);

          return { ...item, po_created_date: splitePOcreateddate, transfer_to_inventory_date: splittransferDate, invoice_date: spliteInvoicedate };
        });

        this.itemsDataList = filteredResults;
        this.itemData = filteredResults;
        this.originalData = filteredResults;
        this.count = filteredResults.length;
        console.log(filteredResults, "filteredResults");

        this.items = Array.from(new Set(this.items)).sort((a: any, b: any) => a.localeCompare(b));
        this.vendors = Array.from(new Set(this.vendors)).sort((a: any, b: any) => a.localeCompare(b));
        this.getSumgroupbycurrency(filteredResults);
        // this.getSumofAmount(filteredResults);

        console.log(this.items, "items");
        console.log(this.vendors, "vendors");
      }
    }
    catch (error: unknown) {
      console.error(error);
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
    if (!this.originalData) {
      this.originalData = this.itemData;  // Initialize the original data once
    }

    let filteredData: any[] = this.originalData;
    let tempFilterData: any[] = this.originalData;

    if (this.selectItem || this.selectVendor) {
      //if already filter by itemname and vendor then data should be filter by itemsDataList

      filteredData = this.itemsDataList;
    }
    // Start with the original data or the previously filtered data


    // // Filter by search term
    if (this.searchTerm) {
      filteredData = tempFilterData.filter((item: any) => {
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

    // Filter by date range only if there is a valid date range
    if (this.reportitemsdatabydate?.start_date && this.reportitemsdatabydate?.end_date) {


      if (this.reportitemsdatabydate.start_date <= this.reportitemsdatabydate.end_date) {

        filteredData = tempFilterData.filter((item: any) => {

          const fileredBy = this.filteringBy;
          // console.log(item[fileredBy]);
          // according filtered by dropdown it filters the data
          // console.log(fileredBy, "fileredBy");
          // const filteringDate = 
          const filtereddate = moment(item[fileredBy], 'DD-MM-YYYY').format('YYYY-MM-DD');

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
    this.itemData = filteredData;
    this.totalItems = this.itemsDataList.length;
    // this.getSumofAmount(filteredData);
    this.getSumgroupbycurrency(filteredData);
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

      // If originalData is not set, initialize it with the current itemData
      if (!this.originalData) {
        this.originalData = this.itemData;  // Initialize once
      }

      // Start with the original data or previously filtered data
      let filteredData = this.originalData || this.itemData;

      // Filter by search term
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
      this.totalItems = this.itemsDataList.length;
      this.page = 1; // Reset to the first page when filtering occurs
      this.selectItem = null;
      this.selectVendor = null;
      this.filteringBy = 'invoice_date';
      this.onClear();

      // Directly set isRotating to false after processing
      this.isRotating = false;
    }).catch((error) => {
      console.error('Error fetching data:', error);
      this.isRotating = false;  // Ensure it's false even if there is an error
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


  exportToexcelfromnode(): any {
    //    const currencySummaryArray = Object.entries(this.sumofamountByCurrency).map(
    //   ([currency, amount]) => `${currency} ${amount}`
    // );
    // const currencySummaryText = `${currencySummaryArray.join(' + ')}`;
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


   const currencySummaryText = currencySummaryArray.join(` ${LRM}+ `);

    const modifiedItemsDataList = this.itemsDataList.map((item: any, index: any) => {
       const toFixedSubtotalPrice = item.sub_total ? +item.sub_total.toFixed(2) : 0;
      const toFixedTotalPrice = item.total ? +item.total.toFixed(2) : 0;
      const currencySymbol = item.currency || '₹';
      return {
        ...item,  // Spread the original object properties
        "sub_total": `${currencySymbol} ${toFixedSubtotalPrice}`,
        "total": `${currencySymbol} ${toFixedTotalPrice}`,
        "S.No.": index + 1, // Add the S.No. field with the appropriate value
      };
    });
    const reportRequest = {
      reportTitle: "Items by PO/Invoice/Moved to Inventory for a Period",
      currencySummaryText,
      columns: [
        { header: 'S.No.', key: 'S.No.', width: 10, filterButton: false },
        { header: 'Item Code', key: 'item_code', width: 30, filterButton: true },
        { header: 'Item Name', key: 'item_name', width: 30, filterButton: true },
        { header: 'Vendor Name', key: 'supplier_name', width: 30, filterButton: true },
        { header: 'Price', key: 'sub_total', width: 15, format: 'currency', filterButton: false},
        { header: 'Price with GST', key: 'total', width: 22, format: 'currency', filterButton: false},
        { header: 'PO Creation Date', key: 'po_created_date', width: 22, format: 'date', filterButton: false },
        { header: 'Invoice Date', key: 'invoice_date', width: 17, format: 'date', filterButton: false },
        { header: 'Moved to Inventory', key: 'transfer_to_inventory_date', width: 30, format: 'date', filterButton: false },
      ],

      data: modifiedItemsDataList, // Data to populate the report
      totalsrow: false,
      filters: [
        { filterBy: this.filteringBy || '', startDate: this.reportitemsdatabydate.start_date || '', endDate: this.reportitemsdatabydate.end_date || '', searchBy: [{ item: this.selectItem, vendors: this.vendors }] }
      ]
    };

    this.fileService.exportToExcel(reportRequest).subscribe(
      (response: Blob) => {
        // Call downloadBlob to trigger the download with the response
        this.fileService.downloadBlob(response, 'report_Items_by_PO/Invoice/Moved_to_Inventory_for_a_Period.xlsx');
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
    if (this.filteringBy) queryParams.filteringBy = this.filteringBy;

    if (this.reportitemsdatabydate && this.reportitemsdatabydate.start_date) queryParams.from = this.reportitemsdatabydate.start_date;
    if (this.reportitemsdatabydate && this.reportitemsdatabydate.end_date) queryParams.to = this.reportitemsdatabydate.end_date;
    if (this.selectVendor) queryParams.selectVendor = this.selectVendor;
    if (this.selectItem) queryParams.selectItem = this.selectItem;

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


  filterDatabynames(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.page = 1;
      let tempData: any[] = [];
      let originalData = [...this.itemData];

      let filteredVendor: Set<string> = new Set();
      let filteredItems: Set<string> = new Set();


      // Get the selected item and vendor
      const selectedItem = this.selectItem;
      const selectedVendor = this.selectVendor;

      // Checking if the filters are selected (non-empty)
      const isItemEmpty = !selectedItem || selectedItem.trim() === '';
      const isVendorEmpty = !selectedVendor || selectedVendor.trim() === '';

      // If both filters are applied
      if (!isItemEmpty && !isVendorEmpty) {
        tempData = originalData.filter((item: any) => {
          // Filter by both Item and Vendor
          return item['item_name'].toLowerCase().trim() === selectedItem.toLowerCase().trim() &&
            item['supplier_name'].toLowerCase().trim() === selectedVendor.toLowerCase().trim();
        });
      } else if (!isItemEmpty) {
        // Resetting the filtered data
        this.vendors = [];
        // If only item filter is applied
        tempData = originalData.filter((item: any) => {
          return item['item_name'].toLowerCase().trim() === selectedItem.toLowerCase().trim();
        });

        tempData.filter((item: any) => {
          filteredVendor.add(item.supplier_name);  // Add unique suppliers to Set
        });

        this.vendors = Array.from(new Set(filteredVendor)).sort((a: any, b: any) => a.localeCompare(b));
      }
      else if (!isVendorEmpty) {
        this.items = [];

        // If only vendor filter is applied
        tempData = originalData.filter((item: any) => {
          return item['supplier_name'].toLowerCase().trim() === selectedVendor.toLowerCase().trim();
        });

        tempData.filter((item: any) => {
          filteredItems.add(item.item_name);  // Add unique items to Set
        });

        // Convert Set to sorted array
        this.items = Array.from(filteredItems).sort((a, b) => a.localeCompare(b));

      }
      else {
        // If no filters are applied, reset to original data
        tempData = originalData;
      }

      // Update the itemsDataList with the filtered data
      this.itemsDataList = [...tempData];
      this.getSumgroupbycurrency(this.itemsDataList);
      // this.getSumofAmount(this.itemsDataList);
      console.log(this.items, "filtered items");
      console.log(this.vendors, "filtered vendors");
      resolve();
    })

  }


  onClear() {

    if (this.reportitemsdatabydate.start_date || this.reportitemsdatabydate.end_date) {
      this.getitemsDataListwithPrice().then(() => {
        this.filterData();
      })
      return;
    }

    if (this.selectItem || this.selectVendor) {
      this.filterDatabynames();
      return;

    }

    this.getitemsDataListwithPrice();
  }


  getSumofAmount(filteredResults: any[]) {
    const sumofTotals = filteredResults.reduce((sum: number, item: any) => {
      const total = typeof item.total === 'number' ? parseFloat(item.total.toFixed(2)) : 0;
      return sum + total;
    }, 0);
    this.sumofamount = sumofTotals ? sumofTotals.toFixed(2) : 0;
    console.log(this.sumofamount, "this.sumofamount");
  }

  getSumgroupbycurrency(data: any) {
    // const result: any = Object.groupBy(filteredResults, (item: any) => item.currency);
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

}
