import { Component } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { AdminService } from 'src/app/services/admin.service';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { query } from '@angular/animations';

@Component({
  selector: 'app-gatepassid-list',
  templateUrl: './gatepassid-list.component.html',
  styleUrls: ['./gatepassid-list.component.scss']
})
export class GatepassidListComponent {

  emptyDataList = [];
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];
  searchTerm: string = '';
  searchItem: string = '';
  gatepassdata: any;
  userRole: any = localStorage.getItem('level');
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  previousUrl: any;
  selectedOption: any = 'option1';
  private isNavigatedBack: boolean = false; // Flag to check navigation source
  sortingorder: any;

  ngOnInit() {
    this.getgatepassdata();

    this.statemanagement();
  }

  constructor(private sharedService: SharedService, private adminService: AdminService, private location: Location
    , private activatedRoute: ActivatedRoute, private router: Router) {
  }

  statemanagement() {
    this.isNavigatedBack = localStorage.getItem('navigated') === 'true';
    localStorage.removeItem('navigated');
    if (this.isNavigatedBack) {
      this.activatedRoute.queryParamMap.subscribe(async (params: any) => {
        console.log(params.params.selectedoption, "params ");
        if (params['selectedoption'] !== '') {
          this.selectedOption = params.params.selectedoption;
          if (this.selectedOption == 'option2') {
            this.showpending();
          }
          else if (this.selectedOption == 'option3') {
            this.showAccepted();
          }
          else if (this.selectedOption == 'option4') {
            this.showrejected();
          }
          else {
            this.showAll();
          }
          console.log(this.selectedOption, "this.selectedOption");
        }


        setTimeout(() => {
        if (params.params['searchTerm'] !== '') {
          this.searchItem = params.params['searchTerm'];
        }
        // Call the filter method to apply the saved state
        if (params.params['page'] && params.params['page'] !== null) {
          this.page = +params.params['page'];
        }
        if (params.params['tableSize'] && params.params['tableSize'] !== null) {
          this.tableSize = +params.params['tableSize'];
        }
        if (params.params['sort'] && params.params['sort'] !== '') {
          console.log(params.params['sort'], "params.params['sort']")
          const [column, sortParams] = params.params['sort'].split('-');
          console.log(params.params['sort'].split('-')[1]);
          const ascending = sortParams === 'asc' ? true : false;
          this.isAscending = ascending;

          // Ensure sortingorder is set properly when restoring state
          this.sortingorder = `${column}-${this.isAscending}`;

          this.sort(column);
          // this.isAscending = params['sort'].split('-')[1];
        }
        }, 800)
      });
    }
    else {
      // Remove all query params when isNavigatedBack is false
      this.router.navigate([], {
        relativeTo: this.activatedRoute, // Navigate relative to the current route
        queryParams: {}, // Empty object to clear the query parameters
        queryParamsHandling: '' // Explicitly state that no query params should be handled
      });
    }

  }

  // getgatepassdata() {
  //   // setTimeout(() => {
      
  //   // }, 1000);
  //   this.sharedService.getgatepassdatafromtblgatepassid().subscribe((results) => {
  //     console.log(results, "results");
  //     this.gatepassdata = results;

  //     if (this.userRole != '1') {
  //       this.gatepassdata = this.gatepassdata.map((e: any) => {
  //         const filtereddate = e.out_date ? moment(e.out_date).format('DD-MM-YYYY') : null;
  //         const filteredapporovaldate = e.gatepass_approval_date ? moment(e.gatepass_approval_date).format('DD-MM-YYYY') : null;
  //         return { ...e, out_date: filtereddate, gatepass_approval_date: filteredapporovaldate }
  //       })
  //     }
  //     else {
  //       this.gatepassdata = this.gatepassdata
  //       .filter((e: any) => e.is_sent == 1)
        
  //       .map((e: any) => {
  //         if (e.out_date) {
  //           const filtereddate = e.out_date ? moment(e.out_date).format('DD-MM-YYYY') : null;
  //           const filteredapporovaldate = e.gatepass_approval_date ? moment(e.gatepass_approval_date).format('DD-MM-YYYY') : null;

  //           return { ...e, out_date: filtereddate, gatepass_approval_date: filteredapporovaldate }
  //         }
  //       })
  //     }


  //     this.count = this.gatepassdata.length;
      
  //     console.log(this.gatepassdata, "results");
  //   })
  // }

    getgatepassdata() {
    setTimeout(() => {
      
    }, 1000);
    this.sharedService.getgatepassdatafromtblgatepassid().subscribe((results:any) => {
      console.log(results, "results");
      this.gatepassdata = results;

      // if (this.userRole != '1') {
      //   this.gatepassdata = this.gatepassdata.map((e: any) => {
      //     const filtereddate = e.out_date ? moment(e.out_date).format('DD-MM-YYYY') : null;
      //     const filteredapporovaldate = e.gatepass_approval_date ? moment(e.gatepass_approval_date).format('DD-MM-YYYY') : null;
      //     return { ...e, out_date: filtereddate, gatepass_approval_date: filteredapporovaldate }
      //   })
      // }
      // else {
        this.gatepassdata = results
        // .filter((e: any) => e.is_sent == 1)
        
        .map((e: any) => {
          if (e.out_date) {
            const filtereddate = e.out_date ? moment(e.out_date).format('DD-MM-YYYY') : null;
            const filteredapporovaldate = e.gatepass_approval_date ? moment(e.gatepass_approval_date).format('DD-MM-YYYY') : null;

            return { ...e, out_date: filtereddate, gatepass_approval_date: filteredapporovaldate }
          }
        })
      // }


      this.count = this.gatepassdata.length;
      
      console.log(this.gatepassdata, "results");
    })
  }

  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }

  sentforapproval(data: any) {
    const gatepassId = {
      gatepass_id: data.gatepass_id,
      gatepass_approval_date: moment().format('YYYY-MM-DD')
    };

    this.adminService.sendgatepassforapproval(gatepassId).subscribe({
      next: (results: any) => {
        console.log(results);
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Gatepass sent for approval!",
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          this.ngOnInit();
        })


      },
      error: (error) => {
        console.error(error);
      }
    })
  }

  onaccept(data: any) {
    const gatepassId = {
      gatepass_id: data.gatepass_id,
      gatepass_approval_date: moment().format('YYYY-MM-DD')
    };
    this.adminService.gatepassapproval(gatepassId).subscribe({
      next: (results: any) => {
        console.log(results);
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Gatepass approved!",
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          this.ngOnInit();
        })
      },
      error: (error) => {
        console.error(error);
      }

    })
  }

  onreject(data: any) {
    const gatepassId = {
      gatepass_id: data.gatepass_id,
      gatepass_approval_date: moment().format('YYYY-MM-DD')

    };
    this.adminService.gatepassrejection(gatepassId).subscribe({
      next: (results: any) => {
        console.log(results);
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Gatepass rejected!",
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          this.ngOnInit();
        })
      },
      error: (error) => {
        console.error(error);
      }

    })
  };

  showAll() {
    this.sharedService.getgatepassdatafromtblgatepassid().subscribe((results: any) => {
      this.gatepassdata = results;
      this.gatepassdata = this.gatepassdata.map((e: any) => {
        const filtereddate = e.out_date ? moment(e.out_date).format('DD-MM-YYYY') : null;
        const filteredapporovaldate = e.gatepass_approval_date ? moment(e.gatepass_approval_date).format('DD-MM-YYYY') : null;
        return { ...e, out_date: filtereddate, gatepass_approval_date: filteredapporovaldate }
      })
    });
    console.log(this.gatepassdata);
  }

  showAccepted() {
    this.sharedService.getgatepassdatafromtblgatepassid().subscribe((results: any) => {
      this.gatepassdata = results;
      this.gatepassdata = this.gatepassdata.filter((e: any) => {
        return e.is_sent == 2;
      })
        .map((e: any) => {
          const filtereddate = e.out_date ? moment(e.out_date).format('DD-MM-YYYY') : null;
          const filteredapporovaldate = e.gatepass_approval_date ? moment(e.gatepass_approval_date).format('DD-MM-YYYY') : null;
          return { ...e, out_date: filtereddate, gatepass_approval_date: filteredapporovaldate }
        })
    });
  }

  showrejected() {
    this.sharedService.getgatepassdatafromtblgatepassid().subscribe((results: any) => {
      this.gatepassdata = results;
      this.gatepassdata = this.gatepassdata.filter((e: any) => {
        return e.is_sent == 3;
      })
        .map((e: any) => {
          const filtereddate = e.out_date ? moment(e.out_date).format('DD-MM-YYYY') : null;
          const filteredapporovaldate = e.gatepass_approval_date ? moment(e.gatepass_approval_date).format('DD-MM-YYYY') : null;
          return { ...e, out_date: filtereddate, gatepass_approval_date: filteredapporovaldate }
        })
    });
    console.log(this.gatepassdata);
  }

  showpending() {
    this.sharedService.getgatepassdatafromtblgatepassid().subscribe((results: any) => {
      this.gatepassdata = results;
      this.gatepassdata = this.gatepassdata.filter((e: any) => {
        return (e.is_sent == 1 || e.is_sent == 0);
      })
        .map((e: any) => {
          const filtereddate = e.out_date ? moment(e.out_date).format('DD-MM-YYYY') : null;
          const filteredapporovaldate = e.gatepass_approval_date ? moment(e.gatepass_approval_date).format('DD-MM-YYYY') : null;
          return { ...e, out_date: filtereddate, gatepass_approval_date: filteredapporovaldate }
        })
    });
    console.log(this.gatepassdata);
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

    this.gatepassdata.sort((a: any, b: any) => {
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

    this.page = 1;
  }


  navigateToNewRoute(items: any) {

    const queryParams: any = {};
    // Conditionally add parameters to queryParams based on their values
    if (this.searchItem) queryParams.searchTerm = this.searchItem;
    if (this.page) queryParams.page = this.page;
    if (this.tableSize) queryParams.tableSize = this.tableSize;
    if (this.selectedOption) queryParams.selectedoption = this.selectedOption;
    if (this.sortingorder) queryParams.sort = this.sortingorder;


    console.log(queryParams, "queryParams");
    this.previousUrl = this.location.path().split('?')[0];

    // Store the current URL with query params
    localStorage.setItem('backUrl', this.previousUrl + this.buildQueryString(queryParams));

    console.log(this.previousUrl + this.buildQueryString(queryParams), "this.previousUrl");
    localStorage.setItem('navigated', 'true'); // Set the flag for navigation
    this.router.navigate(['/user/gate-pass-list', items.gatepass_id], { queryParams });
  }

  buildQueryString(params: any): string {
    return '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&');
  }

}
