import { Component, ViewChild, ElementRef, Input, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/app/environments/environment.prod';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';
import jspdf from 'jspdf';
// import html2canvas from 'html2canvas';
var domtoimage = require('dom-to-image');
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from "ngx-spinner";


@Component({
  selector: 'app-purchase-order-view',
  templateUrl: './purchase-order-view.component.html',
  styleUrls: ['./purchase-order-view.component.scss']
})
export class PurchaseOrderViewComponent {
  previousUrl: string | null = null;
  @Input() purchaseid!: string; // Input to receive purchase I

  @ViewChild('pdfTable', { static: false }) pdfTable!: ElementRef;
  purchaseId: string = '';
  purchaseJoinData: any;
  purchasefilteredJoindata: any;
  issuedata: any;
  // fileName:any;
  purchaseIdsplit: any;
  purchaseData = {
    purchase_id: ''
  };
  purchaseOrderDetail = {
    supplier_name: '',
    issue_date: '',
    expected_date: '',
    total: 0,
    totalindecimal: 0,
    roundOffTotal: 0,
    roundOffTotalindecimal: 0,
    currency: ''
  };
  comapanyDetail: any;
  companydata = {
    companyLogo: '',
    companyLogo2: '',
    companyName: '',
    companyAddress: '',
    gstInnumber: '',
    phoneNumber: '',
    telephoneNumber: '',
    registeredEmail: '',
    nick_name: '',
    mobile1: '',
    mobile2: '',
    gstin: ''
  };
  companyLogo: any;
  companyLogo2: any;
  adressParts: any;
  searchTerm: any;
  tableSize: any;
  page: any;
  poDiscount: number = 0;
  discountType: 'rs' | 'percent' = 'rs';
  hasItemDiscount: boolean = false;


  constructor(private route: ActivatedRoute, private spinner: NgxSpinnerService, private sharedService: SharedService, private router: Router, private _dialog: MatDialogRef<PurchaseOrderViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
    this.route.params.subscribe({
      next: (params: any) => {

        this.purchaseId = params['pid'] ? params['pid'] : this.data;
        this.searchTerm = params['searchTerm'] || '';
        this.page = +params['page'] || 1;
        this.tableSize = +params['tableSize'] || null;

        this.purchaseIdsplit = this.purchaseId.split('/')[0]
        this.getCompanyData();
        // console.warn(this.Id, this.purchaseId);
        this.purchaseData.purchase_id = this.purchaseId;
        this.getPurchaseJoinData();

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

  async getCompanyData() {
    this.spinner.show();
    try {
      const results: any = await this.sharedService.getCompanydata().toPromise();
      this.comapanyDetail = results;

      this.companyLogo2 = `${environment.BASE_URL}companyData/` + results[0].company_logo2;
      this.companyLogo = `${environment.BASE_URL}companyData/` + results[0].company_logo;

      this.companydata.companyName = results[0].company_name;
      this.companydata.companyAddress = results[0].address;
      this.adressParts = this.companydata.companyAddress.split(',');
      console.log(this.adressParts);
      this.companydata.telephoneNumber = results[0].telephone_no;
      this.companydata.registeredEmail = results[0].registered_email;
      this.companydata.nick_name = results[0].nick_name;
      this.companydata.mobile1 = results[0].mobile1;
      this.companydata.mobile2 = results[0].mobile2;
      this.companydata.gstin = results[0].gstin;
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
    finally {
      this.spinner.hide();
    }
  }

  filterObjects(objects: any[]): any[] {
    //filtering object having non-zero value of column total in the object.
    return objects.filter((objects) => objects?.total !== 0);
  }

  async getPurchaseJoinData() {
    try {
      const results: any = await this.sharedService.getPurchaseJoinDatabyPid(this.purchaseData).toPromise();
      console.log(results, "results");

      this.purchaseJoinData = results.map((item: any) => {
        const filterissuedate = moment(item.issue_date).format('DD-MM-YYYY');
        const filterexpecteddate = moment(item.expected_date).format('DD-MM-YYYY');
        return { ...item, issue_date: filterissuedate, expected_date: filterexpecteddate }
      });
      console.log(this.purchaseJoinData, "this.purchaseJoinData");

      // Filter based on condition (if you want to filter based on non-zero total)
      this.purchasefilteredJoindata = this.purchaseJoinData.filter((item: any) => item.total !== 0);

      // Detect item level discount
      this.hasItemDiscount = this.purchasefilteredJoindata
        .some((item: any) => Number(item.discount_in_rs) > 0);
      // Assign other details
      this.purchaseOrderDetail.supplier_name = this.purchaseJoinData[0].supplier_name;
      this.purchaseOrderDetail.issue_date = this.purchaseJoinData[this.purchaseJoinData.length - 1].issue_date;
      this.purchaseOrderDetail.expected_date = this.purchaseJoinData[this.purchaseJoinData.length - 1].expected_date;
      this.purchaseOrderDetail.currency = this.purchaseJoinData[0]?.currency;
      console.log(this.purchaseOrderDetail.currency, "this.purchaseOrderDetail.currency");

      const firstRow = this.purchaseJoinData[0];


      if (firstRow?.po_discount && Number(firstRow.po_discount) > 0) {
        this.poDiscount = Number(firstRow.po_discount);
      } else {
        this.poDiscount = 0;
      }

      // Perform other operations like calculating totals
      this.totalAndGrandtotal();

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
  }

  navigateBack() {
    let variable = localStorage.getItem('backUrl');
    console.log(variable);
    localStorage.removeItem('backUrl');
    if (localStorage.getItem('backUrl') == null) {
      this.router.navigateByUrl(`${variable}`);
    }
  }

  //This is for sum of key total of all values in the list and roundoff it to show it on the purhcase order.
  totalAndGrandtotal() {
    this.purchaseOrderDetail.total = this.purchaseJoinData.map((item: any) => item.total).reduce((acc: number, total: any) =>
      acc + total, 0
    );

    // Apply PO discount only if no item-level discount
    if (!this.hasItemDiscount && this.poDiscount > 0) {
      this.purchaseOrderDetail.total =
        this.purchaseOrderDetail.total - this.poDiscount;
    };

    this.purchaseOrderDetail.totalindecimal = this.purchaseOrderDetail.total ? +this.purchaseOrderDetail.total.toFixed(2) : 0;
    this.purchaseOrderDetail.roundOffTotal = this.purchaseOrderDetail.total ? Math.round(this.purchaseOrderDetail.total) : 0;
    this.purchaseOrderDetail.roundOffTotalindecimal = this.purchaseOrderDetail.roundOffTotal ? +(this.purchaseOrderDetail?.roundOffTotal).toFixed(2) : 0;

  }


  public downloadAsPdf(): void {
    const htmlDiv = document.getElementById('pdfTable');
    if (!htmlDiv) return;


    const width = htmlDiv.clientWidth;
    const height = htmlDiv.clientHeight;
    let orientation = '';

    const scale = 1.5;
    // let imageUnit = 'pt';
    const originalBorder = htmlDiv.style.border;
    htmlDiv.style.border = 'none';

    if (width > height) {
      orientation = 'l';
    } else {
      orientation = 'p';
    }

    domtoimage.toBlob(htmlDiv, {
      width: width * scale, height: height * scale, style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: width + 'px',
        height: height + 'px'
      }
    })
      .then((blob: Blob) => {
        try {
          let jsPdfOptions: any;

          if (width > height) {
            jsPdfOptions = {
              orientation: 'l', // or 'landscape'
              unit: 'pt',
              format: [width, height]
            };
          } else {
            jsPdfOptions = {
              orientation: 'p', // or 'portrait'
              unit: 'pt',
              format: [width, height]
            };
          }

          const pdf = new jspdf(jsPdfOptions);
          const reader = new FileReader();
          reader.onload = () => {
            const imageData = reader.result as string;
            pdf.addImage(imageData, 'JPEG', (pdf.internal.pageSize.getWidth() - width) / 2, 20, width, height);
            const pdfBlob = pdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = 'Purchase_Order: ' + this.purchaseData.purchase_id + '.pdf';
            anchor.click();
            URL.revokeObjectURL(url);
            htmlDiv.style.border = originalBorder;
          };
          reader.readAsDataURL(blob);
        } catch (error) {
          console.error('Error generating PDF:', error);
          htmlDiv.style.border = originalBorder;
        }
      })

  }


}
