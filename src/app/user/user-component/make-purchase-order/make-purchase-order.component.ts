import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { firstValueFrom, forkJoin } from 'rxjs';
import { throwError, catchError } from 'rxjs';
import { Location } from '@angular/common';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerService } from "ngx-spinner";

interface PurchaseData {
  id: number;
  purchase_id: any;
  supplier_id: number | null;
  issue_date: string,
  expected_date: string;
  product_id: number | null;
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
  serial: number;
  // discount_mode: 'before' | 'after';
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

  purchaseData: PurchaseData = {
    id: 0,
    purchase_id: null,
    supplier_id: null,
    issue_date: '',
    expected_date: '',
    product_id: null,
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
    serial: 0,
    // discount_mode: 'before',
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

  poLevelDiscount = {
    type: 'rs',         // rs | percent
    value: 0,           // discount in rs (MAIN VALUE SAVED)
    percent: 0,         // helper only for UI
    calculatedRs: 0
  };

  finalPoTotal: number = 0;
  storedPercent: number = 0;
  storedGrandTotal: number = 0;
  private isReapplying = false;
  isPODiscountChanged = false;

  constructor(public adminService: AdminService, private sharedService: SharedService,
    private router: Router, private location: Location, private spinner: NgxSpinnerService) {

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
    // 🔥 1️⃣ Recalculate Grand Total

    if (this.selectedPurchaseId !== data) {
      this.poLevelDiscount = {
        type: 'rs',
        value: 0,
        percent: 0,
        calculatedRs: 0
      };
    }

    if (this.displayexistingPurchaseId == true && this.displaynewPurchaseId == false) {
      this.purchaseData.product_id = null;
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


  // async getpurchaseitemdatafrompid(purchase_id: string) {
  //   const Pid = {
  //     purchase_id: purchase_id
  //   }
  //   this.getpurchaseitemdata = await this.sharedService.getPurchaseJoinDatabyPid(Pid).toPromise();
  //   console.log(this.getpurchaseitemdata, "this.getpurchaseitemdata");

  //   this.grandtotalofpodata = 0;
  //   // 🔹 Store old total before recalculating
  //   const oldTotal = this.previousGrandTotal || 0;

  //   // this.getpurchaseitemdata = await this.getpurchaseitemdata.map((item: any) => {
  //   //   this.grandtotalofpodata = Math.round(+this.grandtotalofpodata + item.total);
  //   //   item.editMode = false;
  //   //   return item;
  //   // });

  //   this.getpurchaseitemdata.forEach((item: any) => {
  //     this.grandtotalofpodata += Number(item.total || 0);
  //     item.editMode = false;
  //   });

  //   // round once at end
  //   this.grandtotalofpodata = this.round2(this.grandtotalofpodata);

  //   const newTotal = this.grandtotalofpodata;

  //   // 🔥 Restore PO discount HERE (after total is ready)

  //   const firstRow = this.getpurchaseitemdata[0];

  //   if (firstRow?.po_discount && Number(firstRow.po_discount) > 0) {

  //     const savedRs = Number(firstRow.po_discount);
  //     const baseTotal = this.grandtotalofpodata;

  //     this.poLevelDiscount.type = firstRow.discount_type || 'rs';

  //     // Always restore rupee value
  //     this.poLevelDiscount.value = savedRs;

  //     // 🔥 If type is percent → calculate percent manually
  //     if (this.poLevelDiscount.type === 'percent' && baseTotal > 0) {

  //       this.poLevelDiscount.percent = this.round2((savedRs / baseTotal) * 100);
  //       // const newDiscount = (this.grandtotalofpodata * this.poLevelDiscount.percent) / 100;
  //       // this.poLevelDiscount.percent = (this.poLevelDiscount.value / this.grandtotalofpodata) * 100;
  //       // this.confirmRecalculateDiscount();


  //       // this.poLevelDiscount.value = this.round2(newDiscount);
  //     }

  //   } else {

  //     this.poLevelDiscount.type = 'rs';
  //     this.poLevelDiscount.value = 0;
  //     this.poLevelDiscount.percent = 0;
  //   }

  //   // Save current total as baseline
  //   this.previousGrandTotal = this.grandtotalofpodata;

  //   // ✅ IMPORTANT
  //   this.calculateFinalTotal();

  //     // 🔥 Detect total change ONLY after first load
  // const totalChanged = oldTotal > 0 && oldTotal !== newTotal && this.poLevelDiscount.type === 'percent';

  // // 🔹 Update baseline
  // this.previousGrandTotal = newTotal;

  // // 🔥 Show popup only if total actually changed
  // if (totalChanged) {
  //   this.confirmRecalculateDiscount();
  // }

  // }

  async getpurchaseitemdatafrompid(purchase_id: string) {

    const Pid = { purchase_id };

    this.getpurchaseitemdata =
      await this.sharedService.getPurchaseJoinDatabyPid(Pid).toPromise();

    // 🔥 1️⃣ Recalculate Grand Total
    this.grandtotalofpodata = 0;

    this.getpurchaseitemdata.forEach((item: any) => {
      this.grandtotalofpodata += Number(item.total || 0);
      item.editMode = false;
    });

    this.grandtotalofpodata = this.round2(this.grandtotalofpodata);

    const firstRow = this.getpurchaseitemdata?.[0];

    // 🔥 2️⃣ Restore Discount
    if (firstRow?.po_discount && Number(firstRow.po_discount) > 0) {

      const savedRs = Number(firstRow.po_discount);
      const discountType = firstRow.discount_type || 'rs';

      this.poLevelDiscount.type = discountType;
      this.poLevelDiscount.value = savedRs;

      if (discountType === 'percent') {

        const calculatedPercent =
          this.grandtotalofpodata > 0
            ? this.round2((savedRs / this.grandtotalofpodata) * 100)
            : 0;

        this.poLevelDiscount.percent = calculatedPercent;

        // 🔥 First time baseline store
        if (!this.storedGrandTotal) {
          this.storedPercent = calculatedPercent;
          this.storedGrandTotal = this.grandtotalofpodata;
        }
      }
    }

    // =====================================================
    // 🔥 3️⃣ CHANGE DETECTION (SAFE VERSION)
    // =====================================================

    if (
      !this.isReapplying &&   // 🚀 important fix
      this.poLevelDiscount.type === 'percent' &&
      this.storedPercent > 0 &&
      this.storedGrandTotal > 0 &&
      this.grandtotalofpodata !== this.storedGrandTotal
    ) {

      const newPercent =
        this.round2(
          (this.poLevelDiscount.value / this.grandtotalofpodata) * 100
        );

      if (newPercent !== this.storedPercent) {
        this.confirmRecalculateDiscount();
      }
    }

    // =====================================================

    this.calculateFinalTotal();
  }

  isPoLevelDiscountApplied(): boolean {
    return Number(this.poLevelDiscount?.value || 0) > 0;
  }


  confirmRecalculateDiscount() {

    Swal.fire({
      title: 'Recalculate Discount?',
      text: `Reapply ${this.storedPercent}% discount?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {

      if (result.isConfirmed) {

        this.isReapplying = true;   // 🚀 prevent detection loop

        // 🔥 Show timer loading popup
        Swal.fire({
          title: 'Reapplying Discount...',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // ✅ Reapply original percent
        this.poLevelDiscount.percent = this.storedPercent;

        const newDiscount =
          (this.grandtotalofpodata * this.storedPercent) / 100;

        this.poLevelDiscount.value = this.round2(newDiscount);

        this.calculateFinalTotal();

        // 🔥 Save in DB
        this.adminService.applyFinalDiscount({
          purchase_id: this.purchaseData.purchase_id,
          po_discount: this.poLevelDiscount.value,
          discount_type: 'percent'
        }).subscribe(() => {

          // update baseline
          this.storedGrandTotal = this.grandtotalofpodata;

          this.isReapplying = false;

          // refresh safely
          this.getpurchaseitemdatafrompid(this.purchaseData.purchase_id);
        });

      } else {

        // ❌ User chose NO
        // Keep new calculated percent (like 9.8%)

        this.poLevelDiscount.percent =
          this.round2(
            (this.poLevelDiscount.value / this.grandtotalofpodata) * 100
          );

        this.calculateFinalTotal();

        // update baseline so popup does not repeat
        this.storedGrandTotal = this.grandtotalofpodata;
      }

    });
  }




  recalculateAndApplyDiscount() {

    const baseTotal = this.num(this.grandtotalofpodata);

    const newDiscount =
      (baseTotal * this.poLevelDiscount.percent) / 100;

    this.poLevelDiscount.value = this.round2(newDiscount);

    this.calculateFinalTotal();

    // 🔥 Timer Swal only (no success popup)
    Swal.fire({
      title: 'Recalculating & Applying Discount...',
      timer: 1200,
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Call API silently
    this.adminService.applyFinalDiscount({
      purchase_id: this.purchaseData.purchase_id,
      po_discount: this.poLevelDiscount.value,
      discount_type: this.poLevelDiscount.type
    }).subscribe({
      next: () => { },
      error: () => { }
    });
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
  // private round2(n: number): number { return Math.round((n + Number.EPSILON) * 100) / 100; }
  private round2(n: number): number {
    const val = Math.round((n + Number.EPSILON) * 100) / 100;
    return val === 0 ? 0 : val;
  }

  // recalcTotals() {
  //   const unit = this.num(this.purchaseData.unit_price);
  //   const qty = this.num(this.purchaseData.quantity);
  //   const maxDiscount = unit * qty;
  //   let discount = this.num(this.purchaseData.discount_in_rs);
  //   if (discount > maxDiscount) discount = maxDiscount;
  //   if (discount < 0) discount = 0;

  //   const sub = unit * qty - discount;
  //   const rate = this.num(this.purchaseData.gst_in_percent); // expect 0.05, 0.12, etc.
  //   const gst = sub * rate;
  //   const total = sub + gst;

  //   // keep data as NUMBERS (round, but don't turn into strings)
  //   this.purchaseData.sub_total = this.round2(sub);
  //   this.purchaseData.gst_calculation = this.round2(gst);
  //   this.purchaseData.total = this.round2(total);
  // }

  //   recalcTotals() {
  //     const unit = this.num(this.purchaseData.unit_price);
  //     const qty = this.num(this.purchaseData.quantity);
  //     // let discount = this.num(this.purchaseData.discount_in_rs);
  //     let discount = this.num(this.purchaseForm.get('discount_in_rs')?.value);
  //     const rate = this.num(this.purchaseData.gst_in_percent);

  //     const baseAmount = unit * qty;

  //     // prevent excess discount
  //  if (discount > baseAmount) {
  //    this.discountExceedsTotalError = true;
  //    discount = baseAmount; // only for calculation, DO NOT write back to form
  // } else {
  //    this.discountExceedsTotalError = false;
  // }
  //     if (discount < 0) discount = 0;

  //     const mode = this.purchaseForm.get('discount_mode')?.value;
  //     const isPostDiscount = (mode === 'after');


  //     let subTotal = 0;
  //     let gst = 0;
  //     let total = 0;

  //     if (!isPostDiscount) {
  //       // ✅ CURRENT behavior → Discount before GST
  //       subTotal = baseAmount - discount;
  //       gst = subTotal * rate;
  //       total = subTotal + gst;
  //     }
  //     else {
  //       // ✅ NEW behavior → GST first, Discount last
  //       subTotal = baseAmount;
  //       gst = subTotal * rate;
  //       total = subTotal + gst - discount;
  //     }

  //     // final safety
  //     if (total < 0) total = 0;

  //     this.purchaseData.sub_total = this.round2(subTotal);
  //     this.purchaseData.gst_calculation = this.round2(gst);
  //     this.purchaseData.total = this.round2(total);
  //     this.purchaseData.discount_mode = this.purchaseForm.get('discount_mode')?.value;
  //   }



  recalcTotals() {
    const unit = this.num(this.purchaseData.unit_price);
    const qty = this.num(this.purchaseData.quantity);
    let discount = this.num(this.purchaseData.discount_in_rs);
    const rate = this.num(this.purchaseData.gst_in_percent);

    const baseAmount = unit * qty;

    // prevent invalid discount
    if (discount > baseAmount) discount = baseAmount;
    if (discount < 0) discount = 0;

    const subTotal = baseAmount - discount;
    const gst = subTotal * rate;
    const total = subTotal + gst;

    this.purchaseData.sub_total = this.round2(subTotal);
    this.purchaseData.gst_calculation = this.round2(gst);
    this.purchaseData.total = this.round2(total);
  }


  // keep these for compatibility, call the single source of truth:
  calculatesubtotal() { this.recalcTotals(); }
  calculateGST() { this.recalcTotals(); }
  calculateTotal() { this.recalcTotals(); }



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
      return;
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
        // this.purchaseData.discount_mode = this.purchaseForm.get('discount_mode')?.value;
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
                this.selectedPurchaseId = this.purchaseData.purchase_id;
                this.getpurchaseitemdatafrompid(this.purchaseData.purchase_id);
                this.purchaseData.product_id = null;
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
        // this.purchaseData.discount_mode = this.purchaseForm.get('discount_mode')?.value;

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
                this.purchaseData.product_id = null;
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

    this.purchaseForm.supplier_id = null;
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

    await Swal.fire({
      title: 'Loading...',
      didOpen: () => {
        Swal.showLoading();
        setTimeout(() => {
          Swal.close()
        }, 500);
      }
    });

    try {
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
          currency: data?.currency,
          // discount_mode: data?.discount_mode
        }
      )

      console.log(data?.gst_in_percent, "data?.gst_in_percent");
      this.purchaseData.purchase_id = data?.purchase_id;
      this.purchaseData.serial = data?.serial;
      this.purchaseData.sent_by = localStorage.getItem('login_id');
      this.purchaseData.id = data?.id;
      // this.purchaseData.discount_mode = this.purchaseForm.get('discount_mode')?.value;
    } catch (error) {
      Swal.close();
      Swal.fire('Error', 'Failed to load Purchase Order', 'error');
    } finally {
      // 🔥 Close loader
      Swal.close();
    }


  }

  async updatepo() {
    console.log(this.purchaseData, "purchaseData before update po");
    console.log(this.purchaseData, "purchase data");

    this.purchaseData.discount_in_rs ||= 0; // Default to 0 if undefined or null

    // delete this.purchaseData.id;
    await this.adminService.updatePO(this.purchaseData).toPromise()

      .then((results: any) => {

        this.getpurchaseitemdatafrompid(this.purchaseData.purchase_id);

        Swal.fire({
          toast: true,
          position: 'center',
          icon: 'success',
          title: 'PO updated successfully',
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true
        });

        console.log(results, "updatepo");
        this.selectedPurchaseId = this.purchaseData.purchase_id;
        this.poadddata.length = 0;
        this.purchaseData.product_id = null;
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
      });


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
          this.purchaseData.product_id = null;
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

  // onDiscountRsInput() {
  //   let rs = Number(this.purchaseForm.get('discount_in_rs')?.value) || 0;

  //   if (rs < 0) rs = 0;

  //   // 🔁 First recalc totals so grand total is correct
  //   this.recalcTotals();

  //   const grandTotal = this.num(this.purchaseData.total);

  //   const percent = grandTotal > 0 ? (rs / grandTotal) * 100 : 0;

  //   this.purchaseForm.patchValue(
  //     { discount_in_percent: this.round2(percent) },
  //     { emitEvent: false }
  //   );
  // }



  // onDiscountPercentInput() {
  //   let percent = Number(this.purchaseForm.get('discount_in_percent')?.value) || 0;

  //   // prevent negative
  //   if (percent < 0) percent = 0;

  //   // prevent >100%
  //   if (percent > 100) percent = 100;

  //   // 🔁 Recalculate totals first to get correct grand total
  //   this.recalcTotals();

  //   const grandTotal = this.num(this.purchaseData.total);

  //   // calculate Rs from GRAND TOTAL
  //   const rs = grandTotal > 0 ? (grandTotal * percent) / 100 : 0;

  //   // update only Rs (percent already typed by user)
  //   this.purchaseForm.patchValue(
  //     {
  //       discount_in_rs: this.round2(rs),
  //       discount_in_percent: this.round2(percent)
  //     },
  //     { emitEvent: false }
  //   );
  // }

  // syncDiscountOnBaseChange() {
  //   // Recalculate totals first
  //   this.recalcTotals();

  //   const rs = Number(this.purchaseForm.get('discount_in_rs')?.value) || 0;
  //   const grandTotal = this.num(this.purchaseData.total);

  //   const percent = grandTotal > 0 ? (rs / grandTotal) * 100 : 0;

  //   this.purchaseForm.patchValue(
  //     { discount_in_percent: this.round2(percent) },
  //     { emitEvent: false }
  //   );
  // }


  hasItemLevelDiscount(): boolean {
    if (!this.getpurchaseitemdata || !this.getpurchaseitemdata.length) {
      return false;
    }

    return this.getpurchaseitemdata.some(
      (item: any) => Number(item.discount_in_rs) > 0
    );
  }

  calculateFinalTotal() {

    console.log("Grand Total:", this.grandtotalofpodata);
    console.log("Type:", this.poLevelDiscount.type);
    console.log("Value:", this.poLevelDiscount.value);

    const baseTotal = this.num(this.grandtotalofpodata);

    console.log("BaseTotal Used:", baseTotal);

    if (!baseTotal) {
      this.poLevelDiscount.calculatedRs = 0;
      this.finalPoTotal = 0;
      return;
    }


    let discountRs = 0;

    if (this.poLevelDiscount.type === 'percent') {

      // ✅ Read from percent input
      const percent = this.num(this.poLevelDiscount.percent);

      discountRs = (baseTotal * percent) / 100;

      // keep percent synced
      this.poLevelDiscount.percent = percent;

    } else {

      // ✅ Read from rupees input
      discountRs = this.num(this.poLevelDiscount.value);

      // auto-calc percent for display
      this.poLevelDiscount.percent =
        baseTotal > 0 ? (discountRs / baseTotal) * 100 : 0;
    }

    // safety
    if (discountRs > baseTotal) {
      discountRs = baseTotal;
    }

    discountRs = this.round2(discountRs);

    // 🔥 ALWAYS STORE RUPEES
    this.poLevelDiscount.value = discountRs;
    this.poLevelDiscount.calculatedRs = discountRs;

    this.finalPoTotal = this.round2(baseTotal - discountRs);
  }

  async applyPoDiscount() {
    if (!this.selectedPurchaseId) {
      Swal.fire('Error', 'No Purchase ID selected', 'error');
      return;
    }
    console.log(this.selectedPurchaseId, "purchaseId");

    const payload = {
      purchase_id: this.selectedPurchaseId,
      po_discount: this.poLevelDiscount.value,
      final_total: this.finalPoTotal,
      discount_type: this.poLevelDiscount.type
    };

    console.log(payload, "payload");

    try {
      const result: any = await firstValueFrom(this.adminService.applyFinalDiscount(payload));
      console.log(result);
      if (!result || !result.success) {
        Swal.fire('Error', 'Failed to apply discount', 'error');
        return;
      }

      Swal.fire({
        toast: true,
        position: 'center',
        icon: 'success',
        title: 'Discount Applied Successfully!',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });

      // 🔥 initialize baseline for reapply logic
      if (this.poLevelDiscount.type === 'percent') {
        this.storedPercent = this.poLevelDiscount.percent;
        this.storedGrandTotal = this.grandtotalofpodata;
      }

      // Swal.fire('Success', 'Discount Applied Successfully', 'success');
      this.isPODiscountChanged = false;

      await this.getAlldataatonce();

      this.purchaseData.purchase_id = this.selectedPurchaseId;

      this.selectPurchaseid(this.selectedPurchaseId);
      this.calculateFinalTotal();

    } catch (error) {
      Swal.fire('Error', 'Failed to apply discount', 'error');
    }



    // this.adminService.updatePoLevelDiscount(payload).subscribe({
    //   next: () => {
    //     Swal.fire('Success', 'PO Discount Applied Successfully', 'success');
    //   },
    //   error: () => {
    //     Swal.fire('Error', 'Failed to apply discount', 'error');
    //   }
    // });
  }


  onDiscountChange() {

    this.calculateFinalTotal();

    const discountValue =
      this.poLevelDiscount.type === 'percent'
        ? this.poLevelDiscount.percent
        : this.poLevelDiscount.value;

    this.isPODiscountChanged = discountValue > 0;
  }


  validation() {
    this.purchaseForm = new FormGroup({
      purchase_id: new FormControl(null, [Validators.required]),
      issue_date: new FormControl(moment().format('YYYY-MM-DD'), [Validators.required]),
      expected_date: new FormControl('', [Validators.required]),
      product_id: new FormControl(null, [Validators.required, Validators.pattern(/^[1-9][0-9]*$/)]),
      supplier_id: new FormControl(null, [Validators.required, Validators.pattern(/^[1-9][0-9]*$/)]),
      unit_price: new FormControl(1, [Validators.required]),
      quantity: new FormControl(1, [Validators.required]),
      sub_total: new FormControl(0),
      discount_in_rs: new FormControl(0),
      discount_in_percent: new FormControl(null),
      total: new FormControl(0),
      description: new FormControl('', [Validators.required]),
      gst_calculation: new FormControl(0),
      gst_in_percent: new FormControl(0),
      purpose: new FormControl('', [Validators.required]),
      expected_user: new FormControl('', [Validators.required]),
      currency: new FormControl('₹', [Validators.required]),
      // discount_mode: new FormControl('before'),
    });

    this.calculatesubtotal();

  }

  navigateToNewRoute() {
    this.previousUrl = this.location.path();
    localStorage.setItem('backUrl', this.previousUrl);
  }



}
