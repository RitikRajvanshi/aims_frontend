import { Component } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { AdminService } from 'src/app/services/admin.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog'; 
import { PurchaseOrderViewComponent } from '../purchase-order-view/purchase-order-view.component';

@Component({
  selector: 'app-received-purchase-order',
  templateUrl: './received-purchase-order.component.html',
  styleUrls: ['./received-purchase-order.component.scss'],
})
export class ReceivedPurchaseOrderComponent {
  isDataorNot:boolean = true;
  previousUrl:any;
  purchaseData: any;

  purchaseId = {
    purchase_id: ''
  }
  getResponse: any;

  constructor(private sharedService: SharedService, private adminService: AdminService, private router: Router, 
    private location:Location,  private dialog:MatDialog) { }

  ngOnInit(): void {
    this.getSendPurchaseOrder();

  }

  async getSendPurchaseOrder() {
    try{
      const results:any = await this.sharedService.getsendpurchaseorderdata().pipe(
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
        this.purchaseData = results.map((item:any)=>{
          const filtereddate = moment(item?.created_date).format('DD-MM-YYYY');
          return {...item, created_date:filtereddate}
        });
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
  }

  onaccept(data: any) {
    this.purchaseId.purchase_id = data;
    this.adminService.updatesentaApprovedinpurchaseOrder(this.purchaseId).subscribe(
      {
        next: (results: any) => {
          this.getResponse = results;
          Swal.fire({
            position:'center',
            icon: 'success',
            title: this.getResponse[0].update_sent_approvedpurchaseorder,
            showConfirmButton: false,
            timer: 1500
          }).then(()=>{
            this.ngOnInit();
          })
        }, error: (error) => {
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

  onreject(data: any) {
    this.purchaseId.purchase_id = data;
    Swal.fire({
      title: 'Are you sure to reject it?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Reject it!'
    }).then((result) => {
      if (result.isConfirmed) {

        this.adminService.updatesentaRejectinpurchaseOrder(this.purchaseId).subscribe(
          {
            next: (results: any) => {
              this.getResponse = results;
              Swal.fire(
                'Rejected!',
                'You rejected PO approval!',
                'success'
              ).then(()=>{
                this.ngOnInit();
              })
            }, error: (error) => {
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
    })

  }

  navigateToNewRoute() {
    this.previousUrl = this.location.path();
    localStorage.setItem('backUrl', this.previousUrl);
  }
  openModal(data: any) {
    this.dialog.open(PurchaseOrderViewComponent,{
      width:'1200px',
      maxHeight: '85vh',
      data:data.purchase_id
    }) 
  }



}
