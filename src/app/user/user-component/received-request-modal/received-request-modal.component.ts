import { Component } from '@angular/core';
import { Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedService } from 'src/app/services/shared.service';
import { AdminService } from 'src/app/services/admin.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-received-request-modal',
  templateUrl: './received-request-modal.component.html',
  styleUrls: ['./received-request-modal.component.scss']
})
export class ReceivedRequestModalComponent {

  RequestData = {
    request_id :0,
    quantity : 0
  }

  updateRequestForm:any;
  pendingRequests:any;
  requestId:any;

  // this is for modalpoup used in request module from user
  constructor(@Inject(MAT_DIALOG_DATA) public data:any, private Ref:MatDialogRef<ReceivedRequestModalComponent>, private adminService:AdminService,
  private sharedService:SharedService, private router:Router){

  }

  //there is a data which is request_id from request component.....

  ngOnInit(): void {
    this.validation();
    this.getPendingRequestByid(); 
  }

  getPendingRequestByid(){
    this.sharedService.getpendingRequestByid(this.data).subscribe({
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



  updatereq(){
    this.RequestData.request_id = this.data.request_id;

   this.adminService.updateRequestGrantedQuntity(this.RequestData).subscribe(
    {
      next:(results:any)=>{
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: `Request Accepted`,
          showConfirmButton: false,
          timer: 1500
        }).then(()=>{      
      //for closing model   
        // this.Ref.close(); 
        location.reload();
        })

   },error:(error) => {
    // console.log('error')
    if (error.status == 403) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Token expired....',
        footer: '<a href="../login">Please Login..</a>'
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

  validation(){
    this.updateRequestForm = new FormGroup({
    quantity: new FormControl('',[Validators.required])
    })
  }
}
