import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { CheckService } from 'src/app/services/check.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent {
  isDataorNot:boolean = true;
  searchItem = '';
  //for addition purpose
  locationData = {
    location_name: '',
    modified_by: localStorage.getItem('login_id'),
    created_by: localStorage.getItem('login_id')
  }

  //for updation purpose
  locationData2 = {
    location_name: '',
    modified_by: localStorage.getItem('login_id'),
    location_id: 0
  }

  //for deletion purpose
  locationId = {
    location_id: 0
  }

  locationForm: any;
  locationdata: any;
  filteredlocationdata: any;
  itemData: any[] = [];
  displayaddLocation = false;          // for add button
  displayLocationlist = true;         // for update button
  toggleAddbtn = true;
  toggleListBtn = false;
  addLocationbtn = true;
  updateLocationbtn = false;

  addlocationserviceResponse: any;
  updatelocationserviceResponse: any;
  emptyDataList=[];
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];
  userRole = localStorage.getItem('level');
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  sortingorder:any;

  constructor(private adminService: AdminService, private checkService: CheckService, private router: Router, private spinner: NgxSpinnerService) {

  }

  ngOnInit(): void {
    this.validation();
    this.getLocationData();
  }

  async getLocationData() {
    this.spinner.show();
    try{
      const results:any = await this.checkService.getLocationdatabystatus().pipe(
        retry(3), // Retry the request up to 3 times
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching accepted requests:', error);
          return of([]); // Return an empty array if an error occurs
        })
      ).toPromise();

      if(results?.length==0){
        this.isDataorNot = false;
      }
      else{
        this.isDataorNot = true;
        const filteredResults =  results.map((item: any) => {

            const splitcreateddate = item.created_date?moment(item.created_date).format('DD-MM-YYYY'):null;
            return { ...item, created_date: splitcreateddate };

        });

        this.filteredlocationdata = filteredResults;
        this.count = filteredResults.length;
         this.itemData = filteredResults;
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

  updatelocation(data: any) {
    this.addLocationbtn = false;
    this.updateLocationbtn = true;
    this.displayLocationlist = false;
    this.displayaddLocation = true;
    this.toggleListBtn = true;
    this.toggleAddbtn = false;

    Swal.fire({
      title: 'Loading...',
      didOpen: () => {
        Swal.showLoading();
        setTimeout(() => {
          this.locationData.location_name = data.location_name;
          this.locationId.location_id = data.location_id;
          Swal.close();
        }, 500);
      }
    });

  }

  removelocation(id: any) {
    this.locationId.location_id = id;

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
      this.checkService.deactivateLocationStatusbyid(this.locationId).subscribe(
        {
          next: (results: any) => {
            swalWithBootstrapButtons.fire(
              'Deleted!',
              'Location deleted successfully!',
              'success'
            ).then(()=>{
              this.ngOnInit();
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
              }).then(()=>{
                this.router.navigate(['../login']);
              })
            }
            else {
              Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: 'Internal server error.Please try after some time!',
                footer:'<a href="../login">Login</a>'
              }).then(()=>{
                location.reload();
              })
            }
          }
        })

    } else if (
      /* Read more about handling dismissals below */
      result.dismiss === Swal.DismissReason.cancel
    ) {
      swalWithBootstrapButtons.fire(
        'Cancelled',
        'Location is not deleted',
        'error'
      ).then(()=>{
        this.ngOnInit();
      })
    }
  })
}

  addLocationFunction() {
    if(this.locationForm.invalid){
      this.locationForm.controls['location_name'].markAsTouched();
    }
    else{

    this.adminService.addLocationservice(this.locationData).subscribe(
      {
        next: (results) => {
          this.addlocationserviceResponse = JSON.parse(JSON.stringify(results)).message;

          if (this.addlocationserviceResponse !== 'true') {
            Swal.fire({
              title: 'Success!',
              text: 'Location added successfully!',
              icon: 'success',
            }).then(()=>{
              this.locationForm.get('location_name')?.reset();
              this.ngOnInit(); 
            })           
          }
          else {
            Swal.fire({
              icon: 'warning',
              title: 'Warning',
              text: 'This location is already present!',
            }).then(()=>{
              location.reload();
            })

          }
        },
        error: (error) => {
          if (error.status == 403) {            
            Swal.fire({
              icon: 'error',
              title: 'Oops!',
              text: 'Token expired.',
              footer: '<a href="../login">Please login again!</a>'
            }).then(()=>{
              this.router.navigate(['../login']);
            })
          }
          else {
            Swal.fire({
              icon: 'error',
              title: 'Oops!',
              text: 'Internal server error.Please try after some time!',
              footer:'<a href="../login">Login</a>'
            }).then(()=>{
              location.reload();
            })
          }
        }
      })
    }

  }

  updateLocationfunc() {
    if(this.locationForm.invalid){
      this.locationForm.controls['location_name'].markAsTouched();
    }
    else{
    this.locationData2.location_name = this.locationData.location_name;
    this.locationData2.location_id = this.locationId.location_id;

    this.adminService.updatelocationservice(this.locationData2).subscribe(
      {
        next: (results: any) => {
          this.updatelocationserviceResponse = JSON.parse(JSON.stringify(results)).message;

          if (this.updatelocationserviceResponse !== 'true') {
            Swal.fire({
              title: 'Success!',
              text: 'Location updated successfully!',
              icon: 'success',
            }).then((result) => {
              if (result.isConfirmed) {
                this.locationForm.get('location_name')?.reset();
                location.reload();       
              }
            });

          }
          else {
            Swal.fire({
              icon: 'warning',
              title: 'Warning',
              text: 'No changes detected!',
            })
            // .then(()=>{
            //   location.reload();   
            // })
          }

        },
        error: (error) => {
          // console.log('error')
          if (error.status == 403) {            
            Swal.fire({
              icon: 'error',
              title: 'Oops!',
              text: 'Token expired.',
              footer: '<a href="../login">Please login again!</a>'
            }).then(()=>{
              this.router.navigate(['../login']);
            })
          }
          else {
            Swal.fire({
              icon: 'error',
              title: 'Oops!',
              text: 'Internal server error.Please try after some time!',
              footer:'<a href="../login">Login</a>'
            }).then(()=>{
              location.reload();
            })
          }
        }
      })
    }
  }

  toggleActionAdd() {
    this.toggleListBtn = true;
    this.toggleAddbtn = false;
    this.displayLocationlist = false;
    this.displayaddLocation = true;
    this.locationForm.reset();
  }

  toggleActionUpdate() {
    this.toggleListBtn = false;
    this.toggleAddbtn = true;
    this.displayaddLocation = false;
    this.displayLocationlist = true;
    this.addLocationbtn = true;
    this.updateLocationbtn = false;
    this.locationForm.reset();
  }

  NoSpaceallowedatstart(event:any){
    if(event.target.selectionStart === 0 && event.code ==="Space")
    {
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
  }

  // sort(columnName: string) {
  //   if (this.currentSortColumn === columnName) {
  //     this.isAscending = !this.isAscending; // Toggle sorting order
  //   } else {
  //     this.currentSortColumn = columnName; // Update current sort column
  //     this.isAscending = true; // Set sorting order to ascending for the new column
  //   }
  
  //   this.filteredlocationdata.sort((a: any, b: any) => {
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

    this.filteredlocationdata.sort((a: any, b: any) => {
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


  validation() {
    this.locationForm = new FormGroup({
      location_name: new FormControl('', [Validators.required])
    })
  }
}
