import { Component } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { filter, map, pipe } from 'rxjs';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';
import { FilesService } from 'src/app/services/files.service';

@Component({
  selector: 'app-report-warranty-items',
  templateUrl: './report-warranty-items.component.html',
  styleUrls: ['./report-warranty-items.component.scss']
})
export class ReportWarrantyItemsComponent {

  isDataorNot: boolean = true;
  searchTerm: string = '';
  itemsDataList: any = [];
  itemData: any[] = [];
  empltyDataList = [];
  totalItems: number = 0;
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];
  reportitemsdatabydate = {
    start_date: '',
    end_date: ''
  }
  currentdate: any;
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  isRotating: boolean = false;
  sortingorder:any;

  constructor(private sharedService: SharedService, private router: Router, private spinner: NgxSpinnerService, private filesServices:FilesService) {
    const today = moment();
    this.currentdate = today.format('YYYY-MM-DD');
  }


  ngOnInit(): void {
    this.getItemsdatawithwarranty();
  }


  async getItemsdatawithwarranty() {
    this.spinner.show();
    try {
      const results: any = await this.sharedService.getitemswithwarranty().pipe(
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
        const filteredResults = results.map((item: any) => {
            const splitecreateddate = item.created_date?moment(item.created_date).format('DD-MM-YYYY'):null;
            const spliteinvoicedate = item.invoice_date?moment(item.invoice_date).format('DD-MM-YYYY'):null;
            const splitewarrantydate = item.warrantyend_date?moment(item.warrantyend_date).format('DD-MM-YYYY'):null;
            return { ...item, created_date: splitecreateddate, invoice_date:spliteinvoicedate,  warrantyend_date: splitewarrantydate };
        });
        this.itemsDataList = filteredResults;
        this.itemData = filteredResults;
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
    finally{
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
          if (item[key] !== null && item[key] !== '' && (key === 'invoice_date' || key === 'warrantyend_date')) {
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
        filteredData = filteredData.filter((item: any) => {
        const filteredinvoicedate = moment(item?.invoice_date, 'DD-MM-YYYY').format('YYYY-MM-DD');
          if (filteredinvoicedate) {
            return filteredinvoicedate >= this.reportitemsdatabydate.start_date &&
            filteredinvoicedate <= this.reportitemsdatabydate.end_date;
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
    this.totalItems = this.itemsDataList.length;
    this.count =  this.totalItems;

    this.page = 1; // Reset to the first page when filtering occurs
  }

  refreshfilter() {
    this.isRotating = true;
    this.getItemsdatawithwarranty().then(() => {
      // Clear date filters
      if (this.reportitemsdatabydate?.start_date || this.reportitemsdatabydate?.end_date) {
        this.reportitemsdatabydate.start_date = '';
        this.reportitemsdatabydate.end_date = '';
      }

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
            if (item[key] !== null && item[key] !== '' && (key === 'invoice_date' || key === 'warrantyend_date')) {
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
      setTimeout(() => {
        this.isRotating = false;
      }, 500);
    });
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

  isDate(dateString:any): boolean {
    const isValidDate = moment(dateString, 'DD-MM-YYYY', true).isValid();
    return isValidDate;
  }

  isNumber(value: any): boolean {
    return !isNaN(value);
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
  //   const columnNames = ['S.No.', 'Item Code','Category Name','Item Name', 'Date', 'Warranty End Date'];

  //   const tableHtml = `<table style="border-collapse: collapse; width: 80%; background-color: #f2f2f2;">
  //   <thead>
  //     <tr style="background-color: #00008B; color:#fff;">
  //       ${columnNames.map((name) => `<th style="border: 1px solid #dddddd; text-align: left; padding: 1px;">${name}</th>`).join('')}
  //     </tr>
  //   </thead>
  //   <tbody>
  //     ${this.itemsDataList.map((item: any, index: number) => {
  //     return `
  //         <tr style="border: 1px solid #dddddd; text-align: left; padding: 1px;">
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${index + 1}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.item_code ? item.item_code : 'NA'}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.category_name ? item.category_name : 'NA'}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.item_name ? item.item_name : 'NA'}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.created_date ? item.created_date : 'NA'}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.warrantyend_date ? item.warrantyend_date : 'NA'}</strong></td>
  //         </tr>`;
  //   }).join('')}
  //   </tbody>
  // </table>`;

  //   const ctx = { worksheet: 'Worksheet', table: tableHtml };
  //   const link = document.createElement('a');
  //   link.download = `report_items_with_warranty.xls`;
  //   link.href = uri + base64(format(template, ctx));
  //   link.click();
  // }

  exportToexcelfromnode(): any {
    const modifiedItemsDataList = this.itemsDataList.map((item: any, index: any) => {
 
      return {
        ...item,  // Spread the original object properties
        "S.No.": index + 1  // Add the S.No. field with the appropriate value
      };
    });

  
    const reportRequest = {
      reportTitle: "Report Items with Warranty",
      columns: [
        { header: 'S.No.', key: 'S.No.', width: 10, filterButton: false },
        { header: 'Item Code', key: 'item_code',width: 50, filterButton: true },
        { header: 'Category', key: 'category_name', width: 35, filterButton: true },
        { header: 'Item Name', key: 'item_name', width: 45, filterButton: true },
        { header: 'Description', key: 'description', width: 55, filterButton: false },
        { header: 'Invoice Date', key: 'invoice_date', width: 30, format: 'date', filterButton: false },
        { header: 'Warranty End Date', key: 'warrantyend_date', width: 30, format: 'date', filterButton: false },
      ],
  
      data: modifiedItemsDataList , // Data to populate the report
      totalsrow:true,
      filters:[
        { filterBy:(this.reportitemsdatabydate.start_date && this.reportitemsdatabydate.end_date)?'Invoice Date':'' , startDate:this.reportitemsdatabydate.start_date||'', endDate:this.reportitemsdatabydate.end_date||''}
      ]
    };
  
    this.filesServices.exportToExcel(reportRequest).subscribe(
      (response: Blob) => {
        // Call downloadBlob to trigger the download with the response
        this.filesServices.downloadBlob(response, 'report_items_with_warranty.xlsx');
      },
      (error) => {
        console.error('Error exporting to Excel', error);
      }
    );
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

}


