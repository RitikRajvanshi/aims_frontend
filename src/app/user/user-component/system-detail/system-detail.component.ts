import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-system-detail',
  templateUrl: './system-detail.component.html',
  styleUrls: ['./system-detail.component.scss']
})
export class SystemDetailComponent {

  transferTo={
    transfer_to:0
  };

  itemId={
    item_id:0
  };
  searchItem:any;
  systemDetail:any;
  systemName:any;
  systemDatabyitemId:any;
  noconfiguration= false;
  isSystem: number | undefined;
  configureitemdetails:any;
  itemcodefromparams:any;
  isLegibleDataorNot:boolean = false;
  onlyLocationTransfer:boolean = false;

  locationTransfers:any|undefined[] =[];
  otherTransfer:any|undefined[] =[];
  // userTransfers:any[] =[];
  // hasSystemTransfers:boolean =false;
  // hasUserTransfers:boolean =false;
  hasLocationTransfers:boolean =false;
  hasOtherTransfers:boolean =false;

  constructor(private route: ActivatedRoute, private sharedService:SharedService, private router:Router, private spinner:NgxSpinnerService){
  }

  ngOnInit():void{
      this.route.params.subscribe((params: any) => {
       this.spinner.show();

          if(params && params['itemid']){
          this.itemId.item_id = +params['itemid'];
          console.log(params['itemid'], "params['itemid']");

          this.getSystemData(this.itemId);
          this.getTransferData(this.itemId);
          }

          this.isSystem = this.route.snapshot.queryParams['isSystemornot'];
          this.itemcodefromparams = this.route.snapshot.queryParams['item_code'];
      })
      this.spinner.hide();
  }

 async getSystemConfiguration(cpu:any){
  this.spinner.show();
    try{
        /** spinner ends after 5 seconds */
        this.systemDetail = await this.sharedService.getSystemConfiguration(cpu).pipe(
          retry(3), // Retry the request up to 3 times
          // catchError((error: HttpErrorResponse) => {
          //   console.error('Error fetching user data:', error);
          //   return of([]); // Return an empty array if an error occurs
          // })
        ).toPromise();

        console.log(this.systemDetail[0].item_id, "this.systemDetail");

       (this.systemDetail.length ==1 && this.systemDetail[0]?.item_id ==null)?this.noconfiguration = true:this.noconfiguration = false;

        console.log(this.systemDetail);
        return this.systemDetail;
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
    finally{
      this.spinner.hide();
    }    
  }

  getSystemData(itemId:any){
    this.sharedService.getsystemDatabyitemId(itemId).subscribe({

      next:(results:any)=>{
      this.spinner.show();
      // console.log(this.systemDatabyitemId, "this.systemDatabyitemId") ; 
        /** spinner ends after 5 seconds */
        this.systemDatabyitemId = results.map((e:any)=>{
          
          const formattedDate = e.transfer_date?moment(e.transfer_date).format('DD-MM-YYYY'):null;

          if((!e.transfer_to_system || e.transfer_to_system ==0 || e.transfer_to_system=='NA') && (!e.transfer_to_user || e.transfer_to_user ==0 || e.transfer_to_user=='NA')){
            console.log(e, "e.transfer_to_system ==0 && e.transfer_to_user");
            // return {...e, transfer_date:filtertransferdate}
            this.onlyLocationTransfer = true;
          }

          return {...e, transfer_date:formattedDate};
        });
        console.log(this.systemDatabyitemId, "results");
        this.spinner.hide();
    },
    error:(error)=>{
      this.spinner.hide();
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

  async getTransferData(data: any): Promise<any> {
    try {
      //configuration  
      const results: any = await this.sharedService.getTransferHistory(data).pipe(
        retry(3), // Retry the request up to 3 times
        // catchError((error: HttpErrorResponse) => {
        //   console.error('Error fetching user data:', error);
        //   return of([]); // Return an empty array if an error occurs
        // })
      ).toPromise();

      console.log(results, "getsystemDataotherThanCPU");

      if (results[0] && results[0].length !== 0) {
        
        // this.configureitemdetails = JSON.parse(JSON.stringify(results));
        this.configureitemdetails = results.map((e:any)=>{

          const filtertransferdate = moment(e.transfer_date).format('DD-MM-YYYY');
          const filtercreateddate = moment(e.created_date).format('DD-MM-YYYY');
          
          return {...e, transfer_date:filtertransferdate, created_date:filtercreateddate};
        }).sort((a:any, b:any)=> a.transfer_id - b.transfer_id); // Sort in ascending order based on transfer_id

        // add initial data i.e first transfer should be at warehouse at warehouse
        const firstObject = results[results.length-1];
        if(firstObject.location_id && firstObject.location_id != 1){

        const initialData = {
          ...firstObject,
          item_id: firstObject.item_id,
          item_code: firstObject.item_code,
          item_name: firstObject.item_name,
          transfer_to_location: 1,
          location_name: 'Main Warehouse',
          transfer_to_system: 0,
          system_name: null,
          transfer_to_user: 0,
          transfer_category:firstObject.transfer_category,
          transfer_date: moment(firstObject.created_date).format('DD-MM-YYYY'),
          remarks: 'Initial Entry',
          transfer_by: firstObject.transfer_by,
          transfer_byuser:firstObject.transfer_byuser,
          created_date: moment(firstObject.created_date).format('DD-MM-YYYY'),
          user_name:null,
          transfer_id: 0
        }

        this.configureitemdetails.unshift(initialData);
      }
 

      } 
    }
     catch(error:unknown){
      if (error instanceof HttpErrorResponse && error.status === 403) {            
        await Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Token expired.',
          footer: '<a href="../login">Please login again!</a>'
        }).then(()=>{
        this.router.navigate(['../login']);
      })
    
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Internal server error. Please try after some time!',
          footer:'<a href="../login">Login</a>'
        }).then(()=>{
        location.reload();
      })
      }
  }
  }

// async getTransferData(data: any): Promise<any> {
//   try {
//     const results: any = await this.sharedService.getTransferHistory(data)
//       .pipe(retry(3))
//       .toPromise();

//     if (results && results.length > 0) {
//       const formatted = results.map((e: any) => ({
//         ...e,
//         transfer_date: moment(e.transfer_date).format('DD-MM-YYYY')
//       }));

//       // Filter into two categories
//      // Location-only transfers

//          // Normal transfers (system or user)
//       this.otherTransfer = formatted.filter((e: any) =>
//         (e.transfer_to_system && e.transfer_to_system != 0 && e.transfer_to_system != 'NA') ||(e.transfer_to_user && e.transfer_to_user != 0 && e.transfer_to_user != 'NA')
//       );

//       this.locationTransfers = formatted.filter((e: any) =>
//         (!e.transfer_to_system || e.transfer_to_system == 0 || e.transfer_to_system == 'NA') && (!e.transfer_to_user || e.transfer_to_user == 0 || e.transfer_to_user == 'NA')
//       );

//       console.log(this.locationTransfers, "this.locationTransfers");
//       console.log(this.otherTransfer, "this.otherTransfer");

  

//       this.hasLocationTransfers = this.locationTransfers.length > 0;
//       this.hasOtherTransfers = this.otherTransfer.length > 0;


//     }
//   } catch (error: unknown) {
//     if (error instanceof HttpErrorResponse && error.status === 403) {
//       await Swal.fire({
//         icon: 'error',
//         title: 'Oops!',
//         text: 'Token expired.',
//         footer: '<a href="../login">Please login again!</a>'
//       }).then(() => {
//         this.router.navigate(['../login']);
//       });
//     } else {
//       await Swal.fire({
//         icon: 'error',
//         title: 'Oops!',
//         text: 'Internal server error. Please try after some time!',
//         footer: '<a href="../login">Login</a>'
//       }).then(() => {
//         location.reload();
//       });
//     }
//   }
// }


  navigateBack(){
     let variable = localStorage.getItem('backUrl');
     this.router.navigateByUrl(`${variable}`);
     localStorage.removeItem('backUrl');
  }
}
