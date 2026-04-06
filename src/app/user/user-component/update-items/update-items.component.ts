import { Component, ViewChild, OnInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { AdminService } from 'src/app/services/admin.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { map } from 'rxjs/operators';
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-update-items',
  templateUrl: './update-items.component.html',
  styleUrls: ['./update-items.component.scss']
})
export class UpdateItemsComponent {
  isDataorNot: boolean = true;
  itemDescription = {
    item_id: 0,
    date_: '',
    description: '',
    warrantyend_date: ''
  }

  itemData: any[] = [];
  filteredItemData: any[] = [];
  searchTerm: string = '';
  totalItems: number = 0;
  empltyDataList = [];
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];
  isEditing = false;
  // Initial descriptions for resetting when toggling back from editing mode
  initialDescriptions: { [key: number]: string } = {};
  @ViewChild('description') descriptionInput!: ElementRef;
  userRole = localStorage.getItem('level');
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  sortingorder: any;

  constructor(private sharedService: SharedService, private adminService: AdminService, private cdr: ChangeDetectorRef, private router: Router, private ele: ElementRef, private spinner: NgxSpinnerService) {
    const currentDate = new Date();
    const expectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate() + 1);

    this.itemDescription.date_ = moment(currentDate).format('YYYY-MM-DD')
  }

  ngOnInit() {
    // this.ele.nativeElement.querySelector('#loader').style.visibility = 'visible';
    this.itemsDataList();
  }

  async itemsDataList() {
    this.spinner.show();
    try {
      const results: any = await this.sharedService.getitemsData().pipe(
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
        const getPriority = (purchase_id: string) => {
          if (!purchase_id) return 1;
          if (purchase_id.startsWith('NA')) return 3;
          if (purchase_id.startsWith('BRND')) return 2;
          return 1;
        };
        const filteredResults = results.map((item: any) => {

          // if (item.date_ && item.warrantyend_date && item.created_date) {
          const splitdate = item.date_ ? moment(item.date_).format('DD-MM-YYYY') : null;
          const splitwarrantyenddate = item.warrantyend_date ? moment(item.warrantyend_date).format('YYYY-MM-DD') : null;
          const splitcreateddate = item.created_date ? moment(item.created_date).format('DD-MM-YYYY') : null;

          const splitinvoicedate = item.invoice_date ? moment(item.invoice_date).format('DD-MM-YYYY') : moment(item.po_creation_date).format('DD-MM-YYYY');
          const splitpocreationdate = item.po_creation_date ? moment(item.po_creation_date).format('DD-MM-YYYY') : null;

          return { ...item, date_: splitdate, warrantyend_date: splitwarrantyenddate, created_date: splitcreateddate, invoice_date: splitinvoicedate, po_creation_date: splitpocreationdate };
          // }
          // return item;
        }).sort((a: any, b: any) => {

          const getPriority = (purchase_id: string) => {
            if (!purchase_id) return 0;

            if (purchase_id.startsWith('NA')) return 3;      // Last
            if (purchase_id.startsWith('BRND')) return 2;    // Second Last
            return 1;                                        // First (normal IDs)
          };

          return getPriority(a.purchase_id) - getPriority(b.purchase_id);
        });

        this.filteredItemData = filteredResults;
        this.itemData = filteredResults;
        this.count = filteredResults.length;
        console.log(this.filteredItemData, "fitlereddata");
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


  applyFilter() {
    console.log(this.filteredItemData, "applyfilter");
    if (this.searchTerm) {
      this.filteredItemData = this.itemData.filter((item: any) => {
        // Check if any property matches the search term and is not null or empty
        return Object.keys(item).some(key => {
          if (item[key] !== null && item[key] !== '' && (key === 'invoice_date' || key === 'warrantyend_date' )) {
            // Check if the property is 'date_' or 'warrantyend_date' and includes the search term
            return item[key].includes(this.searchTerm);
          } else if (item[key] !== null && item[key] !== '') {
            // For other properties, check if they include the search term
            return item[key].toString().toLowerCase().includes(this.searchTerm.toLowerCase());
          }
          return false; // Ignore null or empty properties
        });
      });
    } else {
      this.filteredItemData = this.itemData;
    }

    this.count = this.filteredItemData.length;
  }


  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }

  updateItem(id: any, description: string, date: string) {
    this.itemDescription.item_id = id;
    this.itemDescription.description = description;
    this.itemDescription.warrantyend_date = date;
    this.adminService.updateItem(this.itemDescription).subscribe(
      {
        next: (result: any) => {
          Swal.fire({
            title: 'Success!',
            text: 'Item updated successfully!',
            icon: 'success',
          }).then(() => {
            this.ngOnInit();
          })

        }, error: (error) => {
          // console.log('error')
          if (error.status == 403) {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Token expired. Please login..',
              footer: '<a href="../login">Login..</a>'
            }).then(() => {
              this.router.navigate(['../login']);
            })
          }
          else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Internal Server Error...',
              footer: '<a href="../login">Please Login..</a>'
            }).then(() => {
              this.router.navigate(['../login']);
            })
          }
        }
      })
  }

  toggleExpand(item: any) {
    console.log(item, "toggleExpand")
    // Close other expanded items
    this.filteredItemData.forEach((otherItem: any) => {
      if (otherItem !== item) {
        // item.isEditing = !item.isEditing;
        otherItem.isExpanded = false;
        otherItem.isEditing = false;
      }
    });

    item.isExpanded = !item.isExpanded;
    // If the item is expanded, close editing mode
    if (item.isExpanded) {
      item.isEditing = false;
    }
  }

  startEditing(item: any): void {
    // for toggling expansion for other item or when clicked on other description edit button
    this.filteredItemData.forEach((otherItem: any) => {
      if (otherItem !== item) {
        otherItem.isEditing = false;
      }
    });

    if (item.isEditing) {
      // If switching back from editing mode, reset the description
      item.description = this.initialDescriptions[item.item_id];
    } else {
      // Store the initial description before editing
      this.initialDescriptions[item.item_id] = item.description;
      // Focus on the textarea when entering editing mode
      setTimeout(() => {
        this.descriptionInput.nativeElement.focus();
      });
    }
    // Toggle editing mode
    item.isEditing = !item.isEditing;
  }

  updatewarrnatyEndDate(date: string) {
    this.itemDescription.warrantyend_date = date;
  }
  ontableDatachange(event: any) {
    this.page = event;
    // this.getSystemData();
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
    // this.getSystemData();

  }

  // sort(columnName: string) {
  //   if (this.currentSortColumn === columnName) {
  //     this.isAscending = !this.isAscending; // Toggle sorting order
  //   } else {
  //     this.currentSortColumn = columnName; // Update current sort column
  //     this.isAscending = true; // Set sorting order to ascending for the new column
  //   }

  //   this.filteredItemData.sort((a: any, b: any) => {
  //     let comparison = 0;
  //     const valueA = a[columnName];
  //     const valueB = b[columnName];

  //     // Handle null or undefined values
  //     if (valueA === null || valueA === undefined) {
  //       comparison = valueB === null || valueB === undefined ? 0 : -1;
  //     } else if (valueB === null || valueB === undefined) {
  //       comparison = 1;
  //     } else {
  //       if (this.isDate(valueA) && this.isDate(valueB)) {
  //         const dateA = moment(valueA);
  //         const dateB = moment(valueB);
  //         comparison = dateA.diff(dateB);
  //       } else if (this.isNumber(valueA) && this.isNumber(valueB)) {
  //         comparison = valueA - valueB;
  //       } else {
  //         comparison = valueA.toString().localeCompare(valueB.toString());
  //       }
  //     }

  //     return this.isAscending ? comparison : -comparison;
  //   });
  // }

  // isDate(value: any): boolean {
  //   return moment(value, moment.ISO_8601, true).isValid();
  // }

  // isNumber(value: any): boolean {
  //   return !isNaN(value);
  // }

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

    this.filteredItemData.sort((a: any, b: any) => {
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

  // changeWarranty(item: any) {
  //   // this.startEditing(item);

  // }
}
