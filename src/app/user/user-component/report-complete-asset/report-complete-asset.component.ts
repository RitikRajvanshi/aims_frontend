import { Component } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
// import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';
import { FilesService } from 'src/app/services/files.service';

@Component({
  selector: 'app-report-complete-asset',
  templateUrl: './report-complete-asset.component.html',
  styleUrls: ['./report-complete-asset.component.scss']
})
export class ReportCompleteAssetComponent {
  isDataorNot: boolean = true;
  fullAssetList: any = [];
  searchItem = '';

  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];


  assetListObject: any;
  // totalAssetsPurchasewithgst: number = 0;
  totalAssetsPurchasewithgstininr: number = 0;
  totalAssetsPurchasewithgstinusd: number = 0;
  // totalAssetsPurchasewithoutgst: number = 0;
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order

  constructor(private sharedService: SharedService, private router: Router, private spinner: NgxSpinnerService, private fileService:FilesService) { }

  ngOnInit(): void {
    this.getfullassets();
  }


  async getfullassets() {
    try {
      this.spinner.show();
      const results: any = await this.sharedService.getCountofassetItemswithcurrrency()
      .pipe(
        retry(3), // Retry the request up to 3 times
        // catchError((error: HttpErrorResponse) => {
        //   console.error('Error fetching accepted requests:', error);
        //   return of([]); // Return an empty array if an error occurs
        // })
      ).toPromise();

      if (results?.length == 0) {
        this.isDataorNot = false;
        this.spinner.hide();
        return;
      }
      else {
        this.isDataorNot = true;
        this.assetListObject = results
        this.count = results.length;
      }
      console.log(results, "results");

      this.totalAssetsPurchasewithgstininr = 0;
      // this.totalAssetsPurchasewithoutgst = 0;
      this.totalAssetsPurchasewithgstinusd = 0;


      this.assetListObject.map((e: any) => {
        setTimeout(() => {
          this.spinner.hide();
          console.log(results, "results");
          // this.totalAssetsPurchasewithgst = this.totalAssetsPurchasewithgst + e.sum_withgst;
          this.totalAssetsPurchasewithgstininr += e.total_withgst_in_inr;
          this.totalAssetsPurchasewithgstinusd += e.total_withgst_in_usd;
          // this.totalAssetsPurchasewithoutgst += e.sum_withoutgst;


        }, 1000)
      })
    }
    catch (error: unknown) {
      this.spinner.hide();
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
  }

  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
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
    // this.getfullassets();

  }


  sort(columnName: string) {
    if (this.currentSortColumn === columnName) {
      this.isAscending = !this.isAscending; // Toggle sorting order
    } else {
      this.currentSortColumn = columnName; // Update current sort column
      this.isAscending = true; // Set sorting order to ascending for the new column
    }

    this.assetListObject.sort((a: any, b: any) => {
      let comparison = 0;
      const valueA = a[columnName];
      const valueB = b[columnName];

      // Handle null or undefined values
      if (valueA === null || valueA === undefined) {
        comparison = valueB === null || valueB === undefined ? 0 : -1;
      } else if (valueB === null || valueB === undefined) {
        comparison = 1;
      } else {
        if (this.isDate(valueA) && this.isDate(valueB)) {
          const dateA = moment(valueA);
          const dateB = moment(valueB);
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

  isDate(value: any): boolean {
    return moment(value, moment.ISO_8601, true).isValid();
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
  //   const columnNames = ['S.No.', 'Items', 'Quantity', 'Total Price(without GST)', 'Total Price(with GST)'];
  //   const tableHtml = `<table style="border-collapse: collapse; width: 80%; background-color: #f2f2f2;">
  //   <thead>
  //     <tr style="background-color: #00008B; color:#fff;">
  //       ${columnNames.map((name) => `<th style="border: 1px solid #dddddd; text-align: left; padding: 1px;">${name}</th>`).join('')}
  //     </tr>
  //   </thead>
  //   <tbody>
  //     ${this.assetListObject.map((item: any, index: number) => {
  //     return `
  //         <tr style="border: 1px solid #dddddd; text-align: left; padding: 1px;">
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${index + 1}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.item_name}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.quantity ? item.quantity : 'NA'}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.sum_withoutgst.toFixed(2)}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.sum_withgst.toFixed(2)}</strong></td>
  //         </tr>
         
  //         `;
  //   }).join('')}
  // <tr>
  //     <td colspan=2></td>
  //     <td class="table-heading-color"><strong>Grand Total:</strong></td>
  //      <td class="table-heading-sub-text" style="color:red">&#8377 <strong>${this.totalAssetsPurchasewithoutgst.toFixed(2)}</strong></td>
  //       <td class="table-heading-sub-text" style="color:red">&#837 7<strong>${this.totalAssetsPurchasewithgst.toFixed(2)}</strong></td>
  //           </tr>
  //   </tbody>
  // </table>`;

  //   const ctx = { worksheet: 'Worksheet', table: tableHtml };
  //   const link = document.createElement('a');
  //   // link.download = `itemdata_with_userandlocation_${this.currentdate}_${randomDate}.xls`;
  //   link.download = `report_complelete_assets.xls`;
  //   link.href = uri + base64(format(template, ctx));
  //   link.click();
  // }

  exportToexcelfromnode(): any {
    const modifiedItemsDataList = this.assetListObject.map((item: any, index: any) => {
      return {
        ...item,  // Spread the original object properties
        "total_withgst_in_inr":parseFloat(item.total_withgst_in_inr.toFixed(2)),
        "total_withgst_in_usd":parseFloat(item.total_withgst_in_usd.toFixed(2)),
        "S.No.": index + 1  // Add the S.No. field with the appropriate value
      };
    });


    const reportRequest = {
      reportTitle: "Total Assets",
      columns: [
        { header: 'S.No.', key: 'S.No.', width: 10, filterButton: false },
        { header: 'Item Name', key: 'item_name',width: 40, filterButton: true },
        { header: 'Quantity', key: 'quantity',width: 40},
        { header: 'Total Price(₹)', key: 'total_withgst_in_inr', width: 40, format: 'currency', filterButton: false, totalsRowFunction: "sum" },
        { header: 'Total Price($)', key: 'total_withgst_in_usd', width: 40, format: 'currency', filterButton: false, totalsRowFunction: "sum" },
      ],

      data: modifiedItemsDataList , // Data to populate the report
      totalsrow:true,
    };

    this.fileService.exportToExcel(reportRequest).subscribe(
      (response: Blob) => {
        // Call downloadBlob to trigger the download with the response
        this.fileService.downloadBlob(response, 'report_total_assets.xlsx');
      },
      (error) => {
        console.error('Error exporting to Excel', error);
      }
    );
  }
}
