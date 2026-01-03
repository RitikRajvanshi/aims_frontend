import { Component, ViewChild, TemplateRef, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/app/environments/environment.prod';
import { Location } from '@angular/common';
import { NgxSpinnerService } from "ngx-spinner";
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { CheckService } from 'src/app/services/check.service';
import { retry } from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PurchaseOrderViewComponent } from '../purchase-order-view/purchase-order-view.component';
import { SupplierEvaluationComponent } from '../supplier-evaluation/supplier-evaluation.component';

@Component({
  selector: 'app-purchase-info',
  templateUrl: './purchase-info.component.html',
  styleUrls: ['./purchase-info.component.scss']
})
export class PurchaseInfoComponent {

  purchaseId = {
    purchase_id: ''
  }
  purchaseInfo: any;
  purchaseInfocheck: any
  baseUrl: any;
  productsname: any;
  numberofproducts: any;
  previousUrl: any;
  comapanyDetail: any[] = [];
  companyLogo: any;
  companyLogo2: any;
  isDataornot: boolean = true;
  searchTerm: any;
  tableSize: any;
  page: any;
  hideEvaluation:boolean=false;
  dialogRef!: MatDialogRef<any>;

  @ViewChild('modalContent') modalContent!: TemplateRef<any>;;  // This is where we get the reference to the modal template

  constructor(private route: ActivatedRoute, private sharedService: SharedService, private location: Location, 
    private router: Router, private spinner: NgxSpinnerService, private checkService: CheckService, private dialog: MatDialog, private ngZone: NgZone) {

  }

  ngOnInit() {
    this.getCompanyData();
    this.baseUrl = environment.BASE_URL;
    this.route.params.subscribe({
      next: (param: any) => {
        this.searchTerm = param['searchTerm'] || '';
        this.page = +param['page'] || 1;
        this.tableSize = +param['tableSize'] || null;
        this.purchaseId.purchase_id = param['pid'];
        this.purchaseinfo(this.purchaseId);
        this.getPurchaseJoinDatabyPid();

      },
      error: (error) => {
        throw error;
      }
    })
  }

  async purchaseinfo(pid: any) {
    this.spinner.show();
    try {
      const purchasedetail: any = await this.sharedService.getPurchaseJoinDatabyPid(this.purchaseId).pipe(
        retry(3), // Retry the request up to 3 times
        // catchError((error: HttpErrorResponse) => {
        //   console.error('Error fetching accepted requests:', error);
        //   return of([]); // Return an empty array if an error occurs
        // })
      ).toPromise();

      if (!purchasedetail || !purchasedetail.length) {
        this.isDataornot = false;
      }
      else {
        this.isDataornot = true;
        this.purchaseInfo = purchasedetail.map((item: any) => {
          return {
            ...item,
            date_of_inspection: moment(item.date_of_inspection).format('DD-MM-YYYY'),
            product_received_date: moment(item.product_received_date).format('DD-MM-YYYY'),
            issue_date: moment(item.issue_date).format('DD-MM-YYYY'),
            expected_date: moment(item.issue_date).format('DD-MM-YYYY'),
          };
        });

        console.log(this.purchaseInfo, "purchasedetail");
        if (this.purchaseInfo && this.purchaseInfo[0]) {
          setTimeout(() => {
            this.purchaseInfocheck = this.purchaseInfo[0]
            this.productsname = this.purchaseInfo.map((item: any) => {
              console.log(this.productsname, "this.productsname");
              return `${item?.quantity} ${item?.product_name}`
            }).join('<br>');
          }, 300);
        }
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
    finally {
      this.spinner.hide();
    }
  }

  navigateBack() {
    let variable = localStorage.getItem('backUrl');
    console.log(variable, "url");
    localStorage.removeItem('backUrl');
    console.log(localStorage.getItem('backUrl'));
    if(localStorage.getItem('backUrl')==null){
      this.router.navigateByUrl(`${variable}`);
    }
}


  navigateToNewRoute(items: any) {


    this.previousUrl = this.location.path().split('?')[0];
    console.log(this.previousUrl);
    // Store the current URL with query params
    // localStorage.setItem('backUrl', this.previousUrl);
    localStorage.setItem('navigated', 'true'); // Set the flag for navigation
    // localStorage.setItem('backUrl', this.previousUrl + this.buildQueryString(queryParams));
    this.router.navigate(['user/vendor-evaluation/', items.purchase_id]);
  }

  //   navigateTo(items: any) {
  //   const queryParams: any = {};

  //   // Add properties to queryParams only if their values are not empty or undefined
  //   if (this.searchTerm) queryParams.searchTerm = this.searchTerm;
  //   if (this.page) queryParams.page = this.page;
  //   if (this.tableSize) queryParams.tableSize = this.tableSize;

  //   this.previousUrl = this.location.path().split('?')[0];
  //   // Store the current URL with query params
  //   localStorage.setItem('backUrl', this.previousUrl + this.buildQueryString(queryParams));
  //   localStorage.setItem('navigated', 'true'); // Set the flag for navigation
  //   this.router.navigate(['user/purchase-info', items.purchase_id], { queryParams });
  // }

  //   buildQueryString(params: any): string {
  //   return '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&');
  // }

  async getCompanyData() {
    try {
      const results: any = await this.sharedService.getCompanydata().toPromise();
      this.comapanyDetail = results;
      this.companyLogo2 = `${environment.BASE_URL}companyData/` + results[0].company_logo2;
      this.companyLogo = `${environment.BASE_URL}companyData/` + results[0].company_logo;
    }
    catch (error: unknown) {
      this.spinner.hide();
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

  checkAndOpenFile(filePath: string) {
    if (filePath) {
      const fullPath = this.baseUrl + filePath;
      this.checkService.checkFileExistence(this.baseUrl + filePath).subscribe(exists => {
        console.log(exists);
        if (exists) {
          window.open(fullPath, '_blank');
        } else {
          this.documentnotexists();
        }
      });
    }
    else {
      this.documentnotuploaded();
    }

  }

  openModal(data: any) {
    this.dialog.open(PurchaseOrderViewComponent,{
      width:'1000px',
      maxHeight: '70vh',
      height: 'auto',
      data:data.purchase_id
    }) 
  }

  openInspectionReport() {
    if(this.modalContent){
      this.dialogRef =  this.dialog.open(this.modalContent, {
        width: '65vw', // Adjust width as needed
        maxWidth: '100%',
        height: 'auto',
        maxHeight: '80vh',
      });
    }
  }

  openEvaluation(data: any){
    this.dialog.open(SupplierEvaluationComponent,{
      width:'1500px',
      maxHeight: '80vh',
      height: 'auto',
      data:data.purchase_id
    }) 
  }


  getPurchaseJoinDatabyPid() {
      this.sharedService.getPurchaseJoinDatabyPid(this.purchaseId).subscribe(
        {
          next: (results: any) => {
            //evaluation is  possible after purchase order is fully inspected....
  
            const checkinpection = results.map((e: any) => {
              //checking all purchase items are inspected in the respective purchase order
              if (e.inspected_by === 10) {
                return true   //true ---> inspected
              }
              else {
                return false     // false ---> not inspected
              }
            })
  
            // if includes(false) is true indicate that there is any item which is not inspected
            if (checkinpection.includes(false)) {
              this.hideEvaluation = true;
              // Swal.fire({
              //   icon: 'warning',
              //   title: 'Oops...',
              //   text: 'Please evaluate after inspection!',
              //   footer: 'Without inpection, evaluation is not possible!'

              // })
            }

          },
          error: (error) => {
            if (error.status == 403) {
              Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: 'Token expired.',
                footer: '<a href="../login">Please login again!</a>'
              }).then(() => {
                this.router.navigate(['../login']);
              })
            }
            else {
              Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: 'Internal server error.Please try after some time!',
                footer: '<a href="../login">Login</a>'
              }).then(() => {
                location.reload();
              })
            }
          }
        })
    }
  

  closeDialog(): void {
    this.dialogRef ? this.dialogRef.close():console.warn("Not working");
  }

  documentnotuploaded() {
    Swal.fire({
      icon: 'warning',
      title: 'Warning!',
      text: 'File not uploaded yet!'
    })
  }

  documentnotexists() {
    Swal.fire({
      icon: 'warning',
      title: 'Warning!',
      text: 'File does not exists!'
    })
  }
}
