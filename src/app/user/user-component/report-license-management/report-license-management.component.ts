import { Component, ViewChild, ElementRef } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { firstValueFrom, of, Observable } from 'rxjs';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FilesService } from 'src/app/services/files.service';


@Component({
  selector: 'app-report-license-management',
  templateUrl: './report-license-management.component.html',
  styleUrls: ['./report-license-management.component.scss']
})
export class ReportLicenseManagementComponent {

  empltyDataList: any[] = [];
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  isRotating: boolean = false;
  private isNavigatedBack: boolean = false; // Flag to check navigation source
  sortingorder: any;
  currentdate: any;
  searchItem = '';
  searchTerm: any;
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];
  lastfinnancialyrDate: any;
  nextfinnancialyrDate: any;
  previousUrl: any;

  datesforlicense = {
    start_date: '',
    end_date: ''
  };

  filteredLicensedata: any;
  isDataorNot?: boolean;
  itemsData: any;
  totalItems: any;
  itemsDataList: any;
  itemsperPage: any = 20;
  itemNames: any[] = [];
  selectItem: any = null;

  constructor(private sharedService: SharedService, private spinner: NgxSpinnerService,
    private location: Location, private router: Router, private activatedRoute: ActivatedRoute, private filesServices: FilesService) { }

  ngOnInit(): void {
    this.statemanagement();
    this.getLincencedata();
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
          this.datesforlicense.start_date = params['from'];
          this.datesforlicense.end_date = params['to'];
        }

        if (params['itemsperPage']) {
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


  async getLincencedata() {
    this.spinner.show();
    try {
      const licenseReport: any = await firstValueFrom(this.sharedService.getLicenseReport());
      console.log(licenseReport, "results");
      if (licenseReport?.length == 0) {
        this.spinner.hide();
        this.isDataorNot = false;
      }
      else {
        this.isDataorNot = true;
      }

      // this.filteredLicensedata = licenseReport;
      const filteredResults = licenseReport.filter((item: any) => {

        // Ensure warrantyend_date is of the future/not expired yet
        // return item.warrantyend_date ? moment(item.warrantyend_date).isSameOrAfter(moment(), 'day') : true;
        // Check if warrantyend_date is today or in the future
        const isWarrantyValid = item.warrantyend_date ? moment(item.warrantyend_date).isSameOrAfter(moment(), 'day') : true;

        // Check purchase_id and location_id conditions
        const isPurchaseValid = !item.purchase_id.startsWith('BRND-');

        // Both conditions need to be true
        // Only lisences(computer softwares) should filter out
        return (item.category_id == 2) && isWarrantyValid && isPurchaseValid;
      })

        .map((item: any) => {
          const splitcreateddate = item.date_ ? moment(item.date_).format('DD-MM-YYYY') : null;
          const splitwarrantyenddate = item.warrantyend_date ? moment(item.warrantyend_date).format('DD-MM-YYYY') : null;
          // Calculate difference in years, months, and days
          let difference = '';
          let isExpiringSoon = false;
          let daysLeft = null; // Store days left for sorting purposes
          if (item.date_ && item.warrantyend_date) {
            let startDate = moment(item.date_);
            const endDate = moment(item.warrantyend_date);
            // Calculate full years difference
            const years = endDate.diff(startDate, 'years');
            startDate = startDate.add(years, 'years');

            // Calculate full months difference after adjusting for years
            const months = endDate.diff(startDate, 'months');
            startDate = startDate.add(months, 'months');

            // Calculate days difference after adjusting for years and months
            const days = endDate.diff(startDate, 'days');
            difference = `${years ? years + ' Years ' : ''}${months ? months + ' Months ' : ''}${days ? days + ' Days' : ''}`.trim();

            // Set isExpiringSoon to true if the difference is less than or equal to 1 month
            // if (years === 0 && months <= 1) {
            //   isExpiringSoon = true;
            // }
            // Include daysLeft for sorting
            daysLeft = endDate.diff(moment(), 'days') + 1;

            if (daysLeft <= 30) {
              isExpiringSoon = true;
            }
          }
          return {
            ...item, rawWarrantyDate: item.warrantyend_date,   // ✅ keep original
            rawPurchaseDate: item.date_,              // ✅ keep original
            date_: splitcreateddate, warrantyend_date: splitwarrantyenddate, durationDifference: difference, isExpiringSoon: isExpiringSoon, daysLeft: daysLeft
          };
        })
        .sort((a: any, b: any) => { return a.daysLeft - b.daysLeft });

      console.log(filteredResults, "filteredResults")
      this.filteredLicensedata = filteredResults;
      this.itemsData = filteredResults;
      this.itemsDataList = filteredResults;

      this.itemNames = Array.from(
        new Set(filteredResults.map((item: any) => item.item_name))
      ).sort((a: any, b: any) => a.localeCompare(b));

      this.count = filteredResults.length;
    }
    catch (err) {
      console.error(err, "error");
    }
    finally {
      this.spinner.hide();
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

    this.filteredLicensedata.sort((a: any, b: any) => {
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

    this.itemsperPage = Value;
    this.page = 1;
    // this.getitemsDataListwithPrice();
  }

  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }

  // async filterData(): Promise<void> {
  //   // If the originalData is not set, initialize it with the current itemsData
  //   if (!this.itemsData) {
  //     this.itemsData = this.itemsData;
  //   }

  //   let filteredData: any[] = [...this.itemsData];

  //   // Start with the original data or the previously filtered data
  //   // let filteredData: any[] = this.itemsData;

  //   console.log(filteredData, "filteredData");

  //   // Filter by selected item name
  //   if (this.selectItem) {
  //     filteredData = filteredData.filter(
  //       (item: any) =>
  //         item.item_name?.toLowerCase().trim() ===
  //         this.selectItem.toLowerCase().trim()
  //     );
  //   }
  //   // // Filter by search term
  //   if (this.searchTerm) {
  //     filteredData = filteredData.filter((item: any) => {
  //       return Object.keys(item).some(key => {
  //         if (item[key] !== null && item[key] !== '' && (key === 'date_' || key === 'warrantyend_date')) {
  //           return item[key]?.includes(this.searchTerm);
  //         } else if (item[key] !== null && item[key] !== '') {
  //           return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
  //         }
  //         return false;
  //       });
  //     });
  //   }

  //   if (this.datesforlicense?.start_date && this.datesforlicense?.end_date) {
  //     if (this.datesforlicense.start_date <= this.datesforlicense.end_date) {

  //       filteredData = filteredData.filter((item: any) => {
  //         const filtereddate = moment(item.warrantyend_date, 'DD-MM-YYYY').format('YYYY-MM-DD');

  //         if (filtereddate) {
  //           return filtereddate >= this.datesforlicense.start_date && filtereddate <= this.datesforlicense.end_date;
  //         }
  //         return false;
  //       });

  //     } else {
  //       Swal.fire({
  //         title: 'Warning',
  //         text: 'End date should be later than start date.',
  //         icon: 'warning'
  //       });
  //       // If there's a date range error, return an empty array to show no results
  //       filteredData = [];
  //     }
  //   }

  //   // Update filtered data and totalItems
  //   this.filteredLicensedata = filteredData;
  //   this.totalItems = this.itemsData.length;
  //   this.count = filteredData.length;
  //   this.page = 1; // Reset to the first page when filtering occurs
  // }


  async filterData(): Promise<void> {

    let filteredData: any[] = [...this.itemsData];

    /* 1️⃣ Item Filter */
    if (this.selectItem?.trim()) {
      const selected = this.selectItem.toLowerCase().trim();

      filteredData = filteredData.filter(item =>
        item.item_name?.toLowerCase().trim() === selected
      );
    }

    /* 2️⃣ Search Filter */
    if (this.searchTerm?.trim()) {
      const search = this.searchTerm.toLowerCase().trim();

      filteredData = filteredData.filter(item =>
        Object.keys(item).some(key => {

          const value = item[key];
          if (value === null || value === undefined || value === '') return false;

          if (key === 'date_' || key === 'warrantyend_date') {
            return value.includes(this.searchTerm);
          }

          return value.toString().toLowerCase().includes(search);
        })
      );
    }

    /* 3️⃣ Date Filter (RAW DATE) */
    if (this.datesforlicense.start_date && this.datesforlicense.end_date) {

      if (this.datesforlicense.start_date <= this.datesforlicense.end_date) {

        const start = moment(this.datesforlicense.start_date, 'YYYY-MM-DD');
        const end = moment(this.datesforlicense.end_date, 'YYYY-MM-DD');

        filteredData = filteredData.filter(item => {

          if (!item.rawWarrantyDate) return false;

          const itemDate = moment(item.rawWarrantyDate);

          return itemDate.isValid() &&
            itemDate.isSameOrAfter(start, 'day') &&
            itemDate.isSameOrBefore(end, 'day');
        });

      } else {
        Swal.fire({
          title: 'Warning',
          text: 'End date should be later than start date.',
          icon: 'warning'
        });
        filteredData = [];
      }
    }

    /* 4️⃣ Update UI */
    this.filteredLicensedata = filteredData;
    this.count = filteredData.length;
    this.totalItems = filteredData.length;
    this.page = 1;
  }


  refreshfilter() {
    this.isRotating = true;

    this.getLincencedata().then(() => {
      // Clear date filters
      // Clear only date + item filters
      this.datesforlicense.start_date = '';
      this.datesforlicense.end_date = '';
      this.selectItem = null;
      // Now reapply filtering so search still works
      this.filterData();

      // // Filter by search term

      setTimeout(() => {
        this.isRotating = false;
      }, 500); // Adjust the duration as needed
    });

  }


  onItemClear() {
    this.selectItem = null;
    this.filterData();
  }




  // exportToExcel() {
  //   const randomDate = new Date().valueOf();
  //   const uri = 'data:application/vnd.ms-excel;base64,';
  //   const template = `
  //     <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  //     <head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
  //     <body>{table}</body>
  //     </html>
  //   `;
  //   const base64 = function (s: any) { return window.btoa(unescape(encodeURIComponent(s))) };
  //   const format = function (s: any, c: any) { return s.replace(/{(\w+)}/g, function (m: any, p: any) { return c[p]; }) };

  //   // Define your column names
  //   const columnNames = ['S.No.', 'Item Code', 'Item Name','Category', 'Description', 'Purchase Id', 'Purchase Date', 'Warranty End Date', 'Time Duration Left'];

  //   const tableHtml = `<table style="border-collapse: collapse; width: 80%; background-color: #f2f2f2;">
  //   <thead>
  //     <tr style="background-color: #00008B; color:#fff;">
  //       ${columnNames.map((name) => `<th style="border: 1px solid #dddddd; text-align: left; padding: 1px;">${name}</th>`).join('')}
  //     </tr>
  //   </thead>
  //   <tbody>
  //     ${this.filteredLicensedata.map((item: any, index: number) => {
  //     return `
  //         <tr style="border: 1px solid #dddddd; text-align: left; padding: 1px;">
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${index + 1}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.item_code ? item.item_code : 'NA'}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.item_name ? item.item_name : 'NA'}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.category_name ? item.category_name : 'NA'}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.description ? item.description : 'NA'}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.purchase_id ? item.purchase_id : 'NA'}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.date_ ? item.date_ : 'NA'}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.warrantyend_date ? item.warrantyend_date : 'NA'}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.daysLeft ? item.daysLeft : 'NA'} days</strong></td>
  //         </tr>`;
  //   }).join('')}
  //   </tbody>
  // </table>`;

  //   const ctx = { worksheet: 'Worksheet', table: tableHtml };
  //   const link = document.createElement('a');
  //   // link.download = `items_with_price_${this.currentdate}_${randomDate}.xls`;
  //   link.download = `report_license_management.xls`;
  //   link.href = uri + base64(format(template, ctx));
  //   link.click();
  // }

  exportToexcelfromnode(): any {
    const modifiedItemsDataList = this.itemsDataList.map((item: any, index: any) => {
      return {
        ...item,  // Spread the original object properties
        "daysLeft": `${item.daysLeft} days`,
        "S.No.": index + 1  // Add the S.No. field with the appropriate value
      };
    });


    const reportRequest = {
      reportTitle: "License Management Report",
      columns: [
        { header: 'S.No.', key: 'S.No.', width: 10, filterButton: false },
        { header: 'Item Code', key: 'item_code', width: 45, filterButton: true },
        { header: 'Item Name', key: 'item_name', width: 35, filterButton: true },
        { header: 'Category', key: 'category_name', width: 35, filterButton: true },
        { header: 'Description', key: 'description', width: 55, filterButton: false },
        { header: 'Purchase Id', key: 'purchase_id', width: 25, filterButton: false },
        { header: 'Purchase Date', key: 'date_', width: 30, format: 'date', filterButton: true },
        { header: 'Warranty End Date', key: 'warrantyend_date', width: 30, format: 'date', filterButton: true },
        { header: 'Time Duration Left(in days)', key: 'daysLeft', width: 40, filterButton: true },
      ],

      data: modifiedItemsDataList, // Data to populate the report
      totalsrow: false,
      filters: [
        { filterBy: (this.datesforlicense.start_date && this.datesforlicense.end_date) ? 'Purchase Date' : '', startDate: this.datesforlicense.start_date || '', endDate: this.datesforlicense.end_date || '' }
      ]
    };

    this.filesServices.exportToExcel(reportRequest).subscribe(
      (response: Blob) => {
        // Call downloadBlob to trigger the download with the response
        this.filesServices.downloadBlob(response, 'license_management_report.xlsx');
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
    if (this.datesforlicense && this.datesforlicense.start_date) queryParams.from = this.datesforlicense.start_date;
    if (this.datesforlicense && this.datesforlicense.end_date) queryParams.to = this.datesforlicense.end_date;
    if (this.sortingorder) queryParams.sort = this.sortingorder;
    if (this.itemsperPage) queryParams.itemsperPage = this.itemsperPage;

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
