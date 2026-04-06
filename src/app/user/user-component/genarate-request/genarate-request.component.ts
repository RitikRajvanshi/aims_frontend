import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-genarate-request',
  templateUrl: './genarate-request.component.html',
  styleUrls: ['./genarate-request.component.scss']
})
export class GenarateRequestComponent {
  generateRequestForm: any;
  validationMessage = false;

  generaterequestData = {
    request_item: null,
    quantity: 1,
    remark: '',
    created_by: localStorage.getItem('login_id'),
    created_by_username:localStorage.getItem('name'),
    estimated_price: 1,
  }

  searchText = '';
  productdata: any;
  productdataArray: any = [];
  request: any;

  constructor(public sharedServices: SharedService, 
    private adminService: AdminService, private router: Router, 
    private spinner: NgxSpinnerService) {

  }

  ngOnInit(): void {

    this.getProductData();
    this.validation();
  }


  async getProductData() {
    this.spinner.show();
    try{
      const sortByProperty = (arr: any[], propertyName: string) => {
        return arr.sort((a, b) => {
          const itemA = a[propertyName].toUpperCase();
          const itemB = b[propertyName].toUpperCase();
          return itemA.localeCompare(itemB);
        });
      };

      const results:any = await this.sharedServices.getProductdata().pipe(
        retry(3), // Retry the request up to 3 times
        // catchError((error: HttpErrorResponse) => {
        //   console.error('Error fetching accepted requests:', error);
        //   return of([]); // Return an empty array if an error occurs
        // })
      ).toPromise();

      this.productdata = sortByProperty(JSON.parse(JSON.stringify(results)), 'product_name');
      for (let item of this.productdata) {
        //save the data in array
        this.productdataArray.push(item.product_name);
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

  addrequest() {

    if (this.generateRequestForm.invalid) {
      this.generateRequestForm.markAllAsTouched();
    }

    else {
      this.validationMessage = false;

      console.log(this.generaterequestData, "this.generaterequestData");
      this.adminService.generateReq(this.generaterequestData).subscribe(
        {
          next: (results: any) => {
            Swal.fire({
              title: 'Success!',
              text: 'Request generated successfully!',
              icon: 'success',
            }).then(()=>{
              this.ngOnInit();
              this.generateRequestForm.reset({
                request_item: null,
                remark:'',
                quantity:0,
                estimated_price:0
              });

            })
           
          },
          error: (error) => {

            if (error.status == 403) {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Token expired....',
                footer: '<a href="../login">Please Login..</a>'
              }).then(()=>{
                this.router.navigate(['../login']);
              })
            }
            else {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Internal Server Error...',
                footer: '<a href="../login">Please Login..</a>'
              }).then(()=>{
                this.router.navigate(['../login']);
              })
            }
          }
        })
    }

  }


  selectRequest(data: any) {
    this.request = data?.product_name;
    this.generaterequestData.request_item = data?.product_name;
  }

  validation() {
    this.generateRequestForm = new FormGroup({
      request_item: new FormControl(null, [Validators.required]),
      remark: new FormControl('', [Validators.required]),
      quantity: new FormControl(1, [Validators.pattern(/^(?=.*[1-9])[0-9]*[.,]?[0-9]{1,9}$/)]),
      estimated_price: new FormControl(1, [Validators.required,Validators.pattern(/^(?=.*[1-9])[0-9]*[.,]?[0-9]{1,9}$/)]),
    })
  }
}
