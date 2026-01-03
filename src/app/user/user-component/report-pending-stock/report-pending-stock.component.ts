import { Component } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';
import { FilesService } from 'src/app/services/files.service';

@Component({
  selector: 'app-report-pending-stock',
  templateUrl: './report-pending-stock.component.html',
  styleUrls: ['./report-pending-stock.component.scss']
})
export class ReportPendingStockComponent {
  isDataorNot:boolean = true;
  pendingStockList: any = [];
  filteredpendingStockList: any = [];
  searchTerm = '';
  itemData: any = [];

  empltyDataList=[];
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];
 pendingStockdatabydate={
  start_date:'',
  end_date:''
 };
 currentdate:any;
 totalItems: number=0;
 currentSortColumn: string = ''; // Variable to store the current sort column
 isAscending: any; // Variable to store the current sorting order
 isRotating: boolean = false;
 sortingorder:any;

  constructor(private sharedService: SharedService, private router: Router, private spinner:NgxSpinnerService, private filesServices:FilesService) {
    const today = moment();
    this.currentdate = today.format('YYYY-MM-DD');
   }

  ngOnInit(): void {
    this.getPendingSotck();
  }

  async getPendingSotck() {
    this.spinner.show();
    try{
      const results:any = await this.sharedService.getreportpendingStock().pipe(
        retry(3), // Retry the request up to 3 times
        // catchError((error: HttpErrorResponse) => {
        //   console.error('Error fetching accepted requests:', error);
        //   return of([]); // Return an empty array if an error occurs
        // })
      ).toPromise();

      if(results?.length==0){
        this.isDataorNot = false;
      }
      else{
        this.isDataorNot = true;
        const filteredResults = results.map((item: any) => {
            const splitcreateddate = item.created_date? moment(item.created_date).format('DD-MM-YYYY'):null;
            const splitmodifieddate = item.modified_date?moment(item.modified_date).format('DD-MM-YYYY'):null;
            const pendingSotck = (item.quantity || item.received_quantity) ? Math.abs(Number(item.quantity) - Number(item.received_quantity)):0;
            return { ...item, modified_date: splitmodifieddate, created_date: splitcreateddate, pending_stock:pendingSotck};
        });
          this.filteredpendingStockList = filteredResults;
          console.log(filteredResults, "filteredResults");
          this.itemData = filteredResults;
          this.count = filteredResults.length;
      }
    }
    catch(error:unknown){
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
            if (item[key] !== null && item[key] !== '' &&  key === 'modified_date') {
              return item[key]?.includes(this.searchTerm);
            } else if (item[key] !== null && item[key] !== '') {
              return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
            }
            return false;
          });
        });
      }   
 
    // Filter by date range only if there is a valid date range
    if (this.pendingStockdatabydate?.start_date && this.pendingStockdatabydate?.end_date) {
      if (this.pendingStockdatabydate.start_date <= this.pendingStockdatabydate.end_date) {
        filteredData = filteredData.filter((item: any) => {
          const filteredmodifieddate = moment(item?.modified_date, 'DD-MM-YYYY').format('YYYY-MM-DD');
          if (filteredmodifieddate) {
            return filteredmodifieddate >= this.pendingStockdatabydate.start_date &&
            filteredmodifieddate <= this.pendingStockdatabydate.end_date;
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
    this.filteredpendingStockList = filteredData;
    this.totalItems = this.filteredpendingStockList.length;
    this.count = filteredData.length;
    this.page = 1; // Reset to the first page when filtering occurs
  }

  refreshfilter() {
    this.isRotating = true;
    this.getPendingSotck().then(() => {
      // Clear date filters
      if (this.pendingStockdatabydate?.start_date || this.pendingStockdatabydate?.end_date) {
        this.pendingStockdatabydate.start_date = '';
        this.pendingStockdatabydate.end_date = '';
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
            if (item[key] !== null && item[key] !== '' &&  key === 'modified_date') {
              return item[key]?.includes(this.searchTerm);
            } else if (item[key] !== null && item[key] !== '') {
              return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
            }
            return false;
          });
        });
      }   
      // Update filtered data and totalItems
      this.filteredpendingStockList = filteredData;
      this.totalItems = this.filteredpendingStockList.length;
      this.page = 1; // Reset to the first page when filtering occurs
      setTimeout(() => {
      this.isRotating = false;
        
      }, 500);
    });
  }

  ontableDatachange(event: any) {
    this.page = event;
    this.getPendingSotck();

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
    
    this.getPendingSotck();

  }

  NoSpaceallowedatstart(event:any){
    if(event.target.selectionStart === 0 && event.code ==="Space")
    {
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

    this.filteredpendingStockList.sort((a: any, b: any) => {
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

exportToexcelfromnode(): any {
  const modifiedItemsDataList = this.itemData.map((item: any, index: any) => {
    const ReceivedQuantity = +item.received_quantity;
    const PendingStockCalculation =  item.quantity - item.received_quantity;
    return {
      ...item,  // Spread the original object properties
      "received_quantity":ReceivedQuantity,
      "pending_stock":PendingStockCalculation,
      "S.No.": index + 1  // Add the S.No. field with the appropriate value
    };
  });

  const reportRequest = {
    reportTitle: "Report Pending Stock",
    columns: [
      { header: 'S.No.', key: 'S.No.', width: 10, filterButton: false },
      { header: 'Purchase Id', key: 'purchase_id',width: 30, filterButton: true },
      { header: 'Vendor Name', key: 'supplier_name', width: 35, filterButton: true },
      { header: 'PO Sent Date', key: 'modified_date', format: 'date',  width: 35, filterButton: false },
      { header: 'Item Name', key: 'product_name', width: 35, filterButton: true },
      { header: 'Quantity Ordered', key: 'quantity', width: 25, filterButton: false},
      { header: 'Quantity Received', key: 'received_quantity', width: 30, filterButton: false },
      { header: 'Pending Stock', key: 'pending_stock', width: 35, filterButton: true},
    ],

    data: modifiedItemsDataList , // Data to populate the report
    totalsrow:false,
    filters:[
      { filterBy:(this.pendingStockdatabydate.start_date && this.pendingStockdatabydate.end_date)?'PO Sent Date':'' , startDate:this.pendingStockdatabydate.start_date||'', endDate:this.pendingStockdatabydate.end_date||''}
    ]
  };

  this.filesServices.exportToExcel(reportRequest).subscribe(
    (response: Blob) => {
      // Call downloadBlob to trigger the download with the response
      this.filesServices.downloadBlob(response, 'report_pending_stock_data.xlsx');
    },
    (error) => {
      console.error('Error exporting to Excel', error);
    }
  );
}

}
