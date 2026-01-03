import { Component } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";
import { map } from 'rxjs';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, filter, retry } from 'rxjs/operators';
import { of } from 'rxjs';
import { FilesService } from 'src/app/services/files.service';

@Component({
  selector: 'app-report-stock-in-hand',
  templateUrl: './report-stock-in-hand.component.html',
  styleUrls: ['./report-stock-in-hand.component.scss']
})
export class ReportStockInHandComponent {
  isDataorNot:boolean = true;
  stockinHandList: any = [];
  searchItem = '';
  empltyDataList=[];
  filteredDataList:any;
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];
 stockinhanddatabydate={
  start_date:'',
  end_date:''
 };
 currentdate:any;
 itemData:any[]= [];
 totalItems:any[]= [];
 currentSortColumn: string = ''; // Variable to store the current sort column
 isAscending: any; // Variable to store the current sorting order
 sortingorder:any;

constructor(private sharedService: SharedService, private router: Router, private spinner:NgxSpinnerService, private filesServices:FilesService) {
  const today = moment();
  this.currentdate = today.format('YYYY-MM-DD');
 }

  ngOnInit(): void {
    this.stockinhand();
  }

  async stockinhand() {
    this.spinner.show();
    try{
      const filteredResults:any = await this.sharedService.getreportStockinhand().pipe(
        retry(3), // Retry the request up to 3 times
        // catchError((error: HttpErrorResponse) => {
        //   console.error('Error fetching accepted requests:', error);
        //   return of([]); // Return an empty array if an error occurs
        // })
      ).toPromise();

      if (!filteredResults || filteredResults?.length === 0) {
        this.isDataorNot = false;
      } 
      else{
          this.stockinHandList = filteredResults.map((items:any)=>{
              if(items){
                const filteredQuantity = + items.quantity;
                return {...items, quantity:filteredQuantity}

              }
          })
          this.itemData = this.stockinHandList;
          this.count  = filteredResults.length;
          console.log(this.stockinHandList,"this.stockinHandList")
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

  filterData(){
    if (!this.itemData) {
      this.itemData = this.itemData;
    }
  
    // Start with the original data or the previously filtered data
    let filteredData: any[] = this.itemData;
  
    // // Filter by search term
    if (this.searchItem) {    
        filteredData = filteredData
        .filter((item: any) => {
          return Object.keys(item).some(key => {
             if (item[key] !== null && item[key] !== '') {
              return item[key]?.toString().toLowerCase()?.includes(this.searchItem.toLowerCase());
            }
            return false;
          });
        });
      }  
      this.stockinHandList = filteredData;
      this.totalItems = this.stockinHandList.length;
      this.count  = this.totalItems;
      this.page = 1; // Reset to the first page when filtering occurs
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
  //   const base64 = function(s: any) { return window.btoa(unescape(encodeURIComponent(s))) };
  //   const format = function(s: any, c: any) { return s.replace(/{(\w+)}/g, function(m: any, p: any) { return c[p]; }) };
  
  //   // Define your column names
  //   const columnNames = ['S.No.', 'Items', 'Quantity in hand', 'Present Location'];
  
  //   const tableHtml = `<table style="border-collapse: collapse; width: 80%; background-color: #f2f2f2;">
  //   <thead>
  //     <tr style="background-color: #00008B; color:#fff;">
  //       ${columnNames.map((name) => `<th style="border: 1px solid #dddddd; text-align: left; padding: 1px;">${name}</th>`).join('')}
  //     </tr>
  //   </thead>
  //   <tbody>
  //     ${this.stockinHandList.map((item: any, index: number) => {
  //       return `
  //         <tr style="border: 1px solid #dddddd; text-align: left; padding: 1px;">
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${index + 1}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.item_name?item.item_name:'NA'}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.quantity}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.location_name?item.location_name:'NA'}</strong></td>
  //         </tr>`;
  //     }).join('')}
  //   </tbody>
  // </table>`;
  
  //   const ctx = { worksheet: 'Worksheet', table: tableHtml };
  //   const link = document.createElement('a');
  //   // link.download = `stock_inhand_data_${this.currentdate}_${randomDate}.xls`;
  //   link.download = `report_stock_inhand_data.xls`;
  //   link.href = uri + base64(format(template, ctx));
  //   link.click();
  // }

  exportToexcelfromnode(): any {
    const modifiedItemsDataList = this.stockinHandList.map((item: any, index: any) => {
      return {
        ...item,  // Spread the original object properties
        qantity:+item.quantity,
        "S.No.": index + 1  // Add the S.No. field with the appropriate value
      };
    });
  
    // const columnNames = ['S.No.', 'Items', 'Quantity in hand', 'Present Location'];
    console.log(modifiedItemsDataList, "modifiedItemsDataList");

    const reportRequest = {
      reportTitle: "Report Stock in Hand",
      columns: [
        { header: 'S.No.', key: 'S.No.', width: 10, filterButton: false },
        { header: 'Items', key: 'item_name',width: 55, filterButton: true },
        { header: 'Quantity in hand', key: 'quantity', width: 55, filterButton: true },
        { header: 'Present Location', key: 'location_name', width: 55, filterButton: true },
      ],
  
      data: modifiedItemsDataList , // Data to populate the report
      totalsrow:false,
      filters:[
      ]
    };
  
    this.filesServices.exportToExcel(reportRequest).subscribe(
      (response: Blob) => {
        // Call downloadBlob to trigger the download with the response
        this.filesServices.downloadBlob(response, 'report_stock_in_hand.xlsx');
      },
      (error) => {
        console.error('Error exporting to Excel', error);
      }
    );
  }

  ontableDatachange(event: any) {
    this.page = event;
    // this.stockinhand();
    // this.filterData();
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

    this.stockinHandList.sort((a: any, b: any) => {
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
