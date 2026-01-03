import { Component } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { SharedService } from 'src/app/services/shared.service';


@Component({
  selector: 'app-po-rejection-mail',
  templateUrl: './po-rejection-mail.component.html',
  styleUrls: ['./po-rejection-mail.component.scss']
})
export class PoRejectionMailComponent {
  purchase_id:string = '';
  toggleGif:boolean = false;
  // actionAlreadytaken:boolean = false;
  initilLoad=true;
  poStatus: 'approved' | 'rejected' | 'cancelled' | 'rejectedNow' | null = null;

  constructor(private adminService:AdminService, private route:ActivatedRoute, private sharedService:SharedService){}

  ngOnInit(){
    const pid = this.route.snapshot.paramMap.get('pid');
    if(pid){
      this.purchase_id = decodeURIComponent(pid);
      // this.showInputModal();
    }
  }

    async ngAfterViewInit() {
      try {
        const results: any = await firstValueFrom(this.sharedService.getpurchaseorderdata());
        const checkPOapproval:any = results.filter((item: any) => item.purchase_id === this.purchase_id);
  
        console.log(checkPOapproval, "checkPOapproval");
  
        if (checkPOapproval && checkPOapproval.length > 0) {
          const status = checkPOapproval[0].is_sent;
          console.log(status, "status");
    
          if (status > 1) {
            // let message = status == 2?'This PO has already been approved.':'This PO has already been rejected.';
            if (status == 2) {
              this.poStatus = 'approved';
              return;
            }
            else {
              this.poStatus = 'rejected';
              return;
            }
          }
          else{
    
            // await Swal.fire({
            //   title: "Are you sure?",
            //   text: "Do you want to approve this PO?",
            //   icon: "warning",
            //   cancelButtonText: 'No',
            //   showCancelButton: true,
            //   confirmButtonColor: "#3085d6",
            //   cancelButtonColor: "#d33",
            //   confirmButtonText: "Yes"
            // })
            
            await  Swal.fire({
              title: "Are you sure?",
              text:"Do you want to reject this PO?",
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
                  if(this.purchase_id){
                    const results:any = await firstValueFrom(this.adminService.porejectionmail(this.purchase_id,reason));
                    console.log(results, "results")
                    if(results && results.message == true){
                      // this.toggleGif = true;
                      this.poStatus = 'rejectedNow';
                      console.info('PO rejected successfully!');
                    }
                    else{
                      this.toggleGif=false;
                      
                      //  this.actionAlreadytaken = true;
                       console.info('Already action taken!');
                    }
                  }
                // const result: any = await firstValueFrom(this.adminService.poapprovalmail(this.purchase_id));
      
                // console.log(result);
      
                // if (result && result.message == true) {
                //   // this.toggleGif = true;
                //   this.poStatus = 'approvedNow';
                // }
              }
              catch(err){
                console.error('Rejection failed:', err);
              }
              }
              else {
                // On cancel window closes
                // window.close();
                this.poStatus = 'cancelled';
              }
            })
          }
        }
       
      } catch (error) {
        console.error('Error fetching purchase order data:', error);
      }
  
     
  
      
      
  
      // const result = await this.sharedService.getpurchasedatafromPurchaseOrder().toPromise();
      // console.log(result, "result");
  
  
  
    }

    // Method to show SweetAlert2 input modal
    async showInputModal() {
     await  Swal.fire({
        title: "Are you sure?",
        text:"Do you want to reject this PO?",
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
      })
      .then(async(result) => {
        this.initilLoad = false;
        if (result.isConfirmed) {
          console.log('confirmed');
          // Access the input value
          const reason = result.value || '';

          if(this.purchase_id){
            const results:any = await firstValueFrom(this.adminService.porejectionmail(this.purchase_id,reason));
            console.log(results, "results")
            if(results && results.message == true){
              this.toggleGif = true;
              console.info('PO rejected successfully!');
            }
            else{
              this.toggleGif=false;
              //  this.actionAlreadytaken = true;
               console.info('Already action taken!');
            }
          }
        
       
        } else {
          // On cancel window closes
          console.log('Operation Cancelled');
        }
      })
    }

}
