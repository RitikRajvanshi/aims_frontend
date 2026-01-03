import { Component } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-vendor-rejection-mail',
  templateUrl: './vendor-rejection-mail.component.html',
  styleUrls: ['./vendor-rejection-mail.component.scss']
})
export class VendorRejectionMailComponent {
supplier_id:number = 0;
  toggleGif:boolean = false;
  // actionAlreadytaken:boolean = false;
  initilLoad=true;
  vendorStatus: 'approved' | 'rejected' | 'cancelled' | 'rejectedNow' | null = null;
  vendorData:any;

  constructor(private adminService:AdminService, private route:ActivatedRoute, private sharedService:SharedService){}

  ngOnInit(){
    const vid = Number(this.route.snapshot.paramMap.get('vid'));
    if(vid){
      this.supplier_id = vid;
      console.log(this.supplier_id, "supplier_id")
      // this.showInputModal();
    }
  }

    async ngAfterViewInit() {
      try {
        const results: any = await firstValueFrom(this.sharedService.getsupplierdata());
        console.log(results, "results");
        const checkVendorapproval:any = results.filter((item: any) => item.supplier_id === this.supplier_id);
  
        console.log(checkVendorapproval, "checkPOapproval");

      const changeVendorStatus ={
        ...checkVendorapproval[0],
        status:'0'
      };

      this.vendorData = [changeVendorStatus];
      console.log(this.vendorData, "vendorData");
      console.log(checkVendorapproval, "checkPOapproval");
  
        if (checkVendorapproval && checkVendorapproval.length > 0) {
          const status = Number(checkVendorapproval[0].status);
          console.log(status, "status");
    
          if (status == 3) {
              this.vendorStatus = 'approved';
              return;
          }
          else if(status == 0){
               this.vendorStatus = 'rejected';
              return;
          }
          else{
            
            await  Swal.fire({
              title: "Are you sure?",
              text:"Do you want to reject this Vendor?",
              input: 'text', // Define input type (text, email, etc.)
              inputLabel:'Remarks',
              inputPlaceholder: 'Remarks...',
              showCancelButton: true, // Show cancel button
              confirmButtonText: 'Yes',
              cancelButtonText: 'No',
              didOpen: () => {
                const input = Swal.getInput();
                if (input) {
                  input.setAttribute('autocomplete', 'off');
                  input.setAttribute('autocorrect', 'off');
                  input.setAttribute('autocapitalize', 'off');
                  input.setAttribute('spellcheck', 'false');
                }
              }
            }).then(async (result) => {
              const reason = result.value || '';

              this.initilLoad = false;
              if (result.isConfirmed) {
                try {
                  if(this.supplier_id){
                    const results:any = await firstValueFrom(this.adminService.approveorrejectVendor(this.vendorData[0]));
                    console.log(results, "results")
                    if(results){
                      // this.toggleGif = true;
                      this.vendorStatus = 'rejectedNow';
                      console.info('Vendor rejected successfully!');
                    }
                    else{
                      this.toggleGif=false;
                      //  this.actionAlreadytaken = true;
                       console.info('Already action taken!');
                    }
                  }
              }
              catch(err){
                console.error('Rejection failed:', err);
              }
              }
              else {
                this.vendorStatus = 'cancelled';
              }
            })
          }
        }
       
      } catch (error) {
        console.error('Error fetching purchase order data:', error);
      }
  
    
    }


}
