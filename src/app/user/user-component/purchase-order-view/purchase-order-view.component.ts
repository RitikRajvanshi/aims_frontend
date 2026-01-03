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
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
    currency:''
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
  searchTerm:any;
  tableSize:any;
  page:any;
  

  constructor(private route: ActivatedRoute,private spinner: NgxSpinnerService, private sharedService: SharedService, private router: Router,private _dialog:MatDialogRef<PurchaseOrderViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data:any ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe({
      next: (params: any) => {
       
        this.purchaseId = params['pid']?params['pid']:this.data;
        this.searchTerm = params['searchTerm'] || '';
        this.page = +params['page'] || 1;
        this.tableSize = +params['tableSize']|| null ;

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
    finally{
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
      // Assign other details
      this.purchaseOrderDetail.supplier_name = this.purchaseJoinData[0].supplier_name;
      this.purchaseOrderDetail.issue_date = this.purchaseJoinData[this.purchaseJoinData.length - 1].issue_date;
      this.purchaseOrderDetail.expected_date = this.purchaseJoinData[this.purchaseJoinData.length - 1].expected_date;
      this.purchaseOrderDetail.currency = this.purchaseJoinData[0]?.currency;
      console.log(this.purchaseOrderDetail.currency, "this.purchaseOrderDetail.currency");

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
    if(localStorage.getItem('backUrl')==null){
      this.router.navigateByUrl(`${variable}`);
    }
  }

  //This is for sum of key total of all values in the list and roundoff it to show it on the purhcase order.
  totalAndGrandtotal() {
    this.purchaseOrderDetail.total = this.purchaseJoinData.map((item: any) => item.total).reduce((acc: number, total: any) =>
      acc + total, 0
    )
    this.purchaseOrderDetail.totalindecimal = this.purchaseOrderDetail.total?+this.purchaseOrderDetail.total.toFixed(2):0;
    this.purchaseOrderDetail.roundOffTotal = this.purchaseOrderDetail.total?Math.round(this.purchaseOrderDetail.total):0;
    this.purchaseOrderDetail.roundOffTotalindecimal = this.purchaseOrderDetail.roundOffTotal?+(this.purchaseOrderDetail?.roundOffTotal).toFixed(2):0;

  }

  //22-09-2023 used
  // print(): void {
  //   // this method is used by js to print html pages having more than one pages and having its own css
  //   // it's first open the page in another window and then print it according to it.
  //   const printContent = this.pdfTable.nativeElement.innerHTML;
  //   const printWindow = window.open('', '_blank');
  //   // printWindow?.document.write(printContent);
  //   printWindow?.document.write(`
  //   <html>
  //     <head>
  //       <style>
  //       .report-heading{
  //         margin-left:245px;
  //         color:red;
  //       }
  //       .report-header{
  //         // padding:10px;
  //         display:flex !important;
  //         justify-content: space-around !important;

  //       }

  //       .reportitem1{
  //         margin-left:0;
  //         flex-basis:20%;
  //         }

  //       .reportitem2{
  //       margin-left:0;
  //       flex-basis:80%;
  //       }
  //       .report-logo{

  //       }
  //       table {
  //        border-collapse: collapse;
  //         margin:10px;   
  //         background-color:#d8f2ff;  
  //         //  background-color:black;  
  //       }

  //     th, td {
  //       border: 1px solid black;
  //        padding: 10px;
  //         }

  //     .billing-right h3 {
  //         font-weight: 600;
  //         font-size: 13px; 

  //       }
  //       .billing-left{
  //         justify-content: space-between !important;
  //         align-content: stretch !important;
  //         align-items: flex-end !important;
  //     }
      
   
  //       .billing-para {
  //         font-weight: 400;
  //        font-size: 13px;
  //        padding-left:5px;
  //         }

  //       .term-heading {
  //        font-size: 20px;
  //       font-weight: bold;
  //         }

  //         .service-para {
  //           font-size: 15px;
  //           padding-left: 3px;
  //           font-weight: 300;
  //           color: #000;
  //             }

  //          .data-form {
  //          border: 1px solid #e0dddd;
  //          padding: 20px;
  //           margin-bottom: 30px;
  //           box-shadow: 2px 4px 10px 0 rgba(124, 8, 8, 0.05), 2px 4px 10px 0 rgba(0, 34, 51, 0.05);
  //           // position: relative;
  //          }

  //           .m-2{
  //             // margin:20px;
  //           }

  //           .p-5{
  //             // padding:30px;
  //           }

  //           .rows1{
  //             display: flex;
  //             flex-wrap: wrap;
  //           }

  //           .billing-left {
  //             display:flex;
  //             width:100%;             
  //           }
            
  //           // .spacer{
  //           //   width:220px;
  //           // }

  //           .billing-left h3 {
  //             font-weight: 600;
  //             font-size: 15px;         
  //         }
          
  //         .billing-left p {
  //             color: #000;
  //             font-weight: 400;
  //             font-size: 15px;          
  //         }

  //         col-md-6{
  //           width:50%;
  //         }

  //         container-fluid{
  //           width:100%;
  //         }

  //           .page-background {
  //             background-color: #ffffff;
  //             min-height: 100vh;
  //             justify-content: center;
  //         }

  //         /* Large devices (≥1200px) */
  //                 @media (min-width: 1200px) {
  //                   .col-lg-8 {
  //                   flex-basis: 66.666667%;
  //                     max-width: 66.666667%;
  //                         }
  //                 }

  //             /* Medium devices (≥992px) */
  //             @media (min-width: 992px) and (max-width: 1199.98px) {
  //               .col-md-9 {
  //                 flex-basis: 75%;
  //                 max-width: 75%;
  //               }
  //             }

  //             /* Small devices (≥768px) */
  //             @media (min-width: 768px) and (max-width: 991.98px) {
  //               .col-sm-10 {
  //                 flex-basis: 83.333333%;
  //                 max-width: 83.333333%;
  //               }
  //             }

  //             /* Extra small devices (<768px) */
  //             @media (max-width: 767.98px) {
  //               .col-12 {
  //                 flex-basis: 100%;
  //                 max-width: 100%;
  //               }
  //             }

  //             .termsandheading{
  //               // padding:15px;
  //             }

  //             .heading-service{
  //               margin-bottom:15px;
  //               font-size:18px;
  //             }
            

  //             .term-heading{
  //               text-align:center;
  //             }
              
  //             .report-header {
  //               height: 150px;
  //               display: flex;
  //               flex-direction: row;
  //           }
  //           .report-logo{
  //               height:80px;
  //               width:120px;
  //               margin:10px;
  //               padding:5px;
  //           }
  //           .report-logo img {
  //               height:80px;
  //               width:120px;
                
  //           }
            
  //           .report-heading{
  //               margin-top:20px;
  //           }

  //           .report-heading h1{
  //               font-size:20px;
  //               margin-bottom:20px;
  //               color:red;
  //               font-weight: bold;
                
  //           }

  //           html{
  //             padding:10px;
  //             font-family: 'Roboto', sans-serif;
  //       }
  //           }

  //           .text-danger, .apv{
  //             color:red;
  //           }

  //           .potable{
  //             width: 100%;
  //             max-width: 100%;
  //             margin-bottom: 1rem;
  //             background-color: transparent;
  //             border-collapse: collapse;
  //             border: 1px solid #dee2e6;
  //             color: #343a40 !important;

  //           }

  //           .potable th,
  //           .potable td {
  //             border: 1px solid #dee2e6;
  //                 }

  //           .potable tbody tr:nth-of-type(odd) {
  //             background-color: rgba(0, 0, 0, 0.05);
  //             // background-color:#d8f2ff
  //           }

  //             .table-font th,
  //             .table-font td {
  //             font-size:10px !important;
  //             color:black;
  //             font-family: 'Verdana', 'Geneva', sans-serif !important;
  //             padding:2px;
  //                 }

  //           @media only print {

  //             body{
  //                 margin:20px;
  //             }
  //             }
  //       </style>
   
  //     </head>
  
  //   </html>
  // `, printContent);
  //   printWindow?.document.close();
  //   printWindow?.print();

  // }


  // exportToPDF() {
  //   const element = document.getElementById('pdfTable');
  //   const termsSection = document.getElementById('div15');


  //   if (element && termsSection) {
  //     // Save the original styles
  //     const originalBorder = element.style.border;
  //     // Create a style tag to force the font size change
  //     const style = document.createElement('style');
  //     style.innerHTML = `
  //       #div15 * {
  //         font-size: 16px !important; /* Adjust the font size as needed */
  //       }
  //     `;
  //     document.head.appendChild(style);

  //     // Remove the border
  //     element.style.border = 'none';

  //     const htmlWidth = element.offsetWidth;
  //     const htmlHeight = element.offsetHeight;
  //     const topLeftMargin = 15;

  //     if (htmlWidth && htmlHeight) {
  //       let pdfWidth = htmlWidth + (topLeftMargin * 2);
  //       let pdfHeight = (pdfWidth * 1.5) + (topLeftMargin * 2);

  //       const canvasImageWidth = htmlWidth;
  //       const canvasImageHeight = htmlHeight;

  //       const totalPDFPages = Math.ceil(htmlHeight / pdfHeight) - 1;

  //       html2canvas(element, { allowTaint: true, useCORS: true }).then(canvas => {
  //         const imgData = canvas.toDataURL("image/jpeg", 1.0);
  //         let pdf = new jspdf('p', 'pt', [pdfWidth, pdfHeight]);
  //         pdf.addImage(imgData, 'png', topLeftMargin, topLeftMargin, canvasImageWidth, canvasImageHeight);

  //         for (let i = 1; i <= totalPDFPages; i++) {
  //           pdf.addPage([pdfWidth, pdfHeight], 'p');
  //           pdf.addImage(imgData, 'png', topLeftMargin, - (pdfHeight * i) + (topLeftMargin * 4), canvasImageWidth, canvasImageHeight);
  //         }

  //         pdf.save(`Purchase_Order_${this.purchaseData.purchase_id}.pdf`);
  //       }).catch(error => {
  //         console.error('Error generating PDF:', error);
  //       });
  //     }
  //   }
  // }

  // public downloadAsPdf(): void {
  //   const htmlDiv = document.getElementById('pdfTable');
  //   if (htmlDiv) {
  //     const width = htmlDiv.clientWidth;
  //     const height = htmlDiv.clientHeight;
  //     let orientation = '';
  //     // let imageUnit = 'pt';
  //     const originalBorder = htmlDiv.style.border;
  //     htmlDiv.style.border = 'none';
  //     if (width > height) {
  //       orientation = 'l';
  //     } else {
  //       orientation = 'p';
  //     }

  //     domtoimage.toPng(htmlDiv, { width: width, height: height })
  //       .then((result: any) => {
  //         try {
  //           let jsPdfOptions: any;

  //           if (width > height) {
  //             jsPdfOptions = {
  //               orientation: 'l', // or 'landscape'
  //               unit: 'pt',
  //               format: [width, height]
  //             };
  //           } else {
  //             jsPdfOptions = {
  //               orientation: 'p', // or 'portrait'
  //               unit: 'pt',
  //               format: [width, height]
  //             };
  //           }

  //           const pdf = new jspdf(jsPdfOptions);
  //           pdf.addImage(result, 'PNG', (pdf.internal.pageSize.getWidth() - width) / 2, 20, width, height);
  //           pdf.save('Purchase_Order: '+this.purchaseData.purchase_id);
  //           htmlDiv.style.border = originalBorder;
  //         }
  //         catch (error) {
  //           console.error('Error generating PDF:', error);
  //           htmlDiv.style.border = originalBorder;

  //         }

  //       })
  //   }
  // }


  public downloadAsPdf(): void {
    const htmlDiv = document.getElementById('pdfTable');
    if (htmlDiv) {
      const width = htmlDiv.clientWidth;
      const height = htmlDiv.clientHeight;
      let orientation = '';
      // let imageUnit = 'pt';
      const originalBorder = htmlDiv.style.border;
      htmlDiv.style.border = 'none';
      if (width > height) {
        orientation = 'l';
      } else {
        orientation = 'p';
      }

      domtoimage.toBlob(htmlDiv, { width: width, height: height })
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
              pdf.addImage(imageData, 'PNG', (pdf.internal.pageSize.getWidth() - width) / 2, 20, width, height);
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

}
