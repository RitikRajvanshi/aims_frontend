import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, retry } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { SharedService } from 'src/app/services/shared.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vendor-approval-mail',
  templateUrl: './vendor-approval-mail.component.html',
  styleUrls: ['./vendor-approval-mail.component.scss']
})
export class VendorApprovalMailComponent {
  supplier_id: number | null | undefined = 0;
  toggleGif = false;
  initilLoad = true;
  // actionAlreadytaken:any;
  checkPOapproval: any;
  vendorStatus: 'approved' | 'rejected' | 'cancelled' | 'approvedNow' | null = null;
  vendorData: any[] = [];

  constructor(private route: ActivatedRoute, private sharedService: SharedService, private adminService: AdminService) { }

  async ngOnInit() {
    const vid = this.route.snapshot.paramMap.get('vid');
    if (vid) {
      
      // Decode the 'pid' if it exists
      this.supplier_id = Number(vid);
      console.log(this.supplier_id); // Output the decoded 'pid'
    }
  }

  async ngAfterViewInit() {
    try {
      const results: any = await firstValueFrom(this.sharedService.getsupplierdata());
      const checkVendorapproval: any = results.filter((item: any) => item.supplier_id === this.supplier_id);

      const changeVendorStatus = {
        ...checkVendorapproval[0],
        status: '3'
      }
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
        else if (status == 0) {
          this.vendorStatus = 'rejected';
          return;
        }
        else {

          await Swal.fire({
            title: "Are you sure?",
            text: "Do you want to approve this Vendor?",
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
                const result: any = await firstValueFrom(this.adminService.approveorrejectVendor(this.vendorData[0]));

                console.log(result);

                if (result) {
                  // this.toggleGif = true;
                  this.vendorStatus = 'approvedNow';
                }
              }
              catch (err) {
                console.error('Approval failed:', err);
              }
            }
            else {
              // On cancel window closes
              // window.close();
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
