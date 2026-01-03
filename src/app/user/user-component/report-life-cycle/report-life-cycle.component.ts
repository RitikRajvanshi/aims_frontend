import { Component } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { firstValueFrom, of, Observable } from 'rxjs';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FilesService } from 'src/app/services/files.service';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-report-life-cycle',
  templateUrl: './report-life-cycle.component.html',
  styleUrls: ['./report-life-cycle.component.scss']
})
export class ReportLifeCycleComponent {
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

  datesforLifecycle = {
    start_date: '',
    end_date: ''
  };

  filteredItemsdata: any;
  isDataorNot?: boolean;
  itemsData: any;
  totalItems: any;
  itemsDataList: any;
  previousUrl: any;
  itemsperPage: any = 20;
  extendedTime = {
    item_id: 0,
    extended_duration: 0
  }
  userRole = localStorage.getItem('level');

  constructor(private sharedService: SharedService, private spinner: NgxSpinnerService,
    private location: Location, private router: Router, private activatedRoute: ActivatedRoute, private filesServices: FilesService, private adminService: AdminService) {
    // this.itemsperPage = 20;
  }

  ngOnInit(): void {

    this.statemanagement();
    this.getLifecycleData();
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
          this.datesforLifecycle.start_date = params['from'];
          this.datesforLifecycle.end_date = params['to'];
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

        console.warn('not navigated')
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


  async getLifecycleData() {
    this.spinner.show();
    try {
      const lifecycleReport: any = await firstValueFrom(this.sharedService.getLifecycleReport());
      console.log(lifecycleReport, "lifecycleReport");
      if (lifecycleReport?.length == 0) {
        this.spinner.hide();
        this.isDataorNot = false;
      }
      else {
        this.isDataorNot = true;
      }

      // this.filteredItemsdata = licenseReport;
      const filteredResults = lifecycleReport.filter((item: any) => {
        if (item.purchase_id.startsWith('BRND-') || [4, 5, 6, 7].includes(item.location_id) || item.category_id != 1 || (item.life_cycle == 0 || item.life_cycle == null)) {
          return false;
        }

        return true;
      })

        .map((item: any) => {
          const splitcreateddate = item.invoice_date

            ? moment.utc(item.invoice_date).startOf('day')  // Force UTC
            : (item.date_ ? moment.utc(item.date_).startOf('day') : null);

          const createdDateclone = item.invoice_date
            ? moment.utc(item.invoice_date).startOf('day').format('DD-MM-YYYY')  // Force UTC
            : (item.date_ ? moment.utc(item.date_).local().format('DD-MM-YYYY') : null);

          // const totalLifeCycle = Number(item.life_cycle) + Number(item.extended_life_cycle);

          // Add lifecycle with UTC
          // const addLifecycle = splitcreateddate ? splitcreateddate.clone().add(item.life_cycle, 'months').startOf('day') : null;

          // // Calculate the difference in days
          // let differenceInDays = addLifecycle ? addLifecycle.diff(moment.utc().startOf('day'), 'days') + 1 : null;

          // Add lifecycle with UTC (including extended_life_cycle if available)
          const totalLifecycleMonths = (item.life_cycle || 0) + (item.extended_life_cycle || 0);

          const addLifecycle = splitcreateddate
            ? splitcreateddate.clone().add(totalLifecycleMonths, 'months').startOf('day')
            : null;

          // Calculate the difference in days
          let differenceInDays = addLifecycle
            ? addLifecycle.diff(moment.utc().startOf('day'), 'days') + 1
            : null;

          // Assuming splitCreatedDate is a moment object and item.life_cycle is in months
          // let lifeCycleInDays = 0;
          // if (item.life_cycle && splitcreateddate) {
          //   // Calculate the end date by adding the life_cycle in months to the splitCreatedDate
          //   const endDate = splitcreateddate.clone().add(item.life_cycle, 'months').startOf('day');

          //   // Calculate the difference in days between the end date and the start date
          //   lifeCycleInDays = endDate.diff(splitcreateddate, 'days');
          // }

          // Define the flags based on the difference in days
          const isExpiringSoon = differenceInDays !== null && differenceInDays <= 30 && differenceInDays >= 0;
          const isExpired = differenceInDays !== null && differenceInDays < 0;

          return { ...item, date_: createdDateclone, timeDurationleft: differenceInDays, isExpiringSoon: isExpiringSoon, isExpired: isExpired, showExtendSection: false };
        })
        .sort((a: any, b: any) => { return a.timeDurationleft - b.timeDurationleft });

      console.log(filteredResults, "filteredResults")
      this.filteredItemsdata = filteredResults;
      this.itemsData = filteredResults;
      this.itemsDataList = filteredResults;
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

    this.filteredItemsdata.sort((a: any, b: any) => {
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

    this.page = 1;
    this.itemsperPage = Value;
    // this.getitemsDataListwithPrice();
  }


  toggleExtendDropdown(row: any) {
    // Close others, open only the clicked one
    this.filteredItemsdata.forEach((item: any) => {
      item.showExtendSection = false
      this.extendedTime.extended_duration = 0;
    });
    row.showExtendSection = true;
  }

  async confirmExtension(row: any) {
    console.log('Extended by:', row);
    try {
      this.extendedTime.item_id = row.item_id;

      // const preivousExtenion = row.extended_life_cycle? (Number(row.extended_life_cycle) + Number(this.extendedTime?.extended_duration)):row.extended_life_cycle;

      // this.extendedTime.extended_duration = Number(preivousExtenion);

      const extendedLife = Number(row.extended_life_cycle) || 0;
      const previousDuration = Number(this.extendedTime?.extended_duration) || 0;

       const extendedDuration = extendedLife + previousDuration;
      
      if(extendedDuration>24){
        Swal.fire({
          title: 'warning',
          text: 'Life cycle extension cannot be greater than 24 months.',
          icon: 'warning'
        });
        return;
      }

      const payload = {
        item_id:row.item_id,
        extended_duration:extendedDuration
      }

      const result: any = await firstValueFrom(this.adminService.extendLifecycle(payload));
      console.log(result, "extension result");
      if (result && result.success) {
        await Swal.fire({
          title: 'Success',
          text: 'Life cycle extended successfully.',
          icon: 'success'
        });
        // Refresh the data after successful extension
        this.ngOnInit();
        // perform your backend logic or update here

      } else {
        Swal.fire({
          title: 'Error',
          text: 'Failed to extend life cycle. Please try again.',
          icon: 'error'
        });
      }

    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Internal server error. Please try again later.',
        icon: 'error'
      });
    }
    finally {
      this.extendedTime.extended_duration = 0;
      // perform your backend logic or update here
      row.showExtendSection = false;
    }


  }

  cancelExtension(row: any) {
    row.showExtendSection = false;
  }

  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }

  async filterData(): Promise<void> {
    // If the originalData is not set, initialize it with the current itemsData
    if (!this.itemsData) {
      this.itemsData = this.itemsData;
    }

    // Start with the original data or the previously filtered data
    let filteredData: any[] = this.itemsData;

    console.log(filteredData, "filteredData");
    // // Filter by search term
    if (this.searchTerm) {
      filteredData = filteredData.filter((item: any) => {
        return Object.keys(item).some(key => {
          if (item[key] !== null && item[key] !== '' && key === 'date_') {
            return item[key]?.includes(this.searchTerm);
          } else if (item[key] !== null && item[key] !== '') {
            return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
          }
          return false;
        });
      });
    }

    if (this.datesforLifecycle?.start_date && this.datesforLifecycle?.end_date) {
      if (this.datesforLifecycle.start_date <= this.datesforLifecycle.end_date) {

        filteredData = filteredData.filter((item: any) => {
          const filtereddate = moment(item.date_, 'DD-MM-YYYY').format('YYYY-MM-DD');

          if (filtereddate) {
            return filtereddate >= this.datesforLifecycle.start_date && filtereddate <= this.datesforLifecycle.end_date;
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
    this.filteredItemsdata = filteredData;
    this.totalItems = this.itemsData.length;
    this.count = filteredData.length;
    this.page = 1; // Reset to the first page when filtering occurs
  }

  refreshfilter() {
    this.isRotating = true;
    this.getLifecycleData().then(() => {
      // Clear date filters
      if (this.datesforLifecycle?.start_date || this.datesforLifecycle?.end_date) {
        this.datesforLifecycle.start_date = '';
        this.datesforLifecycle.end_date = '';
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
            if (item[key] !== null && item[key] !== '' && key === 'date_') {
              return item[key]?.includes(this.searchTerm);
            } else if (item[key] !== null && item[key] !== '') {
              return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
            }
            return false;
          });
        });
      }
      // Update filtered data and totalItems
      this.itemsData = filteredData;
      this.totalItems = this.itemsData.length;
      this.page = 1; // Reset to the first page when filtering occurs
      setTimeout(() => {
        this.isRotating = false;
      }, 500); // Adjust the duration as needed
    });

  }

  // exportToExcel() {
  //   const randomDate = new Date().valueOf();
  //   const uri = 'data:application/vnd.ms-excel;base64,';
  //   const template = `
  //       <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  //       <head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
  //       <body>{table}</body>
  //       </html>
  //     `;
  //   const base64 = function (s: any) { return window.btoa(unescape(encodeURIComponent(s))) };
  //   const format = function (s: any, c: any) { return s.replace(/{(\w+)}/g, function (m: any, p: any) { return c[p]; }) };

  //   // Define your column names
  //   const columnNames = ['S.No.', 'Item Code', 'Item Name', 'Description', 'Purchase Id', 'Purchase Date', 'Life Cycle', 'Time Duration Left'];

  //   const tableHtml = `<table style="border-collapse: collapse; width: 80%; background-color: #f2f2f2;">
  //     <thead>
  //       <tr style="background-color: #00008B; color:#fff;">
  //         ${columnNames.map((name) => `<th style="border: 1px solid #dddddd; text-align: left; padding: 1px;">${name}</th>`).join('')}
  //       </tr>
  //     </thead>
  //     <tbody>
  //       ${this.filteredItemsdata.map((item: any, index: number) => {
  //     return `
  //           <tr style="border: 1px solid #dddddd; text-align: left; padding: 1px;">
  //             <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${index + 1}</strong></td>
  //             <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.item_code ? item.item_code : 'NA'}</strong></td>
  //             <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.item_name ? item.item_name : 'NA'}</strong></td>
  //             <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.description ? item.description : 'NA'}</strong></td>
  //             <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.purchase_id ? item.purchase_id : 'NA'}</strong></td>
  //             <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.date_ ? item.date_ : 'NA'}</strong></td>
  //             <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.life_cycle ? item.life_cycle : 'NA'} days</strong></td>
  //             <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.isExpired ? ('Expired ' + this.getAbsoluteValue(item.timeDurationleft) + ' days back') : (item.timeDurationleft + ' days')}</strong></td>
  //           </tr>`;
  //   }).join('')}
  //     </tbody>
  //   </table>`;

  //   const ctx = { worksheet: 'Worksheet', table: tableHtml };
  //   const link = document.createElement('a');
  //   // link.download = `items_with_price_${this.currentdate}_${randomDate}.xls`;
  //   link.download = `report_item_life_cycle.xls`;
  //   link.href = uri + base64(format(template, ctx));
  //   link.click();
  // }

  exportToexcelfromnode(): any {
    const modifiedItemsDataList = this.filteredItemsdata.map((item: any, index: any) => {
      return {
        ...item,  // Spread the original object properties
        isExpired: item.isExpired ? ('Expired ' + this.getAbsoluteValue(item.timeDurationleft) + ' days back') : (item.timeDurationleft + ' days'),
        "S.No.": index + 1  // Add the S.No. field with the appropriate value
      };
    });

    const reportRequest = {
      reportTitle: "Report Item Life-Cycle",
      columns: [
        { header: 'S.No.', key: 'S.No.', width: 10, filterButton: false },
        { header: 'Item Code', key: 'item_code', width: 45, filterButton: true },
        { header: 'Item Name', key: 'item_name', width: 25, filterButton: true },
        { header: 'Category', key: 'category_name', width: 35, filterButton: true },
        { header: 'Description', key: 'description', width: 55, filterButton: false },
        { header: 'Purchase Id', key: 'purchase_id', width: 25, filterButton: true },
        { header: 'Purchase Date', key: 'date_', width: 20, format: 'date', filterButton: true },
        { header: 'Life Cycle', key: 'life_cycle', width: 20, format: 'number', filterButton: true },
        { header: 'Time Duration Left', key: 'isExpired', width: 35, filterButton: true },
      ],

      data: modifiedItemsDataList, // Data to populate the report
      totalsrow: false,
      filters: [
        { filterBy: (this.datesforLifecycle.start_date && this.datesforLifecycle.end_date) ? 'Purchase Date' : '', startDate: this.datesforLifecycle.start_date || '', endDate: this.datesforLifecycle.end_date || '' }
      ]
    };

    this.filesServices.exportToExcel(reportRequest).subscribe(
      (response: Blob) => {
        // Call downloadBlob to trigger the download with the response
        this.filesServices.downloadBlob(response, 'report_item_life_cycle.xlsx');
      },
      (error) => {
        console.error('Error exporting to Excel', error);
      }
    );
  }

  getAbsoluteValue(value: number): number {
    return Math.abs(value);
  }

  navigateTopurchaseinfo(items: any) {
    const queryParams: any = {};

    // Add properties to queryParams only if their values are not empty or undefined
    if (this.searchTerm) queryParams.searchTerm = this.searchTerm;
    if (this.page) queryParams.page = this.page;
    if (this.tableSize) queryParams.tableSize = this.tableSize;
    if (this.datesforLifecycle && this.datesforLifecycle.start_date) queryParams.from = this.datesforLifecycle.start_date;
    if (this.datesforLifecycle && this.datesforLifecycle.end_date) queryParams.to = this.datesforLifecycle.end_date;
    if (this.sortingorder) queryParams.sort = this.sortingorder;
    if (this.itemsperPage) queryParams.itemsperPage = this.itemsperPage;


    this.previousUrl = this.location.path().split('?')[0];

    // Store the current URL with query params
    localStorage.setItem('backUrl', this.previousUrl + this.buildQueryString(queryParams));
    localStorage.setItem('navigated', 'true'); // Set the flag for navigation
    if (items.purchase_id && items.purchase_id !== 'NA') {
      this.router.navigate(['user/purchase-info', items.purchase_id], { queryParams });
    }
  }

  buildQueryString(params: any): string {
    return '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&');
  }

}
