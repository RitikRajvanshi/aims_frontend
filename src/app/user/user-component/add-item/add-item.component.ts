import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
import { CheckService } from 'src/app/services/check.service';
import { AdminService } from 'src/app/services/admin.service';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';


@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent {
  additemForm: any;
  //item 
  itemData = {
    purchase_id: 'NA',
    item_id: 0,
    item_code: '',
    item_name: '',
    description: '',
    category_id: 0,
    location_id: 1,                         //warehouse
    invoice_no: '',
    warrantyend_Date: '',
    item_status: '1',
    created_by: localStorage.getItem('login_id'),
    complain_id: 1
  }

  descriptionvalue: string = '';

  productData: any;
  locationData: any[] = [];
  itemDataarray: any[] = [];



  ngOnInit() {
    this.validation();
    this.getalldataatonce();

  }

  constructor(private sharedServices: SharedService, private checkServices: CheckService, private adminService: AdminService, private router: Router, private spinner: NgxSpinnerService) {
    const moment = require('moment');
    const currentDate = moment();
    const oneYearLater = currentDate.add(1, 'year');
    const formattedDate = oneYearLater.format('YYYY-MM-DD');
    console.log(formattedDate);
    this.itemData.warrantyend_Date = formattedDate;
  }


  async getalldataatonce() {
    try {
      this.spinner.show();
      // Reusable sorting function
      const sortByProperty = (arr: any[], propertyName: string) => {
        return arr.sort((a, b) => {
          const itemA = a[propertyName].toUpperCase();
          const itemB = b[propertyName].toUpperCase();
          return itemA.localeCompare(itemB);
        });
      };

      const [productdata, locationdata]: any = await forkJoin([
        this.sharedServices.getproductdatajoinbystatus().pipe(
          retry(3), // Retry the request up to 3 times
          catchError((error: HttpErrorResponse) => {
            console.error('Error fetching accepted requests:', error);
            return of([]); // Return an empty array if an error occurs
          })
        ),
        this.checkServices.getLocationdatabystatus().pipe(
          retry(3), // Retry the request up to 3 times
          catchError((error: HttpErrorResponse) => {
            console.error('Error fetching accepted requests:', error);
            return of([]); // Return an empty array if an error occurs
          })
        )
      ]).toPromise();

      this.productData = sortByProperty(JSON.parse(JSON.stringify(productdata)), 'product_name');
      console.log(productdata, "productdata");
      this.locationData = sortByProperty(JSON.parse(JSON.stringify(locationdata)), 'location_name');
      this.locationData = this.locationData.filter((e: any) => {
        return (e.location_id == 1 || e.location_id == 2 || e.location_id == 3)
      })
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
    finally{
    this.spinner.hide();
    }
  }

  async chooseItem(itemid: any) {
    console.log(itemid);
    const itemName = {
      item_name: itemid.product_name
    };
    const newItemCode: any = await this.sharedServices.getgeneratedNextItemCode(itemName).toPromise();
    this.itemData.item_code = newItemCode.newItemCode;
    this.itemData.item_id = itemid?.product_id;
    this.itemData.item_name = itemid?.product_name;
    this.itemData.category_id = itemid.category_id;
  }

  async additems() {
    try {
      if (this.additemForm.invalid) {
        this.additemForm.controls['purchase_id'].markAsTouched();
        this.additemForm.controls['item_id'].markAsTouched();
        this.additemForm.controls['item_code'].markAsTouched();
        this.additemForm.controls['location_id'].markAsTouched();
        this.additemForm.controls['description'].markAsTouched();
      }
      else{
        console.log(this.itemData);
        this.itemDataarray.push(this.itemData);
        const additemresponse = await this.adminService.addItem(this.itemDataarray).toPromise();
        console.log(additemresponse, "additemresponse");
  
        await Swal.fire({
          title: 'Success!',
          text: 'Item added successfully!',
          icon: 'success',
        }).then(async () => {
          const updateLastItemCode = {
            last_item_code: this.itemData.item_code,
            product_id: this.itemData.item_id
          };
          const updationresponse = await this.adminService.updatelastitemcode(updateLastItemCode).toPromise();
          console.log(updationresponse, "updationresponse");
  
          this.itemData = {
            purchase_id: 'NA',
            item_id: 0,
            item_code: '',
            item_name: '',
            description: '',
            category_id: 0,
            location_id: 1,                         //warehouse
            invoice_no: '',
            warrantyend_Date: '',
            item_status: '1',
            created_by: localStorage.getItem('login_id'),
            complain_id: 1
          }
        });
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

  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.keyCode === 32) {
      event.preventDefault();
    }
  }

 

  validation() {
    this.additemForm = new FormGroup({
      purchase_id: new FormControl('',[Validators.required]),
      item_id: new FormControl(0,[Validators.required]),
      item_code: new FormControl('',[Validators.required]),
      location_id: new FormControl(0,[Validators.required]),
      description: new FormControl('No Description',[Validators.required])

    })
  }

}
