import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { throwError, catchError } from 'rxjs';
import { Location } from '@angular/common';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerService } from "ngx-spinner";
import { MatDialog } from '@angular/material/dialog';
import { AddVendorComponent } from '../add-vendor/add-vendor.component';

@Component({
  selector: 'app-make-directpurchase-order',
  templateUrl: './make-directpurchase-order.component.html',
  styleUrls: ['./make-directpurchase-order.component.scss']
})
export class MakeDirectpurchaseOrderComponent {

  @ViewChild('btnsupplierId') btnsupplierId!: ElementRef;
  purchaseForm: any;
  purchase_id: any;
  new_purchase_id: any;
  previousUrl: any;

  purchaseData = {
    id: 0,
    purchase_id: '',
    supplier_id: 0,
    issue_date: '',
    expected_date: '',
    product_id: 0,
    unit_price: 1,
    quantity: 1,
    sub_total: 0,
    discount_in_rs: 0,
    total: 0,
    description: '',
    gst_calculation: 0,
    gst_in_percent: 0,
    sent_by: localStorage.getItem('login_id'),
    received_quantity: 0,
    purpose: '',
    expected_user: ''
  }

  supplierName = {
    supplier_name: ''
  }

  getsupplierData: any;
  getpurchasedatafrompoArray: any = [];
  getsupplierDataArray: any = [];

  selectedSupplier: any;
  clickedSupplierbtn: boolean = false;
  clickedPurchaseIdbtn: boolean = false;
  selectedPurchaseId: any;
  getproductData: any;

  getsupplierId: any;
  getproductId: any;

  getpurchasedatafrompo: any;    //purchase order
  getpurchaseOrderDatabypid: any;
  selectedpurchaseId: any;

  searchText = '';
  searchText2 = '';

  displaynewPurchaseId = true;               //new_purchase_id element to hide/show        
  displayexistingPurchaseId = false;             //existing purchase_id element to hide/show
  showingPurchaseIdList = false;             //existing purchase_id to hide/show
  makeVendorreadOnly = false;                 // property binding
  showVendorName = false;              //for supplier list  to hide/show
  makepurchaseIdreadonly = false;
  EvaluationArray: string[] = [];
  averageGradingVar: any;

  poadddata: any[] = [];
  editIndex: number = -1;
  grandtotalofpodata: number = 0;
  getpurchaseitemdata: any;
  displayaupdatebtn = false;
  discountExceedsTotalError = false;
  expecteddatevalidation = false;
  constructor(public adminService: AdminService, private sharedService: SharedService, private router: Router, 
    private location: Location, private spinner: NgxSpinnerService, private dialog: MatDialog) {

    // const currentDate = new Date();
    // const expectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()+1);
    this.purchaseData.issue_date = moment().format('YYYY-MM-DD');

  };

  ngOnInit() {
    this.validation();
    this.getNewPurchaseID();                                                                  //this is for showing new id on everyload....
    this.getAlldataatonce();
  }

  async getAlldataatonce() {
    this.spinner.show();
    try {
      // Reusable sorting function
      const sortByProperty = (arr: any[], propertyName: string) => {
        return arr.sort((a, b) => {
          const itemA = a[propertyName].toUpperCase();
          const itemB = b[propertyName].toUpperCase();
          return itemA.localeCompare(itemB);
        });
      };

      forkJoin([
        this.sharedService.getpurchasedatafromPurchaseOrder().pipe(
          catchError(error => {
            console.error('Error fetching purchase data:', error);
            return throwError(error); // Pass the error downstream
          })
        ).toPromise(),
        this.sharedService.getsupplierdata().pipe(
          catchError(error => {
            console.error('Error fetching purchase data:', error);
            return throwError(error); // Pass the error downstream
          })
        ).toPromise(),
        this.sharedService.getProductdata().pipe(
          catchError(error => {
            console.error('Error fetching purchase data:', error);
            return throwError(error); // Pass the error downstream
          })
        ).toPromise()
      ]).subscribe(async ([getpurchasedatafrompo, getsupplierData, getproductData]) => {
        this.getpurchasedatafrompo = await JSON.parse(JSON.stringify(getpurchasedatafrompo));

        this.getpurchasedatafrompoArray.length = 0;

        this.getpurchasedatafrompo = await this.getpurchasedatafrompo
          .filter((e: any) => e.is_sent === 0)
          .forEach((item: any) => {
            this.getpurchasedatafrompoArray.push(item?.purchase_id);
          });



        this.getsupplierData = await JSON.parse(JSON.stringify(getsupplierData));

        this.getsupplierData = sortByProperty(JSON.parse(JSON.stringify(this.getsupplierData)), 'supplier_name');

        for (let item of this.getsupplierData) {
          this.getsupplierDataArray.push(item?.supplier_name);
        }

        this.getproductData = await JSON.parse(JSON.stringify(getproductData));
        this.getproductData = sortByProperty(JSON.parse(JSON.stringify(this.getproductData)), 'product_name');

        console.log(this.getpurchasedatafrompoArray, "this.getpurchasedatafrompoArray");
      })
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

  selectSupplier(data: any) {
    this.clickedSupplierbtn = true;
    this.showVendorName = false;
    this.getsupplierId = data?.supplier_id;
    this.purchaseData.supplier_id = data?.supplier_id;
  }

  showData() {
    if (this.makeVendorreadOnly == true || this.makepurchaseIdreadonly == true) {
      this.showVendorName = false;
    }
    else {
      this.showVendorName = true;
    }
  }

  hidedata() {
    this.showVendorName = false;
  }

  selectPurchaseid(data: any) {
    this.poadddata.length = 0;

    if (this.displayexistingPurchaseId == true && this.displaynewPurchaseId == false) {
      this.purchaseData.product_id = 0;
      this.purchaseData.unit_price = 1;
      this.purchaseData.quantity = 1;
      this.purchaseData.sub_total = 0;
      this.purchaseData.discount_in_rs = 0;
      this.purchaseData.total = 0;
      this.purchaseData.description = '';
      this.purchaseData.total = 0;
      this.purchaseData.gst_in_percent = 0;
      this.purchaseData.sent_by = '';
      this.purchaseData.received_quantity = 0;
      this.purchaseData.purpose = '';
      this.purchaseData.expected_user = '';
      this.getpurchaseorderDatabyPid(data);
      this.getpurchaseitemdatafrompid(data);

      this.searchText2 = data;
      this.purchaseData.purchase_id = data;
      this.showingPurchaseIdList = false;
      this.clickedSupplierbtn = true;
    }

    this.selectedPurchaseId = data;
    this.purchaseData.purchase_id = data;
    this.showingPurchaseIdList = false;
    this.clickedSupplierbtn = true;
    this.clickedPurchaseIdbtn = false;
    // console.log(this.purchaseData, "purchasedata");
    // this.poadddata.push(this.purchaseData);
  }

  handleInput(event: any) {
    let value = parseFloat(event.target.value);
    if (isNaN(value) || value < 0) {
      event.target.value = ''; // Reset to empty if invalid input (optional)
    } else {
      event.target.value = value.toFixed(2); // Round to 2 decimal places (optional)
    }
    this.purchaseData.unit_price = event.target.value;
    // Optionally, you can trigger your calculation function here if needed
    this.calculatesubtotal();
  }


  async getpurchaseitemdatafrompid(purchase_id: string) {
    const Pid = {
      purchase_id: purchase_id
    }
    this.getpurchaseitemdata = await this.sharedService.getPurchaseJoinDatabyPid(Pid).toPromise();
    this.grandtotalofpodata = 0;

    this.getpurchaseitemdata = await this.getpurchaseitemdata.map((item: any) => {
      this.grandtotalofpodata = +this.grandtotalofpodata + item.total;
      item.editMode = false;
      return item;
    })
  }

  showData2() {
    this.showingPurchaseIdList = true;
  }

  hidedata2() {
    this.showingPurchaseIdList = false;
  }


  calculatesubtotal() {
    this.purchaseData.sub_total = +(+this.purchaseData.unit_price * +this.purchaseData.quantity - this.purchaseData.discount_in_rs);
    this.calculateTotal();
    this.calculateGST();

  }

  calculateGST() {
    console.log(this.purchaseData.gst_in_percent, "calculateGST");
    this.purchaseData.gst_calculation = +(+ this.purchaseData.sub_total * + this.purchaseData.gst_in_percent).toFixed(2);


  }

  calculateTotal() {
    this.purchaseData.total = +(this.purchaseData.sub_total + this.purchaseData.gst_calculation);
  }

  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }

  }

  async getProductDatabyproductId(id: any) {
    const productId = {
      "product_id": + id
    }

    try {
      const results: any = await this.sharedService.getProductnamebyid(productId).toPromise();
      // console.log(results, "product_name");
      return results;
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
  }

  perchaseOrdergenerate(data: any) {

    if (this.purchaseForm.invalid) {
      this.purchaseForm.controls['supplier_id'].markAsTouched();
      this.purchaseForm.controls['product_id'].markAsTouched();
      this.purchaseForm.controls['unit_price'].markAsTouched();
      this.purchaseForm.controls['quantity'].markAsTouched();
      this.purchaseForm.controls['purchase_id'].markAsTouched();
      this.purchaseForm.controls['expected_date'].markAsTouched();
      this.purchaseForm.controls['purpose'].markAsTouched();
      this.purchaseForm.controls['expected_user'].markAsTouched();
      this.purchaseForm.controls['description'].markAsTouched();
    }

    else if (this.purchaseData.discount_in_rs > (this.purchaseData.unit_price * this.purchaseData.quantity)) {
      this.discountExceedsTotalError = true;
    }

    else if (this.purchaseData.expected_date < this.purchaseData.issue_date) {
      this.purchaseData.expected_date ? this.expecteddatevalidation = true : this.expecteddatevalidation = false;
    }

    else {
      // property binding for supplier_name to readonly....
      this.discountExceedsTotalError = false;
      this.makeVendorreadOnly = true;
      this.showVendorName = false;
      if (this.displaynewPurchaseId == true && this.displayexistingPurchaseId == false) {
        console.log(data, "data");
        //   not showing items from supplier table
        this.purchaseData.purchase_id = data.purchase_id;
        this.purchaseData.received_quantity = this.purchaseData.quantity;
        console.log(this.poadddata, "podatafornewpid");
        this.poadddata.push(this.purchaseData);
        this.adminService.makenewPurchaseOrder(this.poadddata).subscribe(
          {
            next: (results: any) => {
              this.poadddata.length = 0;
              Swal.fire({
                title: 'Success!',
                text: 'PO generated Successfully...',
                icon: 'success',
              }).then(() => {
                this.getpurchaseitemdatafrompid(this.purchaseData.purchase_id);
                this.purchaseData.product_id = 0;
                this.purchaseData.unit_price = 1;
                this.purchaseData.quantity = 1;
                this.purchaseData.sub_total = 0;
                this.purchaseData.discount_in_rs = 0;
                this.purchaseData.total = 0;
                this.purchaseData.description = '';
                this.purchaseData.total = 0;
                this.purchaseData.gst_in_percent = 0;
                this.purchaseData.gst_calculation = 0;
                this.purchaseData.sent_by = '';
                this.purchaseData.received_quantity = 0;
                this.poadddata.length = 0;
                this.purchaseData.purpose = '';
                this.purchaseData.expected_user = '';
                this.purchaseForm.markAsUntouched();
              })
            }, error: (error) => {
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

      else {
        console.log('In existing purhcaseId');
        this.poadddata.length = 0;
        console.log(this.poadddata, "podataforexistingpid");
        this.poadddata.push(this.purchaseData);
        this.adminService.makenewPurchaseOrder(this.poadddata).subscribe(
          {
            next: (results: any) => {
              Swal.fire({
                title: 'Success!',
                text: 'PO updated Successfully...',
                icon: 'success',
              }).then(() => {
                this.getpurchaseitemdatafrompid(this.purchaseData.purchase_id);
                this.purchaseData.product_id = 0;
                this.purchaseData.unit_price = 1;
                this.purchaseData.quantity = 1;
                this.purchaseData.sub_total = 0;
                this.purchaseData.discount_in_rs = 0;
                this.purchaseData.total = 0;
                this.purchaseData.description = '';
                this.purchaseData.total = 0;
                this.purchaseData.gst_in_percent = 0;
                this.purchaseData.gst_calculation = 0;
                this.purchaseData.sent_by = '';
                this.purchaseData.received_quantity = 0;
                this.poadddata.length = 0;
                this.purchaseData.purpose = '';
                this.purchaseData.expected_user = '';
                this.purchaseForm.markAsUntouched();
              })

            }, error: (error) => {
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
                  text: 'Token expired. Please login..',
                  footer: '<a href="../login">Login..</a>'
                }).then(() => {
                  this.router.navigate(['../login']);
                })
              }
            }
          })
      }
    }

  }


  getpurchaseorderDatabyPid(p_id: any) {
    if (p_id && p_id !== null) {

      this.makeVendorreadOnly = false;
      this.makepurchaseIdreadonly = false;

      let purchaseOrderPid = {
        purchase_id: p_id
      }
      this.sharedService.getpurchaseOrderdatabyPid(purchaseOrderPid).subscribe((result: any) => {
        this.getpurchaseOrderDatabypid = result;
        this.selectSupplier = result[0].supplier_name;
        // this.purchaseForm.controls['supplier_id']?.patchValue(this.selectSupplier);
        let tempIssueDate = moment(result[0].issue_date).format('YYYY-MM-DD');
        let tempExpectedeDate = moment(result[0].expected_date).format('YYYY-MM-DD');
        this.purchaseForm.controls['issue_date']?.patchValue(tempIssueDate);
        this.purchaseForm.controls['expected_date']?.patchValue(tempExpectedeDate);
        this.purchaseForm.controls['gst_in_percent']?.patchValue(0);
        this.makeVendorreadOnly = true;
        this.makepurchaseIdreadonly = true;
        this.showVendorName = false;
        this.showingPurchaseIdList = false;
        // if(this.purchaseData.supplier_id==0){
        this.purchaseData.supplier_id = + result[0].supplier_id;
        console.log(this.purchaseData, "this.purchaseData")
        // }
      })
    }

  }


  //PURCHASE ID PATTERN
  getNewPurchaseID() {
    let oldID = "DP-000/2023";
    this.sharedService.getLastdirectpurchaseId().subscribe((results: any) => {
      // if(results[0]){

      this.purchase_id = results[0] ? results[0].purchase_id : oldID;

      if (results[0] && results[0].purchase_id != '' || undefined || null) {
        oldID = JSON.stringify(this.purchase_id);
      }

      let newIdsplit = oldID.replace('/', '-').split('-');
      let midInt: number = + newIdsplit[1] + 1;

      let newIdintoString = JSON.stringify(midInt);

      let newId = '';

      if (newIdintoString.length == 1) {
        newId = '00' + newIdintoString;
      }
      else if (newIdintoString.length == 2) {
        newId = '0' + newIdintoString;
      }
      else {
        newId = newIdintoString;
      }

      let newpurchaseid = "DP-" + newId + "/" + new Date().getFullYear();
      this.new_purchase_id = newpurchaseid;
      // }

      // return newpurchaseid;
    })
  }

  newPurchaseId() {
    location.reload();
    this.displaynewPurchaseId = true;
    this.displayexistingPurchaseId = false;

  }

  existingPurchaseId() {
    // this.showingPurchaseIdList = true;
    this.clickedPurchaseIdbtn = true;
    this.getAlldataatonce();
    if (this.getpurchaseitemdata && this.getpurchaseitemdata.length) {
      this.getpurchaseitemdata.length = 0
    }

    this.purchaseForm.supplier_id = 0;
    this.displaynewPurchaseId = false;

    this.displayexistingPurchaseId = true;

    this.poadddata.length = 0;
  }

  productId(id: any) {
    this.purchaseData.product_id = id.product_id;
  }

  VendorEvaluationDatabysupplierid(id: any) {
    this.sharedService.getsupplierEvaluationdatabysupplierId(id).subscribe(
      {
        next: (results: any) => {

          let supplierEvaluationData = JSON.parse(JSON.stringify(results));
          // console.log(supplierEvaluationData);
          supplierEvaluationData.map((e: any) => {
            this.EvaluationArray.push(e.qualitybasis_grading, e.pricebasis_grading, e.communicationbasis_grading, e.deliverybasis_grading, e.commitmentbasis_grading);

          })
          let supplierDatalength = results.length;
          // this.EvaluationArray = this.EvaluationArray.map(this.convertGrading);

          // The below process is to evaluate the average calculation and rating of evaluation  of the vendor....
          let sumofEvaluation = this.processGradesAndSum(this.EvaluationArray);
          let avgofSumofEvaluation = this.processGradesAndSum(this.EvaluationArray) / +sumofEvaluation;
          // console.log(sumofEvaluation, avgofSumofEvaluation);

          this.averageGrading(avgofSumofEvaluation);
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

  processGradesAndSum(gradingarr: any) {
    let sum = 0;
    for (let i = 0; i < gradingarr.length; i++) {
      const grade = gradingarr[i];

      switch (grade) {
        case "A":
          gradingarr[i] = 3;
          sum += 3;
          break;
        case "B":
          gradingarr[i] = 2;
          sum += 2
          break;
        case "C":
          gradingarr[i] = 1;
          sum += 1
          break;
        default:

          // If the grade is not A, B, or C, leave it as is and ignore for sum
          if (typeof grade === 'number' && !isNaN(grade)) {
            sum += grade;
          }
      }
    }
    return sum
  }

  //average calculation converted into average rating...
  averageGrading(grade: number) {
    // console.log(grade, "grade");
    if (!isNaN(grade) && grade !== null) {
      if (grade <= 12) {
        this.averageGradingVar = "C";
      }
      else if (grade == 12) {
        this.averageGradingVar = "B"

      }
      else {
        this.averageGradingVar = "A"
      }
    }
    else {
      this.averageGradingVar = "Not Defined Yet"
    }

  }

  async editpo(data: any) {
    const Pid = {
      purchase_id: data?.purchase_id
    }
    this.poadddata.length = 0;
    this.displayaupdatebtn = true;

    this.getpurchaseitemdata = await this.sharedService.getPurchaseJoinDatabyPid(Pid).toPromise();

    console.log(this.getpurchaseitemdata, "this.getpurchaseitemdata");

    this.purchaseForm.setValue(
      {
        purchase_id: data?.purchase_id,
        issue_date: moment(this.getpurchaseitemdata?.issue_date).format('YYYY-MM-DD'),
        expected_date: moment(this.getpurchaseitemdata?.expected_date).format('YYYY-MM-DD'),
        product_id: data?.product_id,
        supplier_id: data?.supplier_id,
        unit_price: data?.unit_price,
        quantity: data?.quantity,
        sub_total: data?.sub_total,
        discount_in_rs: data?.discount_in_rs,
        total: data?.total,
        description: data?.description,
        gst_calculation: + data?.gst_calculation,
        gst_in_percent: data?.gst_in_percent,
        purpose: data?.purpose,
        expected_user: data?.expected_user
      }
    )

    console.log(data?.gst_in_percent, "data?.gst_in_percent");
    this.purchaseData.purchase_id = data?.purchase_id;
    this.purchaseData.sent_by = localStorage.getItem('login_id');
    this.purchaseData.id = data?.id;
  }

  async updatepo() {
    console.log(this.purchaseData);
    // delete this.purchaseData.id;
    await this.adminService.updatePO(this.purchaseData).toPromise()

      .then((results: any) => {

        this.getpurchaseitemdatafrompid(this.purchaseData.purchase_id);

        console.log(results, "updatepo");
        this.poadddata.length = 0;
        this.purchaseData.product_id = 0;
        this.purchaseData.unit_price = 1;
        this.purchaseData.quantity = 1;
        this.purchaseData.sub_total = 0;
        this.purchaseData.discount_in_rs = 0;
        this.purchaseData.total = 0;
        this.purchaseData.description = '';
        this.purchaseData.total = 0;
        this.purchaseData.gst_in_percent = 0;
        this.purchaseData.gst_calculation = 0;
        this.purchaseData.sent_by = '';
        this.purchaseData.received_quantity = 0;
        this.purchaseData.purpose = '';
        this.purchaseData.expected_user = '';
        this.displayaupdatebtn = false;
        this.purchaseForm.markAsUntouched();
      })


  }


  deletepo(value: any) {
    console.log(value, "delete po");
    const ID = {
      id: + value.id
    }

    this.adminService.deletePO(ID).subscribe({
      next: (result: any) => {
        console.log(result);
        this.getpurchaseitemdatafrompid(this.purchaseData.purchase_id);
      },
      error: (error) => {
        console.error(error);
      }
    });

    this.poadddata.length = 0;
    this.purchaseData.product_id = 0;
    this.purchaseData.unit_price = 1;
    this.purchaseData.quantity = 1;
    this.purchaseData.sub_total = 0;
    this.purchaseData.discount_in_rs = 0;
    this.purchaseData.total = 0;
    this.purchaseData.description = '';
    this.purchaseData.total = 0;
    this.purchaseData.gst_in_percent = 0;
    this.purchaseData.sent_by = '';
    this.purchaseData.received_quantity = 0;
    this.purchaseData.purpose = '';
    this.purchaseData.expected_user = '';
    this.purchaseForm.markAsUntouched();
  }


  validation() {
    this.purchaseForm = new FormGroup({
      purchase_id: new FormControl('', [Validators.required]),
      issue_date: new FormControl(moment().format('YYYY-MM-DD'), [Validators.required]),
      expected_date: new FormControl('', [Validators.required]),
      product_id: new FormControl(0, [Validators.required, Validators.pattern(/^[1-9][0-9]*$/)]),
      supplier_id: new FormControl(0, [Validators.required, Validators.pattern(/^[1-9][0-9]*$/)]),
      unit_price: new FormControl(1, [Validators.required]),
      quantity: new FormControl(1, [Validators.required]),
      sub_total: new FormControl(0),
      discount_in_rs: new FormControl(0),
      total: new FormControl(0),
      description: new FormControl('', [Validators.required]),
      gst_calculation: new FormControl(0),
      gst_in_percent: new FormControl(0),
      purpose: new FormControl('', [Validators.required]),
      expected_user: new FormControl('', [Validators.required]),
    });

    this.calculatesubtotal();
  }

  confirmSubmittion() {
    Swal.fire({
      title: "Do you want to save the changes?",
      html:"<p>You can't edit PO after this action!</p>",
      showDenyButton: true,
      confirmButtonText: "Submit",
      denyButtonText: `Cancel`
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
          this.adminService.updatesentaApprovedinpurchaseOrder(this.purchaseData).subscribe(
      {
        next: (results: any) => {
          const getResponse = results;
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: getResponse.update_sent_approvedpurchaseorder,
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            this.ngOnInit();
          })
        }, error: (error) => {
          // console.log('error')
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

      Swal.fire("Saved!", "", "success");
      } 
      else if (result.isDenied) {
        Swal.fire("Submittion denied!", "", "info");
      }
    });

  }

  navigateToNewRoute() {
    this.previousUrl = this.location.path();
    localStorage.setItem('backUrl', this.previousUrl);
  }


  openAddVendordialog():void{
    const dialogRef = this.dialog.open(AddVendorComponent,
     {
      width:'1500px',
      maxHeight: '80vh',
      height: 'auto',
    }
    );
  }
}
