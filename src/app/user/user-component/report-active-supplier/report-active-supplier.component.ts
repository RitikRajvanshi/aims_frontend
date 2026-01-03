import { Component } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';
import { FilesService } from 'src/app/services/files.service';
import { MatDialog } from '@angular/material/dialog';
import { VendorEvaluationModalComponent } from '../vendor-evaluation-modal/vendor-evaluation-modal.component';


@Component({
  selector: 'app-report-active-supplier',
  templateUrl: './report-active-supplier.component.html',
  styleUrls: ['./report-active-supplier.component.scss']
})
export class ReportActiveSupplierComponent {
  empltyDataList = [];
  isDataorNot: boolean = true;
  dateForm: any;
  dates = {
    start_date: '',
    end_date: ''
  }
  displayList = false;
  VendorList: any = [];

  searchItem = '';
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];

  lastfinnancialyrDate: any;
  nextfinnancialyrDate: any;

  itemData: any[] = [];
  filteredvendorData: any[] = [];
  searchTerm: string = '';
  totalItems: number = 0;
  currentdate: any;
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order

  constructor(private sharedService: SharedService, private router: Router, private spinner: NgxSpinnerService, private fileService: FilesService, private matdialog: MatDialog) {
    const today = moment();
    this.currentdate = today.format('YYYY-MM-DD');
  }

  ngOnInit(): void {
    this.validation();
    this.getFinancialYear()
  }

  getFinancialYear() {
    const today = moment();
    const curMonth = today.month() + 1;
    const curYear = today.year();

    if (curMonth > 3) {
      this.lastfinnancialyrDate = moment(`${curYear}-04-01`).format('YYYY-MM-DD');
      this.nextfinnancialyrDate = moment(`${curYear + 1}-03-31`).format('YYYY-MM-DD');
    } else {
      this.lastfinnancialyrDate = moment(`${curYear - 1}-04-01`).format('YYYY-MM-DD');
      this.nextfinnancialyrDate = moment(`${curYear}-03-31`).format('YYYY-MM-DD');
    }

    console.log(this.lastfinnancialyrDate, "this.lastfinnancialyrDate");
    console.log(this.nextfinnancialyrDate, "this.nextfinnancialyrDate");

    this.dates.start_date = this.lastfinnancialyrDate;
    this.dates.end_date = this.nextfinnancialyrDate;
  }

  async submitDate() {
    try {
      if (this.dates?.start_date > this.dates?.end_date) {
        Swal.fire({
          title: "warning",
          text: "End date should be later than start date.",
          icon: "warning"
        })
      }
      else {
        this.spinner.show();
        this.displayList = true;
        const results: any = await this.sharedService.getactivevendorbydate(this.dates).pipe(
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
            const splitcreateddate = item.created_date ? moment(item.created_date).format('DD-MM-YYYY') : null;
            const splitmodifieddate = item.modified_date ? moment(item.modified_date).format('DD-MM-YYYY') : null;
            const purchaseMode = item.purchase_mode=='1' ? 'Online' : 'Offline';
            return { ...item, created_date: splitcreateddate, modified_date: splitmodifieddate, purchase_mode: purchaseMode};
          });
          console.log(filteredResults, "filteredResults");
          this.filteredvendorData = filteredResults;
          this.itemData = filteredResults;
          this.count = filteredResults.length;
        }
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
    finally {
      this.spinner.hide();
    }
  }

  applyFilter(): void {
    if (this.searchTerm) {
      this.filteredvendorData = this.itemData.filter((item: any) => {
        // Check if any property matches the search term and is not null or empty
        return Object.keys(item).some(key => {
          if (item[key] !== null && item[key] !== '' && key === 'created_date') {
            return item[key]?.includes(this.searchTerm);

          }
          else if (item[key] !== null && item[key] !== '') {
            // For other properties, check if they include the search term
            return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
          }
          return false; // Ignore null or empty properties
        });
      });
    } else {
      this.filteredvendorData = this.itemData;
    }

    this.totalItems = this.filteredvendorData.length;
    this.count = this.totalItems;
    this.page = 1; // Reset to the first page when filtering occurs 
  }



  ontableDatachange(event: any) {
    this.page = event;
    // this.submitDate();
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
    // this.submitDate();
  }


  sort(columnName: string) {
    if (this.currentSortColumn === columnName) {
      this.isAscending = !this.isAscending; // Toggle sorting order
    } else {
      this.currentSortColumn = columnName; // Update current sort column
      this.isAscending = true; // Set sorting order to ascending for the new column
    }

    // Sort the data based on the current sort column and sorting order
    this.filteredvendorData.sort((a, b) => {
const valueA = a[this.currentSortColumn];
  const valueB = b[this.currentSortColumn];

  // Handle null/undefined cases
  if (valueA == null && valueB == null) return 0;
  if (valueA == null) return -1;
  if (valueB == null) return 1;

  const comparison = valueA.toString().localeCompare(valueB.toString());
  return this.isAscending ? comparison : -comparison;
    });
  }


  exportToexcelfromnode(): any {
    const modifiedItemsDataList = this.filteredvendorData.map((item: any, index: any) => {
      const convertedCategory = item.categories.join(", "); // to change array item like ["Hardware", "Software"](array) --> Hardware, Software(string)

      return {
        ...item,  // Spread the original object properties
        "categories": convertedCategory,
        "S.No.": index + 1  // Add the S.No. field with the appropriate value
      };
    });

    const reportRequest = {
      reportTitle: "Report Active Vendor",
      columns: [
        { header: 'S.No.', key: 'S.No.', width: 10, filterButton: true },
        { header: 'Vendor Name', key: 'supplier_name', width: 25, filterButton: true },
        { header: 'Contact Person', key: 'contact_person', width: 40, filterButton: true },
        { header: 'Rating', key: 'rating', width: 25, filterButton: true },
        { header: 'Phone', key: 'phone', width: 25, filterButton: false },
        { header: 'Mobile', key: 'mobile', width: 25, filterButton: false },
        { header: 'Email', key: 'email', width: 35, filterButton: true },
        { header: 'Category', key: 'categories', width: 40, filterButton: true },
        { header: 'Purchase Mode', key: 'purchase_mode', width: 25, filterButton: true },
        { header: 'Created By', key: 'user_name', width: 25, filterButton: true },
      ],

      data: modifiedItemsDataList, // Data to populate the report
      totalsrow:false,
      filters: [
        { filterBy: (this.dates.start_date && this.dates.end_date) ? 'Purchase Date' : '', startDate: this.dates.start_date || '', endDate: this.dates.end_date || '' }
      ]
    };

    this.fileService.exportToExcel(reportRequest).subscribe(
      (response: Blob) => {
        // Call downloadBlob to trigger the download with the response
        this.fileService.downloadBlob(response, 'report_active_vendors_data.xlsx');
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

  supplierEvaluationData(id: any) {
    console.log(id, "id");
    if (id) {
      //setting height width of the model and sending data to the VendorEvaluationModalComponent...
      this.matdialog.open(VendorEvaluationModalComponent, {
        width: 'auto', height: 'auto',
        data: {
          supplier_id: id
        }
      });
    }
    else{
      console.info('No id found');
    }
  }

  validation() {
    this.dateForm = new FormGroup({
      start_date: new FormControl(''),
      end_date: new FormControl(''),
    })
  }

}
