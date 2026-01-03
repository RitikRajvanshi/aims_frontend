import { Component } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';
import { FilesService } from 'src/app/services/files.service';

@Component({
  selector: 'app-rejected-request',
  templateUrl: './rejected-request.component.html',
  styleUrls: ['./rejected-request.component.scss']
})
export class RejectedRequestComponent {
  isDataorNot: boolean = true;
  rejectedRequest: any;
  created_by: any;
  searchItem = '';
  userRole = localStorage.getItem('level');
  itemsDataList: any = [];

  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];

  itemsData: any[] = [];
  filteredRejectedItems: any[] = [];
  searchTerm: string = '';
  totalItems: number = 0;
  rejectedrequestbydate = {
    start_date: '',
    end_date: ''
  };
  currentdate: any;
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  isRotating: boolean = false;
  sortingorder:any;

  constructor(private sharedService: SharedService, private router: Router, private spinner: NgxSpinnerService, private fileService:FilesService) {
    const today = moment();
    this.currentdate = today.format('YYYY-MM-DD');
  }
  ngOnInit(): void {
    this.getRejectedrequest();
  }

  async getRejectedrequest() {
    this.spinner.show();
    try {
      const results: any = await this.sharedService.getrejectedRequest().pipe(
        retry(3), // Retry the request up to 3 times
        // catchError((error: HttpErrorResponse) => {
        //   console.error('Error fetching accepted requests:', error);
        //   return of([]); // Return an empty array if an error occurs
        // })
      ).toPromise();

      if (results?.length == 0) {
        this.spinner.hide();
        this.isDataorNot = false;
      }
      else {

        this.isDataorNot = true;
        const filteredResults = results.map((item: any) => {
            const splitcreateddate = item.created_date? moment(item.created_date).format('DD-MM-YYYY'):null;
            const splitmodifieddate = item.modified_date? moment(item.modified_date).format('DD-MM-YYYY'):null;
            return { ...item, created_date: splitcreateddate, modified_date: splitmodifieddate };
        });
          this.filteredRejectedItems = filteredResults;
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
    finally{
      this.spinner.hide();
    }
  }

  applyFilter(): void {
    if (this.searchTerm) {
      this.filteredRejectedItems = this.itemsData.filter((item: any) => {
        // Check if any property matches the search term
        return Object.keys(item).some(key => {
          if (key === 'created_date') {
            // For 'created_date', check if it includes the search term
            return item[key]?.includes(this.searchTerm);
          } else {
            // For other properties, check if they include the search term
            return item[key].toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
          }
        });
      });
    } else {
      this.filteredRejectedItems = this.itemsData;
    }
    // Update totalItems based on the filtered data
    // this is for working filter on every page
    this.totalItems = this.filteredRejectedItems.length;
    this.page = 1; // Reset to the first page when filtering occurs   
  }

  async filterData(): Promise<void> {
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
          if (item[key] !== null && item[key] !== '' && (key === 'created_date' || key === 'modified_date')) {
            return item[key]?.includes(this.searchTerm);
          } else if (item[key] !== null && item[key] !== '') {
            return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
          }
          return false;
        });
      });
    }


    // Filter by date range only if there is a valid date range
    if (this.rejectedrequestbydate?.start_date && this.rejectedrequestbydate?.end_date) {
      if (this.rejectedrequestbydate.start_date <= this.rejectedrequestbydate.end_date) {
        filteredData = filteredData.filter((item: any) => {
          const filteredcreateddate = moment(item?.created_date, 'DD-MM-YYYY').format('YYYY-MM-DD');
          if (filteredcreateddate) {
            return filteredcreateddate >= this.rejectedrequestbydate.start_date &&
            filteredcreateddate <= this.rejectedrequestbydate.end_date;
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
    this.filteredRejectedItems = filteredData;
    this.totalItems = this.filteredRejectedItems.length;
    this.count = filteredData.length;
    this.page = 1; // Reset to the first page when filtering occurs
  }

  refreshfilter() {
    this.isRotating = true;
    this.getRejectedrequest().then(() => {
      // Clear date filters
      if (this.rejectedrequestbydate?.start_date || this.rejectedrequestbydate?.end_date) {
        this.rejectedrequestbydate.start_date = '';
        this.rejectedrequestbydate.end_date = '';
      }

      setTimeout(() => {
            // Initialize itemsData if not already set (assuming you have some original data to refer to)
      if (!this.itemsData) {
        this.itemsData = []; // or fetch your initial data here
      }
  
      // Start with the original data or the previously filtered data
      let filteredData: any[] = [...this.itemsData];
  
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
            if (key === 'created_date' || key === 'modified_date') {
              // Assuming these fields are in string format. If not, you might need to format them accordingly
              return value.toString().includes(this.searchTerm);
            }
  
            // General case: Convert to string and check for inclusion of search term
            return value.toString().toLowerCase().includes(searchTermLower);
          });
        });
      }
  
      // Update filtered data and totalItems
      this.filteredRejectedItems = filteredData;
      this.totalItems = this.filteredRejectedItems.length;
      this.page = 1; // Reset to the first page when filtering occurs
      this.isRotating= false;
      }, 500);
  
  
    });
  }


  toggleExpand(item: any) {
    item.isExpanded = !item.isExpanded;

  }

  ontableDatachange(event: any) {
    this.page = event;
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

    this.filteredRejectedItems.sort((a: any, b: any) => {
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
    const columnNames = ['S.No.', 'Requested Item', 'Quantity', 'Remark', 'Created by', 'Creation Date', 'Rejected Date'];
    const tableHtml = `<table style="border-collapse: collapse; width: 80%; background-color: #f2f2f2;">
    <thead>
      <tr style="background-color: #00008B; color:#fff;">
        ${columnNames.map((name) => `<th style="border: 1px solid #dddddd; text-align: left; padding: 1px;">${name}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${this.filteredRejectedItems.map((item: any, index: number) => {
      return `
          <tr style="border: 1px solid #dddddd; text-align: left; padding: 1px;">
            <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${index + 1}</strong></td>
            <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.request_item}</strong></td>
            <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.quantity}</strong></td>
            <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.remark}</strong></td>
            <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.user_name}</strong></td>
            <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.created_date}</strong></td>
            <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.modified_date}</strong></td>
          </tr>`;
    }).join('')}
    </tbody>
  </table>`;

    const ctx = { worksheet: 'Worksheet', table: tableHtml };
    const link = document.createElement('a');
    // link.download = `rejected_request_${this.currentdate}_${randomDate}.xls`;
    link.download = `report_rejected_request.xls`;
    link.href = uri + base64(format(template, ctx));
    link.click();
  }

  exportToexcelfromnode(): any {
    const modifiedItemsDataList = this.filteredRejectedItems.map((item: any, index: any) => {
      return {
        ...item,  // Spread the original object properties
        "S.No.": index + 1  // Add the S.No. field with the appropriate value
      };
    });

    const reportRequest = {
      reportTitle: "Rejected Request",
      columns: [
        { header: 'S.No.', key: 'S.No.', width: 10, filterButton: false },
        { header: 'Requested Item', key: 'request_item',width: 35, filterButton: true },
        { header: 'Quantity', key: 'quantity',width: 20, filterButton: true },
        { header: 'Rejection Reason', key: 'remark',width: 50, filterButton: false },
        { header: 'Requested by', key: 'user_name', width:25, filterButton: true},
        { header: 'Requested Date', key: 'created_date', width: 35,format: 'date', filterButton: false},
        { header: 'Rejection Date', key: 'modified_date', width: 35,format: 'date', filterButton: false},
      ],

      data: modifiedItemsDataList , // Data to populate the report
      totalsrow:false,
      filters:[
        { filterBy:(this.rejectedrequestbydate.start_date && this.rejectedrequestbydate.end_date)?'Creation Date':'' , startDate:this.rejectedrequestbydate.start_date||'', endDate:this.rejectedrequestbydate.end_date||''}
      ]
      
    };

    this.fileService.exportToExcel(reportRequest).subscribe(
      (response: Blob) => {
        // Call downloadBlob to trigger the download with the response
        this.fileService.downloadBlob(response, 'report_rejected_request.xlsx');
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
    // this.getRejectedrequest();
  }

}
