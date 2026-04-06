import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, retry } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { SharedService } from 'src/app/services/shared.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-po-approval-mail',
  templateUrl: './po-approval-mail.component.html',
  styleUrls: ['./po-approval-mail.component.scss']
})
export class PoApprovalMailComponent {
  purchase_id: string | null | undefined = '';
  toggleGif = false;
  initilLoad = true;
  // actionAlreadytaken:any;
  checkPOapproval: any;
  poStatus: 'approved' | 'rejected' | 'cancelled' | 'approvedNow' | null = null;


  constructor(private route: ActivatedRoute, private sharedService: SharedService, private adminService: AdminService) { }

  async ngOnInit() {
    const pid = this.route.snapshot.paramMap.get('pid');
    if (pid) {
      // Decode the 'pid' if it exists
      this.purchase_id = decodeURIComponent(pid);
      console.log(this.purchase_id); // Output the decoded 'pid'
    }
  }

  async ngAfterViewInit() {
    try {
      const results: any = await firstValueFrom(this.sharedService.getpurchaseorderdata());
      const checkPOapproval:any = results.filter((item: any) => item.purchase_id === this.purchase_id);

      console.log(checkPOapproval, "checkPOapproval");

      if (checkPOapproval && checkPOapproval.length > 0) {
        const status = checkPOapproval[0].is_sent;
  
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
  
          await Swal.fire({
            title: "Are you sure?",
            text: "Do you want to approve this PO?",
            icon: "warning",
            cancelButtonText: 'No',
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes"
          }).then(async (result) => {
            this.initilLoad = false;
            if (result.isConfirmed) {
              try {
              const result: any = await firstValueFrom(this.adminService.poapprovalmail(this.purchase_id));
    
              console.log(result);
    
              if (result) {
                // this.toggleGif = true;
                this.poStatus = 'approvedNow';
              }
            }
            catch(err){
              console.error('Approval failed:', err);
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

  }
}
