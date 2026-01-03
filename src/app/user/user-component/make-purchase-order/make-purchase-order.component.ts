import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
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
interface PurchaseData {
    id: number;
    purchase_id: string;
    supplier_id: number;
    issue_date: string,
    expected_date: string;
    product_id: number;
    unit_price: number;
    quantity: number;
    sub_total: number;
    discount_in_rs: number;
    total: number;
    description: string;
    gst_calculation: number;
    gst_in_percent: number;
    sent_by: string | null;
    received_quantity: number;
    purpose: string;
    expected_user: string;
    currency: string;
    serial:number;
}

@Component({
  selector: 'app-make-purchase-order',
  templateUrl: './make-purchase-order.component.html',
  styleUrls: ['./make-purchase-order.component.scss']
})
export class MakePurchaseOrderComponent {

  @ViewChild('btnsupplierId') btnsupplierId!: ElementRef;
  purchaseForm: any;
  prchase_id: any;
  new_prchase_id: any;
  previousUrl: any;

  purchaseData:PurchaseData = {
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
    expected_user: '',
    currency: '₹',
    serial:0
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

  getAllcurrency: any[] = [];
  flattenedCurrencies: { code: string; symbol: string }[] = [];
  constructor(public adminService: AdminService, private sharedService: SharedService, private router: Router, private location: Location, private spinner: NgxSpinnerService) {

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
        ),
        this.sharedService.getsupplierdata().pipe(
          catchError(error => {
            console.error('Error fetching purchase data:', error);
            return throwError(error); // Pass the error downstream
          })
        ),
        this.sharedService.getProductdata().pipe(
          catchError(error => {
            console.error('Error fetching purchase data:', error);
            return throwError(error); // Pass the error downstream
          })
        ),
        this.sharedService.getCurrency().pipe(
          catchError(error => {
            console.error('Error fetching purchase data:', error);
            return throwError(error); // Pass the error downstream
          })
        )
      ]).subscribe(async ([getpurchasedatafrompo, getsupplierData, getproductData, getCurrency]) => {

        this.getpurchasedatafrompo = await JSON.parse(JSON.stringify(getpurchasedatafrompo));

        this.getpurchasedatafrompoArray.length = 0;

        this.getpurchasedatafrompo = await this.getpurchasedatafrompo
          .filter((e: any) => e.is_sent === 0)
          .forEach((item: any) => {
            this.getpurchasedatafrompoArray.push(item?.purchase_id);
          });



        this.getsupplierData = await JSON.parse(JSON.stringify(getsupplierData));

        // only take supplier which are approved items.status=="2"
        this.getsupplierData = sortByProperty(JSON.parse(JSON.stringify(this.getsupplierData)), 'supplier_name')
          .filter((items: any) => items.status == "3");


        for (let item of this.getsupplierData) {
          this.getsupplierDataArray.push(item?.supplier_name);
        }

        this.getproductData = await JSON.parse(JSON.stringify(getproductData));
        this.getproductData = sortByProperty(JSON.parse(JSON.stringify(this.getproductData)), 'product_name');

        // const getCurrencies = await JSON.parse(JSON.stringify(getCurrency));

        // console.log(getCurrencies, "getCurrencies");

        // //currency full code @10/06/2025 by ritik
        // //prioritise the INR, USD, GBP 
        // const priorityCodes = ['INR', 'USD', 'GBP', 'JPY'];
        // const prioritizedMap = new Map<string, any>();
        // // const prioritized: any[] = [];
        // const others: any[] = [];

        // for (const item of getCurrencies) {
        //   if (!item?.currencies || typeof item.currencies !== 'object') continue; // skip invalid or empty currency data

        //   const currencyKeys = Object.keys(item.currencies);
        //   if (!currencyKeys.length) continue;

        //   const rawCode = currencyKeys[0];
        //   const code = rawCode.trim().toUpperCase(); // ✅ Clean the currency code

        //   item.currencyCode = code; // Explicit code field for sort

        //   if (priorityCodes.includes(code)) {
        //     prioritizedMap.set(code, item);
        //     // prioritized.push(item);
        //   } else {
        //     others.push(item);
        //   }
        // }

        // // Sort "others" strictly by code
        // others.sort((a, b) => {
        //   const codeA = a.currencyCode;
        //   const codeB = b.currencyCode;
        //   return codeA.localeCompare(codeB, 'en', { sensitivity: 'base' }); // ✅ strict A-Z, case-insensitive
        // });

        // const sortedPriorityItems = priorityCodes
        //   .map(code => prioritizedMap.get(code))
        //   .filter(Boolean);

        // this.getAllcurrency = [...sortedPriorityItems, ...others];
        // console.log(this.getAllcurrency, "finalSortedList");
        // this.flattenedCurrencies = this.getAllCurrenciesFlattened();

        // console.log(this.getAllcurrency, "this.getAllcurrency");

        // Step 1: Clean and extract all currencies
        const rawCurrencies = await JSON.parse(JSON.stringify(getCurrency));

        const priorityCodes = ['INR', 'USD', 'GBP', 'JPY'];

        const allCurrencies: { code: string; symbol: string; name: string }[] = [];

        for (const country of rawCurrencies) {
          if (country.currencies && typeof country.currencies === 'object') {
            for (const [code, info] of Object.entries(country.currencies)) {
              const cleanCode = code.trim().toUpperCase();
              const cleanSymbol = (info as any).symbol?.trim() || '';
              const cleanName = (info as any).name?.trim() || '';

              if (cleanCode && !allCurrencies.find(c => c.code === cleanCode)) {
                allCurrencies.push({ code: cleanCode, symbol: cleanSymbol, name: cleanName });
              }
            }
          }
        }

        // Step 2: Split priority and others
        const prioritized = priorityCodes
          .map(code => allCurrencies.find(c => c.code === code))
          .filter(Boolean) as { code: string; symbol: string; name: string }[];

        const others = allCurrencies.filter(c => !priorityCodes.includes(c.code));

        // Step 3: Strict sort others
        others.sort((a, b) =>
          a.code.localeCompare(b.code, 'en', { sensitivity: 'base' })
        );

        // Step 4: Final list
        this.getAllcurrency = [...prioritized, ...others];


        // Step 5: Flatten if needed
        this.flattenedCurrencies = this.getAllcurrency.map(c => ({
          code: c.code,
          symbol: c.symbol,
        }));

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

  // getAllCurrenciesFlattened(): { code: string; symbol: string }[] {
  //   const allCurrencies: { code: string; symbol: string }[] = [];

  //   if (Array.isArray(this.getAllcurrency)) {
  //     this.getAllcurrency.forEach(country => {
  //       const currencies = country.currencies;
  //       if (currencies) {
  //         Object.entries(currencies).forEach(([code, data]: [string, any]) => {
  //           if (data?.symbol && !allCurrencies.find(c => c.code === code)) {
  //             allCurrencies.push({ code, symbol: data.symbol });
  //           }
  //         });
  //       }
  //     });
  //   }

  //   return allCurrencies;
  // }

  // getAllCurrenciesFlattened(): { code: string; symbol: string }[] {
  //   const allCurrencies: { code: string; symbol: string }[] = [];

  //   if (Array.isArray(this.getAllcurrency)) {
  //     this.getAllcurrency.forEach(country => {
  //       const currencies = country.currencies;
  //       if (currencies) {
  //         Object.entries(currencies).forEach(([code, data]: [string, any]) => {
  //           const cleanedCode = code.trim().toUpperCase(); // ✅ normalized
  //           if (
  //             cleanedCode !== 'GGP' &&
  //             data?.symbol &&
  //             !allCurrencies.find(c => c.code === cleanedCode)
  //           ) {
  //             allCurrencies.push({ code: cleanedCode, symbol: data.symbol });
  //           }
  //         });
  //       }
  //     });
  //   }

  //   return allCurrencies;
  // }



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
      this.grandtotalofpodata = Math.round(+this.grandtotalofpodata + item.total);
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


  // calculatesubtotal() {
  //   this.purchaseData.sub_total = +(Number(this.purchaseData.unit_price) * Number(this.purchaseData.quantity) - Number(this.purchaseData.discount_in_rs)).toFixed(2);
  //   this.calculateTotal();
  //   this.calculateGST();
  // }

  // calculateGST() {
  //   // console.log(this.purchaseData.gst_in_percent, "calculateGST");
  //   this.purchaseData.gst_calculation = +(Number(this.purchaseData.sub_total) * + Number(this.purchaseData.gst_in_percent)).toFixed(2);

  // }

  // calculateTotal() {
  //   this.purchaseData.total = +(Number(this.purchaseData.sub_total) + Number(this.purchaseData.gst_calculation)).toFixed(2);
  // }

  // helpers
private num(v: any): number { return Number.isFinite(+v) ? +v : 0; }
private round2(n: number): number { return Math.round((n + Number.EPSILON) * 100) / 100; }

recalcTotals() {
  const unit = this.num(this.purchaseData.unit_price);
  const qty = this.num(this.purchaseData.quantity);
  const maxDiscount = unit * qty;
  let discount = this.num(this.purchaseData.discount_in_rs);
  if (discount > maxDiscount) discount = maxDiscount;
  if (discount < 0) discount = 0;

  const sub = unit * qty - discount;
  const rate = this.num(this.purchaseData.gst_in_percent); // expect 0.05, 0.12, etc.
  const gst = sub * rate;
  const total = sub + gst;

  // keep data as NUMBERS (round, but don't turn into strings)
  this.purchaseData.sub_total = this.round2(sub);
  this.purchaseData.gst_calculation = this.round2(gst);
  this.purchaseData.total = this.round2(total);
}

// keep these for compatibility, call the single source of truth:
calculatesubtotal(){ this.recalcTotals(); }
calculateGST(){ this.recalcTotals(); }
calculateTotal(){ this.recalcTotals(); }



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
      this.purchaseData.discount_in_rs ||= 0; // Default to 0 if undefined or null

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
      // this.purchaseData.discount_in_rs = this.purchaseData.discount_in_rs ? this.purchaseData.discount_in_rs : 0;
      this.purchaseData.discount_in_rs ||= 0; // Default to 0 if undefined or null
      this.purchaseForm.get('currency')?.disable(); // To disable
      this.showVendorName = false;
      if (this.displaynewPurchaseId == true && this.displayexistingPurchaseId == false) {
        console.log(data, "data");
      //   not showing items from supplier table
        this.purchaseData.purchase_id = data.purchase_id;
        this.purchaseData.received_quantity = this.purchaseData.quantity;
        this.purchaseData.serial = this.purchaseData.serial + 1;

        this.poadddata.push(this.purchaseData);


      console.log(this.poadddata, "poadddata before inserting po");


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
        this.purchaseData.received_quantity = this.purchaseData.quantity;
        this.purchaseData.discount_in_rs ||= 0; // Default to 0 if undefined or null
        this.purchaseData.serial = this.purchaseData.serial + 1;

        console.log(this.poadddata, "poadddata before inserting po");
        
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
        console.log(result, "result at getpurchaseOrderdatabyPid")
        this.getpurchaseOrderDatabypid = result;
        this.selectSupplier = result[0].supplier_name;
        // this.purchaseForm.controls['supplier_id']?.patchValue(this.selectSupplier);
        let tempIssueDate = moment(result[0].issue_date).format('YYYY-MM-DD');
        let tempExpectedeDate = moment(result[0].expected_date).format('YYYY-MM-DD');
        this.purchaseForm.controls['issue_date']?.patchValue(tempIssueDate);
        this.purchaseForm.controls['expected_date']?.patchValue(tempExpectedeDate);
        this.purchaseForm.controls['gst_in_percent']?.patchValue(0);
        this.purchaseForm.controls['currency']?.patchValue(result[0].currency);

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
    let oldID = "APV-000/2023";
    this.sharedService.getlastPurchaseid().subscribe((results: any) => {
      this.prchase_id = results[0].purchase_id;

      if (results[0].purchase_id != '' || undefined || null) {
        oldID = JSON.stringify(this.prchase_id);
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

      let newpurchaseid = "APV-" + newId + "/" + new Date().getFullYear();
      this.new_prchase_id = newpurchaseid;
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

    this.purchaseForm.patchValue(
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
        expected_user: data?.expected_user,
        currency: data?.currency
      }
    )

    console.log(data?.gst_in_percent, "data?.gst_in_percent");
    this.purchaseData.purchase_id = data?.purchase_id;
    this.purchaseData.serial = data?.serial;
    this.purchaseData.sent_by = localStorage.getItem('login_id');
    this.purchaseData.id = data?.id;
  }

  async updatepo() {
    console.log(this.purchaseData, "purchaseData before update po");

      this.purchaseData.discount_in_rs ||= 0; // Default to 0 if undefined or null

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

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success ml-2 text-light',
        cancelButton: 'btn btn-danger text-light'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const results: any = await this.adminService.deletePO(ID).toPromise();
          console.log(results.message, "deletePO");

          if (results && results?.message == "Deleted successfully") {
            window.location.reload();
            // return;
          }


          await this.getpurchaseitemdatafrompid(this.purchaseData.purchase_id);

          // this.adminService.deletePO(ID).subscribe({
          //   next: (result: any) => {

          //   },
          //   error: (error) => {
          //     console.error(error);
          //   }
          // });

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
        catch (err) {
          console.error(err);
        }
      }
      else {
        console.log('User cancelled deletion');
      }
    })
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
      currency: new FormControl('₹', [Validators.required]),
    });

    this.calculatesubtotal();

  }

  navigateToNewRoute() {
    this.previousUrl = this.location.path();
    localStorage.setItem('backUrl', this.previousUrl);
  }



}
