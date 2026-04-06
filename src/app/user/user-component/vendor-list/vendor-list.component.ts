import { Component, HostListener } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { AdminService } from 'src/app/services/admin.service';
import { MatDialog } from '@angular/material/dialog';
import { VendorEvaluationModalComponent } from '../vendor-evaluation-modal/vendor-evaluation-modal.component';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { map } from 'rxjs/operators';
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';
import { catchError, retry } from 'rxjs/operators';
import { firstValueFrom, of } from 'rxjs';
import { FilesService } from 'src/app/services/files.service';

@Component({
  selector: 'app-vendor-list',
  templateUrl: './vendor-list.component.html',
  styleUrls: ['./vendor-list.component.scss']
})
export class VendorListComponent {
  emptyDataList: any = [];
  isDataorNot: boolean = true;
  supplierdata: any = [];
  supplierid: any = {
    supplier_id: 0
  };
  VendordatabyDate = {
    start_date: '',
    end_date: ''
  };

  searchItem = '';
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];
  itemsData: any[] = [];
  filteredvendorData: any[] = [];
  searchTerm: string = '';
  totalItems: number = 0;
  filteredBydate = false;
  currentdate: any;
  userRole = localStorage.getItem('level');
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  isRotating: boolean = false;
  previousUrl: any;
  private isNavigatedBack: boolean = false; // Flag to check navigation source
  sortingorder: any;
  itemsperPage: any = 20;
  mode:any='';

  constructor(private sharedService: SharedService, private adminService: AdminService,
    private matdialog: MatDialog, private router: Router, private spinner: NgxSpinnerService,
    private location: Location, private activatedRoute: ActivatedRoute, private fileService: FilesService) {
    const today = moment();
    this.currentdate = today.format('YYYY-MM-DD');
  }


  ngOnInit(): void {
    this.statemanagement();
    this.supplierdatalist();
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
          this.VendordatabyDate.start_date = params['from'];
          this.VendordatabyDate.end_date = params['to'];
        }

        if (params['itemsperPage']) {
          this.itemsperPage = params['itemsperPage'];
        }

        if (params['mode']) {
          this.mode = params['mode'];
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

            // this.isAscending = params['sort'].split('-')[1];
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

  async supplierdatalist() {
    this.spinner.show();
    try {
      const results: any = await this.sharedService.getsupplierdata().pipe(
        retry(3), // Retry the request up to 3 times
        // catchError((error: HttpErrorResponse) => {
        //   console.error('Error fetching accepted requests:', error);
        //   return of([]); // Return an empty array if an error occurs
        // })
      ).toPromise();

      if (results?.length === 0) {
        this.isDataorNot = false;
      } else {
        this.isDataorNot = true;

        const filteredResults = results
          .filter((item: any) => item.status != '0')
          .map((item: any) => {
            const splitcreateddate = item.created_date ? moment(item.created_date).format('DD-MM-YYYY') : null;
            return { ...item, created_date: splitcreateddate };
          });
        console.log(filteredResults, "filteredData")

        this.filteredvendorData = filteredResults;
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
    finally {
      this.spinner.hide();

    }
  }


  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }


  async filterData(): Promise<void> {
    // Initialize itemsData if not already initialized
    if (!this.itemsData) {
      // Initialize with appropriate default value or fetch data
      this.itemsData = [];
    }

   
    // Start with the original data or the previously filtered data
    let filteredData: any[] = this.itemsData;


  // 🔹 Filter by mode
  if (this.mode !== '' && this.mode !== undefined && this.mode !== null) {
    filteredData = filteredData.filter(item => item.category?.toString() === this.mode.toString());
  }

    // Filter by search term
    if (this.searchTerm) {
      filteredData = filteredData.filter((item: any) => {
        return Object.keys(item).some(key => {
          if (item[key] !== null && item[key] !== '' && key === 'created_date') {
            return item[key]?.includes(this.searchTerm);
          } else if (item[key] !== null && item[key] !== '') {
            return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
          }
          return false;
        });
      });
    }

    // Filter by date range for VendordatabyDate
    if (this.VendordatabyDate?.start_date && this.VendordatabyDate?.end_date) {
      if (this.VendordatabyDate.start_date <= this.VendordatabyDate.end_date) {

        filteredData = filteredData.filter((item: any) => {
          console.log(item?.created_date)
          const filteredcreateddate = moment(item?.created_date, 'DD-MM-YYYY').format('YYYY-MM-DD');
          if (filteredcreateddate) {
            return filteredcreateddate >= this.VendordatabyDate.start_date &&
              filteredcreateddate <= this.VendordatabyDate.end_date;
          }
          return false;
        });
      } else {
        Swal.fire({
          title: 'Warning',
          text: 'End date should be later than start date.',
          icon: 'warning'
        });
        // Optionally clear filtered data on date range error
        filteredData = [];
      }
    }

    console.log(filteredData, "filteredData");
    // Update filtered data and totalItems
    this.filteredvendorData = filteredData;
    this.totalItems = this.filteredvendorData.length;
    this.count = this.totalItems;
    this.page = 1; // Reset to the first page when filtering occurs
  }


  refreshfilter() {
    this.isRotating = true;
    this.supplierdatalist().then(() => {
      if (this.VendordatabyDate?.start_date || this.VendordatabyDate?.end_date) {
        this.VendordatabyDate.start_date = '';
        this.VendordatabyDate.end_date = '';
      }
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
            if (item[key] !== null && item[key] !== '' && key === 'created_date') {
              return item[key]?.includes(this.searchTerm);
            } else if (item[key] !== null && item[key] !== '') {
              return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
            }
            return false;
          });
        });
      }
      // Update filtered data and totalItems
      this.filteredvendorData = filteredData;
      console.log(this.filteredvendorData, "vendor data");
      this.totalItems = this.filteredvendorData.length;
      this.mode='';
      this.page = 1; // Reset to the first page when filtering occurs
      setTimeout(() => {
        this.isRotating = false;
      }, 500);
    })
  }


  // Function to clear search term and maintain date filter
  clearSearch(): void {
    this.searchTerm = ''; // Clear the search term
    this.filterData(); // Reapply the filter with the cleared search term
  }


  deleteSupplier(id: any) {
    this.supplierid.supplier_id = id;
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success ml-2 text-light',
        cancelButton: 'btn btn-danger text-light'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {

        this.adminService.deletesupplierdata(this.supplierid).subscribe(
          {
            next: (results: any) => {
              swalWithBootstrapButtons.fire(
                'Deleted!',
                'Vendor deleted successfully!',
                'success'
              ).then(() => {
                this.supplierdatalist();
              })
            },
            error: (error) => {
              // console.log('error')
              if (error.status == 403) {
                Swal.fire({
                  icon: 'error',
                  title: 'Oops!',
                  text: 'Token expired.',
                  footer: '<a href="../login">Please login again!</a>'
                }).then(() => {
                  this.router.navigate(['../login']);
                })
              }
              else {
                Swal.fire({
                  icon: 'error',
                  title: 'Oops!',
                  text: 'Internal server error.Please try after some time!',
                  footer: '<a href="../login">Login</a>'
                }).then(() => {
                  location.reload();
                })
              }
            }
          })

      }
      else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Vendor is not deleted!',
          'error'
        ).then(() => {
          this.ngOnInit();
        })
      }
    })

  }

  supplierEvaluationData(id: any) {

    //setting height width of the model and sending data to the VendorEvaluationModalComponent...
    this.matdialog.open(VendorEvaluationModalComponent, {
      width: 'auto', height: 'auto',
      data: {
        supplier_id: id
      }
    });

  }

  toggleExpand(item: any) {
    item.isExpanded = !item.isExpanded;

  }

  exportToexcelfromnode(): any {
    const modifiedItemsDataList = this.filteredvendorData.map((item: any, index: any) => {
      let statusLable = '';
      switch(item.status){
        case "1":
          statusLable ='To Send for Approval';
          break;
        
        case "2":
          statusLable ='Sent for Approval';
          break;
        
        case "3":
          statusLable ='Approved';
          break;
      }

      return {
        ...item,  // Spread the original object properties
        "S.No.": index + 1, // Add the S.No. field with the appropriate value
        "status": statusLable,
        "category": item.category == '1' ? 'Online' :'Offline'
      };
    });

    const reportRequest = {
      reportTitle: "Vendors' List",
      columns: [
        { header: 'S.No.', key: 'S.No.', width: 10, filterButton: true },
        { header: 'Vendor Name', key: 'supplier_name', width: 25, filterButton: true },
        { header: 'Contact Person', key: 'contact_person', filterButton: true },
        { header: 'Phone', key: 'phone', width: 25, filterButton: false },
        { header: 'Mobile', key: 'mobile', width: 25, filterButton: false },
        { header: 'Email', key: 'email', width: 25, filterButton: true },
        { header: 'Created Date', key: 'created_date', width: 15, filterButton: false },
        { header: 'Rating', key: 'rating', width: 15, filterButton: true },
        { header: 'Pan No.', key: 'pan_no', width: 20, filterButton: false },
        { header: 'GSTIN', key: 'gstn', width: 20, filterButton: false },
        { header: 'Purchase Mode', key: 'category', width: 25, filterButton: true },
        { header: 'Action/Status', key: 'status', width: 25, filterButton: true },
      ],

      data: modifiedItemsDataList, // Data to populate the report
      totalsrow: false,
      filters: [
        { filterBy: (this.VendordatabyDate.start_date && this.VendordatabyDate.end_date) ? 'Created Date' : '', startDate: this.VendordatabyDate.start_date || '', endDate: this.VendordatabyDate.end_date || '' }
      ]
    };

    this.fileService.exportToExcel(reportRequest).subscribe(
      (response: Blob) => {
        // Call downloadBlob to trigger the download with the response
        this.fileService.downloadBlob(response, 'report_vendor_list.xlsx');
      },
      (error) => {
        console.error('Error exporting to Excel', error);
      }
    );
  }


  navigateToNewRoute(items: any) {
    const queryParams: any = {};
    if (this.searchTerm) queryParams.searchTerm = this.searchTerm;
    if (this.page) queryParams.page = this.page;
    if (this.tableSize) queryParams.tableSize = this.tableSize;
    if (this.sortingorder) queryParams.sort = this.sortingorder;
    if (this.itemsperPage) queryParams.itemsperPage = this.itemsperPage;
    if (this.mode) queryParams.mode = this.mode;
    if (this.VendordatabyDate) {
      if (this.VendordatabyDate.start_date) queryParams.from = this.VendordatabyDate.start_date;
      if (this.VendordatabyDate.end_date) queryParams.to = this.VendordatabyDate.end_date;
    }

    if (this.sortingorder) queryParams.sort = this.sortingorder;

    this.previousUrl = this.location.path().split('?')[0];

    // Store the current URL with query params
    localStorage.setItem('backUrl', this.previousUrl + this.buildQueryString(queryParams));
    localStorage.setItem('navigated', 'true'); // Set the flag for navigation
    this.router.navigate(['user/update-vendor', items.supplier_id], { queryParams });
  }

  buildQueryString(params: any): string {
    return '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&');
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

    this.filteredvendorData.sort((a: any, b: any) => {
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
    // this.supplierdatalist();
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
    // this.supplierdatalist();
  }

  async approveSupplier(data: any, status: string) {
    const relatedObj = {
      ...data,
      status: status
    }

    const result = await firstValueFrom(this.adminService.approveorrejectVendor(relatedObj));
    if (result) {
      Swal.fire({
        position: "center",
        icon: "success",
        title: `Vendor ${status == '3' ? 'approved' : 'rejected'} successfully!`,
        showConfirmButton: false,
        timer: 1500
      })
        .then(() => {
          this.supplierdatalist();
        })
    }
  }

  async mailSendforApproval(data: any) {
    try {
      const result: any = await firstValueFrom(this.adminService.sendvendorApprovalmail(data));
      if (result && result.message) {
        await Swal.fire({
          position: 'center',
          icon: 'success',
          title: `Vendor sent for approval!`,
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          this.ngOnInit();
        })
      }
    }
    catch (err) {
      console.log(err, "err");
    }
  }


}





