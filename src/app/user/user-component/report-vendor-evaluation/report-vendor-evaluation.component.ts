import { Component, ViewChild, ElementRef } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { Router, ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';
import { FilesService } from 'src/app/services/files.service';

@Component({
  selector: 'app-report-vendor-evaluation',
  templateUrl: './report-vendor-evaluation.component.html',
  styleUrls: ['./report-vendor-evaluation.component.scss']
})
export class ReportVendorEvaluationComponent {
  isDataorNot:boolean = true;
  displayList = false;
  evaluationDataList: any = [];
  empltyDataList=[];
  searchItem = '';
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];
  purchaseId: any;

  itemData: any[] = [];
  filteredvendorEvaluationData: any[] = [];
  searchTerm: string = '';
  totalItems: number=0;
  previousUrl:any;
  vendorEvaluationbydate ={
    start_date:'',
    end_date:''
  }
  currentdate:any;
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  isRotating: boolean = false;
  isNavigatedBack: boolean = false;
  sortingorder:any;
  itemsperPage:any = 20;

  constructor(private sharedService: SharedService, private router: Router, private spinner: NgxSpinnerService,
     private location:Location, private activatedRoute:ActivatedRoute, private fileService:FilesService) {
    const today = moment();
    this.currentdate = today.format('YYYY-MM-DD');
   }

  ngOnInit(): void {
    this.statemanagement();
    this.getsupplierEvaluationData();
  }

  statemanagement(){
    this.isNavigatedBack = localStorage.getItem('navigated') === 'true';
    localStorage.removeItem('navigated');
    this.activatedRoute.queryParams.subscribe(async (params: any) => {
      // console.log(params['sort'].split('-'), "sortsplit");
      if (this.isNavigatedBack === true) {
        if (params['searchTerm'] && params['searchTerm'] !== '') {
          this.searchTerm = params['searchTerm'];
        }
        if (params['from'] && params['from'] !== '' && params['to'] && params['to'] !== '') {
          this.vendorEvaluationbydate.start_date = params['from'];
          this.vendorEvaluationbydate.end_date = params['to'];
        }

        if(params['itemsperPage']){
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
            console.log(this.tableSize);
          }

          if (params['sort'] && params['sort'] !== '') {
            const [column, sortParams] = params['sort'].split('-');
            console.log (params['sort'].split('-')[1]);
            const ascending = sortParams === 'asc'?true:false;
            this.isAscending = ascending;  
            // Ensure sortingorder is set properly when restoring state
            this.sortingorder = `${column}-${this.isAscending}`;
            this.sort(column);
          }
        }, 800)
      }
      else{

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

  async getsupplierEvaluationData() {
    this.spinner.show();
    try{
      const results:any = await this.sharedService.getvendorEvaluationjoindata().pipe(
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
            const splitevaluationdate = item.evaluation_date?moment(item.evaluation_date).format('DD-MM-YYYY'):null;
            return { ...item, evaluation_date: splitevaluationdate };

        });


        // unique data 
        const alwaysUniquepurchase = filteredResults.filter((item:any, index:any, self:any)=>{
         return index === self.findIndex((t:any) => t.purchase_id === item.purchase_id)
        })

          this.filteredvendorEvaluationData = alwaysUniquepurchase;
          console.log(filteredResults, "filteredResults");
          console.log(this.filteredvendorEvaluationData, "filteredvendorEvaluationData");
          this.itemData = alwaysUniquepurchase;
          this.count = alwaysUniquepurchase.length;
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
            if (item[key] !== null && item[key] !== '' &&  key === 'evaluation_date') {
              return item[key]?.includes(this.searchTerm);
            } else if (item[key] !== null && item[key] !== '') {
              return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
            }
            return false;
          });
        });
      }   
 
    // Filter by date range only if there is a valid date range
    if (this.vendorEvaluationbydate?.start_date && this.vendorEvaluationbydate?.end_date) {
      if (this.vendorEvaluationbydate.start_date <= this.vendorEvaluationbydate.end_date) {
        filteredData = filteredData.filter((item: any) => {
          const filteredevaluationdate = moment(item?.evaluation_date, 'DD-MM-YYYY').format('YYYY-MM-DD');
          if (filteredevaluationdate) {
            return filteredevaluationdate >= this.vendorEvaluationbydate.start_date &&
            filteredevaluationdate <= this.vendorEvaluationbydate.end_date;
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
    this.filteredvendorEvaluationData = filteredData;
    this.totalItems = this.filteredvendorEvaluationData.length;
    this.count = this.totalItems;
    this.page = 1; // Reset to the first page when filtering occurs
  }

  refreshfilter() {
    this.isRotating = true;
    this.getsupplierEvaluationData().then(() => {
      // Clear date filters
      if (this.vendorEvaluationbydate?.start_date || this.vendorEvaluationbydate?.end_date) {
        this.vendorEvaluationbydate.start_date = '';
        this.vendorEvaluationbydate.end_date = '';
      }
      if (!this.itemData) {
        this.itemData = this.itemData;
      }
    
      // Start with the original data or the previously filtered data
      let filteredData: any[] = this.itemData;
    
      // // Filter by search term
      if (this.searchTerm) {    
          filteredData = filteredData.filter((item: any) => {
            return Object.keys(item).some(key => {
              if (item[key] !== null && item[key] !== '' &&  key === 'evaluation_date') {
                return item[key]?.includes(this.searchTerm);
              } else if (item[key] !== null && item[key] !== '') {
                return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
              }
              return false;
            });
          });
        }   
   // Update filtered data and totalItems
   this.filteredvendorEvaluationData = filteredData;
   this.totalItems = this.filteredvendorEvaluationData.length;
   this.page = 1; // Reset to the first page when filtering occurs
   setTimeout(() => {
    this.isRotating = false;
   }, 500);
    });
  }

  NoSpaceallowedatstart(event:any){
    if(event.target.selectionStart === 0 && event.code ==="Space")
    {
      event.preventDefault();
    }
  
  }

  ontableDatachange(event: any) {
    this.page = event;
    // this.getsupplierEvaluationData();
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
    this.itemsperPage = Value ;
    this.page = 1;
  }

  toggleExpand(item:any) {
    item.isExpanded = !item.isExpanded;
  }


  //this is for when data comes with api call(array of object)
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
//   const columnNames = ['S.No.','Purchase_id','Vendor\'s Name', 'Quality Basis Grading', 'Price Grading', 'Communication Grading', 'Delivery Grading', 'Commitment Grading', 'Overall Grading', 'Evaluation Date'];
//   const tableHtml = `<table style="border-collapse: collapse; width: 80%; background-color: #f2f2f2;">
//   <thead>
//     <tr style="background-color: #00008B; color:#fff;">
//       ${columnNames.map((name) => `<th style="border: 1px solid #dddddd; text-align: left; padding: 1px;">${name}</th>`).join('')}
//     </tr>
//   </thead>
//   <tbody>
//     ${this.filteredvendorEvaluationData.map((item: any, index: number) => {
//       return `
//         <tr style="border: 1px solid #dddddd; text-align: left; padding: 1px;">
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${index + 1}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.purchase_id?item.purchase_id:'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.supplier_name?item.supplier_name:'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.qualitybasis_grading?item.qualitybasis_grading:'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.pricebasis_grading?item.pricebasis_grading:'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.communicationbasis_grading?item.communicationbasis_grading:'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.deliverybasis_grading?item.deliverybasis_grading:'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.commitmentbasis_grading?item.commitmentbasis_grading:'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.vendor_status?item.vendor_status:'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.evaluation_date?item.evaluation_date:'NA'}</strong></td>
//         </tr>`;
//     }).join('')}
//   </tbody>
// </table>`;

//   const ctx = { worksheet: 'Worksheet', table: tableHtml };
//   const link = document.createElement('a');
//   link.download = `report_vendor_evaluation.xls`;
//   link.href = uri + base64(format(template, ctx));
//   link.click();
// }

exportToexcelfromnode(): any {
  const modifiedItemsDataList = this.filteredvendorEvaluationData.map((item: any, index: any) => {
    return {
      ...item,  // Spread the original object properties
      "S.No.": index + 1  // Add the S.No. field with the appropriate value
    };
  });

  const reportRequest = {
    reportTitle: "Report Vendor Evaluation",
    columns: [
      { header: 'S.No.', key: 'S.No.', width: 10, filterButton: false },
      { header: 'Purchase Id', key: 'purchase_id',width: 30, filterButton: true },
      { header: 'Vendor Name', key: 'supplier_name',width: 45, filterButton: true },
      { header: 'Quality Basis Grading', key: 'qualitybasis_grading', width: 30, filterButton: false },
      { header: 'Price Grading', key: 'pricebasis_grading', width: 25, filterButton: false },
      { header: 'Communication Grading', key: 'communicationbasis_grading', width: 30, filterButton: false },
      { header: 'Delivery Grading', key: 'deliverybasis_grading', width: 25, filterButton: false },
      { header: 'Commitment Grading', key: 'commitmentbasis_grading', width: 35, filterButton: false },
      { header: 'Overall Grading', key: 'vendor_status', width: 28, filterButton: true },
      { header: 'Evaluation Date', key: 'evaluation_date', width: 25, format:'date', filterButton: false },
    ],

    data: modifiedItemsDataList , // Data to populate the report
    totalsrow:false,
    filters:[
      { filterBy:(this.vendorEvaluationbydate.start_date && this.vendorEvaluationbydate.end_date)?'Evaluation Date':'' , startDate:this.vendorEvaluationbydate.start_date||'', endDate:this.vendorEvaluationbydate.end_date||''}
    ]
  };

  this.fileService.exportToExcel(reportRequest).subscribe(
    (response: Blob) => {
      // Call downloadBlob to trigger the download with the response
      this.fileService.downloadBlob(response, 'report_vendor_evaluation.xlsx');
    },
    (error) => {
      console.error('Error exporting to Excel', error);
    }
  );
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

  this.filteredvendorEvaluationData.sort((a: any, b: any) => {
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


navigateToNewRoute(items: any) {
  const queryParams = {
    searchTerm: this.searchTerm || '',
    page: this.page || 1,
    tableSize: this.tableSize || 10,
    from:this.vendorEvaluationbydate.start_date||'',
    to:this.vendorEvaluationbydate.end_date||'',
    sort:this.sortingorder || '',
    itemsperPage:this.itemsperPage || ''
  }

  this.previousUrl = this.location.path().split('?')[0];
  // Store the current URL with query params
  localStorage.setItem('backUrl', this.previousUrl + this.buildQueryString(queryParams));
  localStorage.setItem('navigated', 'true'); // Set the flag for navigation
  this.router.navigate(['user/purchase-info', items.purchase_id], { queryParams });
}

buildQueryString(params: any): string {
  return '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&');
}

}
