import { Component } from '@angular/core';
import { CheckService } from 'src/app/services/check.service';
import { SharedService } from 'src/app/services/shared.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-received-request',
  templateUrl: './received-request.component.html',
  styleUrls: ['./received-request.component.scss']
})
export class ReceivedRequestComponent {
  isDataorNot:boolean = true;
  request: any;
  created_by: any;
  RequestData = {
    request_id :0,
    quantity : 0
  }

  rejectRequestData={
    request_id:0,
    rejection_reason:'No Reason...'
  }

  updateRequestForm:any;
  rejectRequestForm:any;
  pendingRequests:any;
  requestId:any;

  constructor(private checkService: CheckService, private sharedService: SharedService, private router: Router
    , private adminService:AdminService) { }

  ngOnInit(): void {
    this.getPendingRequest();
    this.validation();
    this.validation2();
  }

  async getPendingRequest() {
    try{
      const results:any = await this.sharedService.getpendingRequest().pipe(
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
        this.request = results;
        this.created_by = localStorage.getItem('name');
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

  getpenditingRequestbyId(id:any){
    let requestId={
      request_id: id
    }

    this.sharedService.getpendingRequestByid(requestId).subscribe({
      next:(results:any)=>{
      this.pendingRequests = (results[0].quantity);
      this.RequestData.quantity = (results[0].quantity);
    },
    error:(error)=>{
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


  onreject(id:any){
    this.rejectRequestData.rejection_reason = 'No Reason...'
    this.rejectRequestData.request_id = id;
  }

  rejectionUpdate() {
    this.checkService.onrejectrequest(this.rejectRequestData).subscribe(
      {
        next: (results: any) => {
          Swal.fire(
            'Success!',
            'Request rejected successfully!',
            'success'
          ).then(()=>{
            location.reload();
          })
        }, error: (error) => {
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

  updatereq(){
   this.adminService.updateRequestGrantedQuntity(this.RequestData).subscribe(
    {
      next:(results:any)=>{

        Swal.fire(
          'Success!',
          'Request accepted!',
          'success'
        ).then(()=>{
          location.reload();
        })
    // alert(`Request Accepted with ${this.RequestData.quantity} quantity ..`);
   },error:(error) => {
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

  onaccept(id:any){
    this.RequestData.request_id = id;
    this.getpenditingRequestbyId(id);
    // this.updatereq();
  
  }

  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.keyCode === 32) {
      event.preventDefault();
    }

  }

  validation(){
    this.updateRequestForm = new FormGroup({
    quantity: new FormControl('',[Validators.required])
    })
  }

  validation2(){
    this.rejectRequestForm = new FormGroup({
      rejection_reason: new FormControl('')
    })
  }
}
