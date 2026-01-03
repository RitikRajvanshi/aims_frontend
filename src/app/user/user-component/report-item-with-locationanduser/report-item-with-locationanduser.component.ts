import { Component, ElementRef, ViewChild } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { map } from 'rxjs/operators';
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { jsPDF } from 'jspdf';
import { Location } from '@angular/common';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';
import { FilesService } from 'src/app/services/files.service';

interface Item {
  purchase_id: string;
  item_code: string;
  item_name: string;
  transfer_date: Date;
}


@Component({
  selector: 'app-report-item-with-locationanduser',
  templateUrl: './report-item-with-locationanduser.component.html',
  styleUrls: ['./report-item-with-locationanduser.component.scss']
})
export class ReportItemWithLocationanduserComponent {
  @ViewChild('content') content!: ElementRef;
  isDataorNot: boolean = true;
  searchItem = '';
  searchTerm: string = '';
  filtereditemData: any[] = [];
  itemData: any[] = [];
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];
  totalItems: any;
  empltyDataList = [];
  previousUrl: any;
  transferDate: any = {
    start_date: '',
    end_date: ''
  }
  currentdate: any;
  purchaseorderreport: any;
  // In your component class
  globalSearch:string='';
  purchaseId: string = '';
  itemCode: string = '';
  itemName: string = '';
  transferDateInput: string = ''; // Assuming this is a string representation of the date
  locationName: string = '';
  groupName: string = '';
  SystemName: string = '';
  UserName: string = '';
  remark: string = '';
  systemTransferData: any;
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  isRotating: boolean = false;
  private isNavigatedBack: boolean = false; // Flag to check navigation source
  sortingorder: any;
  itemId: any;
  radiobtnatTransfer: any;
  hoveredDataResultForItemName: { [key: string]: boolean } = {}; // Store the result for each item
  hoveredDataResultForCategoryName: { [key: string]: boolean } = {}; // Store the result for each item
  itemsperPage:any = 20;
  userRole = localStorage.getItem('level');

  constructor(private sharedService: SharedService, private spinner: NgxSpinnerService, private router: Router, private location: Location
    , private activatedRoute: ActivatedRoute, private filesServices:FilesService) {
    const today = moment();
    this.currentdate = today.format('YYYY-MM-DD');
  }

  ngOnInit() {
    this.statemanagement();
    this.getItemdatawithlocationanduser();
  }

  statemanagement() {
    this.isNavigatedBack = localStorage.getItem('navigated') === 'true';
    localStorage.removeItem('navigated');
    this.activatedRoute.queryParams.subscribe(async (params: any) => {
      if (this.isNavigatedBack === true) {
        if (params['searchTerm'] && params['searchTerm'] !== '') {
          this.searchTerm = params['searchTerm'];
        }

        if(params['itemsperPage']){
          this.itemsperPage = params['itemsperPage'];
        }

        if (params['from'] && params['from'] !== '' && params['to'] && params['to'] !== '') {
          this.transferDate.start_date = params['from'];
          this.transferDate.end_date = params['to'];
        }

        if (params['purchaseId'] && params['purchaseId'] !== '') {
          this.purchaseId = params['purchaseId'];
        }

        if (params['itemCode'] && params['itemCode'] !== '') {
          this.itemCode = params['itemCode'];
        }
        if (params['itemName'] && params['itemName'] !== '') {
          this.itemName = params['itemName'];
        }

        if (params['transferDateInput'] && params['transferDateInput'] !== '') {
          this.transferDateInput = params['transferDateInput'];
        }

        if (params['locationName'] && params['locationName'] !== '') {
          this.locationName = params['locationName'];
        }

        if (params['groupName'] && params['groupName'] !== '') {
          this.groupName = params['groupName'];
        }

        if (params['SystemName'] && params['SystemName'] !== '') {
          this.SystemName = params['SystemName'];
        }
        if (params['UserName'] && params['UserName'] !== '') {
          this.UserName = params['UserName'];
        }
        if (params['locationName'] && params['locationName'] !== '') {
          this.remark = params['remark'];
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
            // console.log(params['sort'].split('-')[1]);
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

  async getItemdatawithlocationanduser() {
    this.spinner.show();
    try {
      const results: any = await this.sharedService.getitemsDatawithuserandlocation().pipe(
        retry(3)
      ).toPromise();

      if (!results || results.length === 0) {
        this.isDataorNot = false;
        return;
      }

      this.isDataorNot = true;
      // console.log(results, "databeforefilter")
      const filteredResults = results.map((item: any) => {
        //due to new change in procedure we have to change the below code
        const splitTransferDate = (item?.transfer_date == 'NA') ? 'NA' : moment(item?.transfer_date, 'YYYY-MM-DD').format('DD-MM-YYYY');
        const splitcreatedDate = (item?.created_date == 'NA') ? 'NA' : moment(item?.created_date, 'YYYY-MM-DD').format('DD-MM-YYYY');
        return { ...item, created_date: splitcreatedDate, transfer_date: splitTransferDate };
      });

      const filteredItemsArray: any[] = filteredResults;
      // console.log(filteredItemsArray, "filteredItemsArray");
      this.count = filteredResults.length;
      console.log(filteredItemsArray, "filteredItemsArray");
      
      this.filtereditemData = filteredItemsArray.filter((item) => {
       
        if (!item.purchase_id.startsWith('BRND-')) {
          return true;
        } 
        // should always changes to Number first then it works 2025-03-05 2025.5.1
          //  branded item(at replacement logic transfer to warehouse) that used in other system should also visible
        else if (item.purchase_id.startsWith('BRND-') && ([1, 4, 5, 6, 7].includes(Number(item.location_id)) || item.item_status=='1')) {
          return true;
        }

        return false;
      });

      this.itemData = this.filtereditemData;
      console.log(this.itemData, 'this.itemData');
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
    finally {
      this.spinner.hide();
    }
  }

  //this is for when data comes with api call(array of object)
//   exportToExcel() {
//     const randomDate = new Date().valueOf();
//     const uri = 'data:application/vnd.ms-excel;base64,';
//     const template = `
//     <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
//     <head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
//     <body>{table}</body>
//     </html>
//   `;
//     const base64 = function (s: any) { return window.btoa(unescape(encodeURIComponent(s))) };
//     const format = function (s: any, c: any) { return s.replace(/{(\w+)}/g, function (m: any, p: any) { return c[p]; }) };

//     // Define your column names
//     const columnNames = ['S.No.', 'Purchase Id', 'Item Code', 'Item Name', 'Transfer Date', 'Location', 'Department', 'System', 'User', 'Remark'];
//     const tableHtml = `<table style="border-collapse: collapse; width: 80%; background-color: #f2f2f2;">
//   <thead>
//     <tr style="background-color: #00008B; color:#fff;">
//       ${columnNames.map((name) => `<th style="border: 1px solid #dddddd; text-align: left; padding: 1px;">${name}</th>`).join('')}
//     </tr>
//   </thead>
//   <tbody>
//     ${this.itemData.map((item: any, index: number) => {
//       return `
//         <tr style="border: 1px solid #dddddd; text-align: left; padding: 1px;">
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${index + 1}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.purchase_id}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.item_code}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.item_name}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.transfer_date ? item.transfer_date : 'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.location_name ? item.location_name : 'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.grp_name ? item.grp_name : 'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.system_code ? item.system_code : 'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.user_name ? item.user_name : 'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.description ? item.description : 'NA'}</strong></td>
//         </tr>`;
//     }).join('')}
//   </tbody>
// </table>`;

//     const ctx = { worksheet: 'Worksheet', table: tableHtml };
//     const link = document.createElement('a');
//     // link.download = `itemdata_with_userandlocation_${this.currentdate}_${randomDate}.xls`;
//     link.download = `report_items_with_location.xls`;
//     link.href = uri + base64(format(template, ctx));
//     link.click();
//   }

  exportToexcelfromnode(): any {
    const modifiedItemsDataList = this.filtereditemData.map((item: any, index: any) => {
 
      return {
        ...item,  // Spread the original object properties
        "S.No.": index + 1  // Add the S.No. field with the appropriate value
      };
    });

  
    const reportRequest = {
      reportTitle: "Report Items with Location",
      columns: [
        { header: 'S.No.', key: 'S.No.', width: 10, filterButton: false },
        { header: 'Purchase Id', key: 'purchase_id',width: 30, filterButton: true },
        { header: 'Item Code', key: 'item_code', width: 35, filterButton: true },
        { header: 'Item Name', key: 'item_name', width: 35, filterButton: true },
        { header: 'Transfer Date', key: 'transfer_date', width: 25, format: 'date', filterButton: false },
        { header: 'Location', key: 'location_name', width: 30, filterButton: true },
        { header: 'Department', key: 'grp_name', width: 35, filterButton: true },
        { header: 'System', key: 'system_code', width: 25, filterButton: true },
        { header: 'User', key: 'user_name', width: 25, filterButton: true },
        { header: 'Remark', key: 'description', width: 40, filterButton: false },
      ],
  
      data: modifiedItemsDataList , // Data to populate the report
      totalsrow:false,
      filters:[
        { filterBy:(this.transferDate.start_date && this.transferDate.end_date)?'Transfer Date':'' , startDate:this.transferDate.start_date||'', endDate:this.transferDate.end_date||''}
      ]
    };
  
    this.filesServices.exportToExcel(reportRequest).subscribe(
      (response: Blob) => {
        // Call downloadBlob to trigger the download with the response
        this.filesServices.downloadBlob(response, 'report_items_with_location.xlsx');
      },
      (error) => {
        console.error('Error exporting to Excel', error);
      }
    );
  }

  async SavePDF() {
    let content = this.content.nativeElement;
    let doc = new jsPDF();

    let _elementHandlers =
    {
      '#editor': function (element: any, renderer: any) {
        return true;
      }
    };
    doc.save('test.pdf');

  }


  sort(columnName: string) {
    // console.log(columnName, "columnName");
    if (this.currentSortColumn === columnName) {
      this.isAscending = !this.isAscending; // Toggle sorting order
    }
    else {
      this.currentSortColumn = columnName; // Update current sort column
      this.isAscending = this.isAscending ? this.isAscending : false; // Set sorting order to ascending for the new column
    }

    // Update sortingorder with the new column and sorting order
    this.sortingorder = `${columnName}-${this.isAscending ? 'asc' : 'desc'}`;

    this.filtereditemData.sort((a: any, b: any) => {
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
   this.itemsperPage = Value ;
    this.page = 1;
  }

  async filterData(): Promise<void> {
    // Ensure itemData is initialized correctly (assuming it's initialized somewhere else in your code)
    if (!this.itemData) {
      return;
    }

    let filteredData: any[] = [...this.itemData]; // Use spread operator to create a copy of itemData

      // 🔎 Global / basic search across all fields
  if (this.globalSearch) {
    const searchTerm = this.globalSearch.toLowerCase();
    filteredData = filteredData.filter(item =>
      (item.purchase_id?.toString().toLowerCase().includes(searchTerm)) ||
      (item.item_code?.toString().toLowerCase().includes(searchTerm)) ||
      (item.item_name?.toString().toLowerCase().includes(searchTerm)) ||
      (item.transfer_date?.toString().toLowerCase().includes(searchTerm)) ||
      (item.location_name?.toString().toLowerCase().includes(searchTerm)) ||
      (item.grp_name?.toString().toLowerCase().includes(searchTerm)) ||
      (item.system_code?.toString().toLowerCase().includes(searchTerm)) ||
      (item.user_name?.toString().toLowerCase().includes(searchTerm)) ||
      (item.description?.toString().toLowerCase().includes(searchTerm))
    );
  }

    // Filter by purchase ID (as an example, adjust for each field)
    if (this.purchaseId) {
      filteredData = filteredData.filter(item => item.purchase_id?.toString().toLowerCase().includes(this.purchaseId.toLowerCase()));
    }

    if (this.itemCode) {
      filteredData = filteredData.filter(item => item.item_code?.toString().toLowerCase().includes(this.itemCode.toLowerCase()));
    }
    if (this.itemName) {
      filteredData = filteredData.filter(item => item.item_name?.toString().toLowerCase().includes(this.itemName.toLowerCase()));

    }
    if (this.transferDateInput) {
      filteredData = filteredData.filter(item => item.transfer_date?.toString().toLowerCase().includes(this.transferDateInput.toLowerCase()));
    }
    if (this.locationName) {
      filteredData = filteredData.filter(item => item.location_name?.toString().toLowerCase().includes(this.locationName.toLowerCase()));
    }
    if (this.groupName) {
      filteredData = filteredData.filter(item => item.grp_name?.toString().toLowerCase().includes(this.groupName.toLowerCase()));
    }

    if (this.SystemName) {
      filteredData = filteredData.filter(item => item.system_code?.toString().toLowerCase().includes(this.SystemName.toLowerCase()));
    }

    if (this.UserName) {
      filteredData = filteredData.filter(item => item.user_name?.toString().toLowerCase().includes(this.UserName.toLowerCase()));
    }

    if (this.remark) {
      filteredData = filteredData.filter(item => item.description?.toString().toLowerCase().includes(this.remark.toLowerCase()));
    }


    if (this.transferDate?.start_date && this.transferDate?.end_date) {
      if (this.transferDate.start_date <= this.transferDate.end_date) {
        filteredData = filteredData.filter((item: any) => {
          const filtereddate = moment(item.transfer_date, 'DD-MM-YYYY').format('YYYY-MM-DD');
          if (filtereddate) {
            return filtereddate >= this.transferDate.start_date && filtereddate <= this.transferDate.end_date;
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
        // this.page = 0; // Consider whether this is needed based on your paging logic
      }
    }
    // Once all filtering is applied
    this.filtereditemData = filteredData;
    // console.log(this.filtereditemData, this.filtereditemData?.length, "this.filtereditemData");
    this.totalItems = this.filtereditemData?.length;
    this.count = this.totalItems;
    this.page = 1;

  }

  async purchaseinfo(pid: any) {
    try {
      const p_id = {
        purchase_id: pid
      }

      const purchasedetail = await lastValueFrom(this.sharedService.getPurchaseJoinDatabyIdorpurchaseid(p_id))
      this.purchaseorderreport = purchasedetail;
    }

    catch (error: unknown) {
      if (error instanceof HttpErrorResponse && error.status === 403) {
        await Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Token expired.',
          footer: '<a href="../login">Please login again!</a>'
        }).then(() => {
          this.router.navigate(['../login']);
        })

      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Internal server error. Please try after some time!',
          footer: '<a href="../login">Login</a>'
        }).then(() => {
          location.reload();
        })
      }
    }
  }

  async getTransferData(data: any): Promise<any> {
    try {
      //configuration  
      const results: any = await this.sharedService.getsystemDataotherThanCPU(data).toPromise();
      // console.log(results, "getsystemDataotherThanCPU");

      if (results[0] && results[0].length !== 0) {

        const configureitemdetails = JSON.parse(JSON.stringify(results));
        const getTransferDataDetailotherthanCPU = `${results[results.length - 1].item_code} is presently assigned to ${results[0].system_name} system`;
        return getTransferDataDetailotherthanCPU;
      } else {
        //if there is no configuration at all 
        // console.log("in else part...");

        // console.log(data, "this.itemdetailsbyitemid")
        //below gives system information
        const itemResults: any = await this.sharedService.getitemsdatabyitemid(data).toPromise();

        // console.log(itemResults, "itemResults");

        return itemResults;
      }
    }
    catch (error: unknown) {
      if (error instanceof HttpErrorResponse && error.status === 403) {
        await Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Token expired.',
          footer: '<a href="../login">Please login again!</a>'
        }).then(() => {
          this.router.navigate(['../login']);
        })

      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Internal server error. Please try after some time!',
          footer: '<a href="../login">Login</a>'
        }).then(() => {
          location.reload();
        })
      }
    }
  }

  toggleExpand(item: any) {
    item.isExpanded = !item.isExpanded;
  }

  refreshfilter() {
    this.isRotating = true;
    this.getItemdatawithlocationanduser().then(() => {
      // Assuming itemData is initialized correctly
      let filteredData: any[] = this.itemData;

      if (this.transferDate?.start_date || this.transferDate?.end_date) {
        this.transferDate.start_date = '';
        this.transferDate.end_date = '';
      }

      // Filter by purchase ID (as an example, adjust for each field)
      if (this.purchaseId) {
        filteredData = filteredData.filter(item => item.purchase_id?.toString().toLowerCase().includes(this.purchaseId.toLowerCase()));
        this.totalItems = filteredData?.length;
        this.page = 1; // Consider whether this is needed based on your paging logic
      }

      if (this.itemCode) {
        filteredData = filteredData.filter(item => item.item_code?.toString().toLowerCase().includes(this.itemCode.toLowerCase()));
        this.totalItems = filteredData?.length;
        this.page = 1; // Consider whether this is needed based on your paging logic
      }
      if (this.itemName) {
        filteredData = filteredData.filter(item => item.item_name?.toString().toLowerCase().includes(this.itemName.toLowerCase()));
        this.totalItems = filteredData?.length;
        this.page = 1; // Consider whether this is needed based on your paging logic
      }
      if (this.transferDateInput) {
        filteredData = filteredData.filter(item => item.transfer_date?.toString().toLowerCase().includes(this.transferDateInput.toLowerCase()));
        this.totalItems = filteredData?.length;
        this.page = 1; // Consider whether this is needed based on your paging logic
      }
      if (this.locationName) {
        filteredData = filteredData.filter(item => item.location_name?.toString().toLowerCase().includes(this.locationName.toLowerCase()));
        this.totalItems = filteredData?.length;
        this.page = 1; // Consider whether this is needed based on your paging logic
      }
      if (this.groupName) {
        filteredData = filteredData.filter(item => item.grp_name?.toString().toLowerCase().includes(this.groupName.toLowerCase()));
        this.totalItems = filteredData?.length;
        this.page = 1; // Consider whether this is needed based on your paging logic
      }

      if (this.SystemName) {
        filteredData = filteredData.filter(item => item.system_code?.toString().toLowerCase().includes(this.SystemName.toLowerCase()));
        this.totalItems = filteredData?.length;
        this.page = 1; // Consider whether this is needed based on your paging logic
      }

      if (this.UserName) {
        filteredData = filteredData.filter(item => item.user_name?.toString().toLowerCase().includes(this.UserName.toLowerCase()));
        this.totalItems = filteredData?.length;
        this.page = 1; // Consider whether this is needed based on your paging logic
      }

      if (this.remark) {
        filteredData = filteredData.filter(item => item.description?.toString().toLowerCase().includes(this.remark.toLowerCase()));
        this.totalItems = filteredData?.length;
        this.page = 1; // Consider whether this is needed based on your paging logic
      }

      // Update the total items and current page
      this.totalItems = filteredData.length;
      this.page = 1; // Consider whether this is needed based on your paging logic

      // Apply the filtered data to the component state
      this.filtereditemData = filteredData;
      setTimeout(() => {
        this.isRotating = false;
      }, 500);

    });

  }

  navigateToNewRoute(items: any) {
    const queryParams: any = {};

    // Add properties to queryParams only if their values are not empty or undefined
    if (this.searchTerm) queryParams.searchTerm = this.searchTerm;
    if (this.page) queryParams.page = this.page;
    if (this.tableSize) queryParams.tableSize = this.tableSize;
    if (this.transferDate.start_date) queryParams.from = this.transferDate.start_date;
    if (this.transferDate) {
      if (this.transferDate.start_date) queryParams.from = this.transferDate.start_date;
      if (this.transferDate.end_date) queryParams.to = this.transferDate.end_date;
    }
    if (this.tableSize) queryParams.tableSize = this.tableSize;
    if (this.sortingorder) queryParams.sort = this.sortingorder;

    if (items) {
      queryParams.isSystemornot = (items.item_name === 'CPU' || items.item_name === 'LAPTOP' || items.item_name === 'ALL IN ONE PC') ? 1 : 0;
      if (items.item_code) queryParams.item_code = items.item_code;
    }

    if (this.purchaseId) queryParams.purchaseId = this.purchaseId;
    if (this.itemCode) queryParams.itemCode = this.itemCode;
    if (this.itemName) queryParams.itemName = this.itemName;
    if (this.transferDateInput) queryParams.transferDateInput = this.transferDateInput;
    if (this.locationName) queryParams.locationName = this.locationName; // Only add if locationName is present
    if (this.groupName) queryParams.groupName = this.groupName;
    if (this.SystemName) queryParams.SystemName = this.SystemName;
    if (this.UserName) queryParams.UserName = this.UserName;
    if (this.remark) queryParams.remark = this.remark;
    if (this.itemsperPage) queryParams.itemsperPage = this.itemsperPage;
    
    // if (items.item_code) queryParams.item_code = items.item_code;


    this.previousUrl = this.location.path().split('?')[0];

    // Store the current URL with query params
    localStorage.setItem('backUrl', this.previousUrl + this.buildQueryString(queryParams));
    localStorage.setItem('navigated', 'true'); // Set the flag for navigation
    this.router.navigate(['user/system-detail', items.item_id, items.item_id], { queryParams });
  }

  navigateTopurchaseinfo(items: any) {
    const queryParams: any = {};

    // Add properties to queryParams only if their values are not empty or undefined
    if (this.searchTerm) queryParams.searchTerm = this.searchTerm;
    if (this.page) queryParams.page = this.page;
    if (this.tableSize) queryParams.tableSize = this.tableSize;
    if (this.transferDate && this.transferDate.start_date) queryParams.from = this.transferDate.start_date;
    if (this.transferDate && this.transferDate.end_date) queryParams.to = this.transferDate.end_date;
    if (this.purchaseId) queryParams.purchaseId = this.purchaseId;
    if (this.itemCode) queryParams.itemCode = this.itemCode;
    if (this.itemName) queryParams.itemName = this.itemName;
    if (this.transferDateInput) queryParams.transferDateInput = this.transferDateInput;
    if (this.locationName) queryParams.locationName = this.locationName; // Only add if locationName is present
    if (this.groupName) queryParams.groupName = this.groupName;
    if (this.SystemName) queryParams.SystemName = this.SystemName;
    if (this.UserName) queryParams.UserName = this.UserName;
    if (this.remark) queryParams.remark = this.remark;
    if (this.sortingorder) queryParams.sort = this.sortingorder;
    if (this.itemsperPage) queryParams.itemsperPage = this.itemsperPage;

    this.previousUrl = this.location.path().split('?')[0];
    // Store the current URL with query params
    localStorage.setItem('backUrl', this.previousUrl + this.buildQueryString(queryParams));
    localStorage.setItem('navigated', 'true'); // Set the flag for navigation
    this.router.navigate(['user/purchase-info', items.purchase_id], { queryParams });
  }

  navigateTotransferStock(items: any, radioButton: string) {
    const queryParams: any = {};
    const itemsId = items?.item_id;
    const radioButtonValue = radioButton;
    const ItemCode = items?.item_code;
    const itemNameforts = items?.item_name;
    const locationId = +items?.location_id;

    // Add properties to queryParams only if their values are not empty or undefined
    if (this.searchTerm) queryParams.searchTerm = this.searchTerm;
    if (this.page) queryParams.page = this.page;
    if (this.tableSize) queryParams.tableSize = this.tableSize;
    if (this.transferDate && this.transferDate.start_date) queryParams.from = this.transferDate.start_date;
    if (this.transferDate && this.transferDate.end_date) queryParams.to = this.transferDate.end_date;
    if (this.purchaseId) queryParams.purchaseId = this.purchaseId;
    if (this.itemCode) queryParams.itemCode = this.itemCode;
    if (this.itemName) queryParams.itemName = this.itemName;
    if (this.transferDateInput) queryParams.transferDateInput = this.transferDateInput;
    if (this.locationName) queryParams.locationName = this.locationName; // Only add if locationName is present
    if (this.groupName) queryParams.groupName = this.groupName;
    if (this.SystemName) queryParams.SystemName = this.SystemName;
    if (this.UserName) queryParams.UserName = this.UserName;
    if (this.remark) queryParams.remark = this.remark;
    if (this.sortingorder) queryParams.sort = this.sortingorder;
    if (itemsId) queryParams.itemId = itemsId;
    if (radioButtonValue) queryParams.radiobtnatTransfer = radioButtonValue;
    if (ItemCode) queryParams.ItemCode = ItemCode;
    if (locationId) queryParams.locationId = locationId;
    if (itemNameforts) queryParams.itemNameforts = itemNameforts;
    if (this.itemsperPage) queryParams.itemsperPage = this.itemsperPage;

    this.previousUrl = this.location.path().split('?')[0];

    // Store the current URL with query params
    localStorage.setItem('backUrl', this.previousUrl + this.buildQueryString(queryParams));
    localStorage.setItem('navigated', 'true'); // Set the flag for navigation
    // Make sure queryParams has values before navigating
    if (Object.keys(queryParams).length > 0) {
      this.router.navigate(['user/transfer-stock'], { queryParams });
    } else {
      console.warn('No query parameters to send');
    }
  }

  buildQueryString(params: any): string {
    return '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&');
  }


  containsProducts(data: any): boolean {
    const items = ["CPU", "ALL IN ONE PC", "LAPTOP"]; 
    // const itemname = ['RAM','B-RAM','HDD','SSD HDD','B-HDD','SMPS', 'B-SMPS','Graphics Card','B-Graphics card', 'B-GRAPHICS CARD'];
    if (data && data.item_name) {
      const itemName = data.item_name.trim().toUpperCase(); 
      return items.includes(itemName); 
    }
  
    return false;
  }

  containsCategory(data: any): boolean {
    const category = ["Computer Hardware"];
    const items = ['RAM','B-RAM','HDD','SSD HDD','B-HDD','SMPS', 'B-SMPS','Graphics Card','B-Graphics card', 'B-GRAPHICS CARD'];
  
    if (data && data.category_name && data.item_name) {
      const categoryName = data.category_name;
      const itemName = data.item_name; 
    
    // Check if both category and item are in the predefined lists
    const isCategoryValid = category.includes(categoryName);
    const isItemValid = items.includes(itemName);
    return (!isItemValid && isCategoryValid);
    }
  
    return false;
  }

  onMouseEnter(data: any): void {
    this.hoveredDataResultForItemName[data.item_name] = this.containsProducts(data);
    this.hoveredDataResultForCategoryName[data.category_name] = this.containsCategory(data);
    // console.log(this.hoveredDataResultForItemName[data.item_code]);
  }

  onMouseLeave(data: any): void {
    delete this.hoveredDataResultForItemName[data.item_name]; 
    delete this.hoveredDataResultForCategoryName[data.category_name]; 
  }

  trackById(index: number, item: any): any {
  return item.id || item.purchase_id || index; // Use a unique key
}


}
