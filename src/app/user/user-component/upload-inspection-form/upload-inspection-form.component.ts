
import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { AdminService } from 'src/app/services/admin.service';
import { CheckService } from 'src/app/services/check.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import * as moment from 'moment';
import { environment } from 'src/app/environments/environment.prod';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import { MatDialog } from '@angular/material/dialog';
import { PurchaseOrderViewComponent } from '../purchase-order-view/purchase-order-view.component';

@Component({
  selector: 'app-upload-inspection-form',
  templateUrl: './upload-inspection-form.component.html',
  styleUrls: ['./upload-inspection-form.component.scss']
})
export class UploadInspectionFormComponent {
  @ViewChild('approval1', { static: true }) approval1!: ElementRef;
  @ViewChild('approval2', { static: true }) approval2!: ElementRef;
  previousUrl: any;

  inspectionformData = {
    purchase_id: '',
    supplier_name: '',
    product_received_date: '',
    inspected_by: 0,
    date_of_inspection: '',
    invoice_no: '',
  }

  purchaseIdObj = {
    purchase_id: '',
    item_name: ''
  }

  purchaseIdforverification = {
    purchase_id: ''
  }

  verifyItems: any;

  //item 
  itemData = {
    purchase_id: '',
    item_code: '',
    item_name: '',
    description: 'No Description',
    category_id: 0,
    location_id: 1,                         //warehouse
    invoice_no: '',
    warrantyend_Date: '',
    item_status: '1',
    created_by: localStorage.getItem('login_id'),
    complain_id: 1
  }

  itemName = {
    item_name: ''
  }

  itemNameinArray: any[] = [];
  itemQunaitiyinArray: any[] = [];
  categoryIdsinArray: any[] = [];
  itemlastValues: any[] = [];
  itemCodetoverify: any[] = [];

  InspectionData = {
    id: 0,
    product_id: 0,
    approved_by_admin1: 0,
    approved_by_admin2: 0,
    inspected_by: 0,
    date_of_inspection: '',
    product_received_date: ''
  }

  filteredItemIds: number[] = [];
  AddinspectionDisbaling = true;

  getpurchasejoinData: any;
  selectedpurchaseId: any;
  selectedsupplierName: any;
  getpurchaseDatabyId: any;
  purchaseId: any = [];
  supplierName: any = [];
  searchText = '';                   //searching filter for purchase id
  display: boolean = false;         // show/hide list,in searching purchase id
  display2: boolean = true;        // show/hide bottom static form
  display3: boolean = true;        // show/hide add inspection button
  display4: boolean = false;        //show/hide add to items button
  approvalfromadmin1: any;
  approvalfromadmin2: any;
  is_sent: any;
  showinspectionForm: any;
  roleType = localStorage.getItem('level');
  user_name = localStorage.getItem('name');
  user_id = localStorage.getItem('login_id') ? localStorage.getItem('login_id') : 0;

  itemsDataobjinarray: any = [];

  // check approvedbyadmin1 or approvedbyadmin2
  admin1approval: any;
  admin2approval: any;
  // adminapprovalbyid:any;
  isactivebool: boolean = false;
  disablingaddItem: boolean = false;
  purchasedataforitemdisable: any;

  quanityinPO = {
    quantity: 0,
    received_quantity: 0
  }

  newpurchaseItem = {
    purchase_id: '',
    supplier_id: 0,
    issue_date: '',
    expected_date: '',
    product_id: 0,
    unit_price: 0,
    quantity: 0,
    sub_total: 0,
    discount_in_rs: 0,
    total: 0,
    description: '',
    gst_calculation: 0,
    gst_in_percent: 0,
    sent_by: localStorage.getItem('name'),
    received_quantity: 0
  }

  inputReceivedQuantity: number = 0;


  holdingStock = {
    orgqty: 0,
    receivedqty: 0,
    Id: 0,
    prdId: 0
  }

  receivedQuantity = {
    receivedqty: 0,

  }

  formattedDate: string = '';
  inspectedorNot = false;
  PRDreadonly = false;

  inspectioninfo: any;
  baseUrl: any;
  filepath: any;
  evaluateornot = true;
  inspectionarray: any[] = [];
  recevievedQuantityarray: any[] = [];
  checkeddisabling: boolean = true;
  isCheckboxChecked1: boolean = false;
  isCheckboxChecked2: boolean = false;

  items = {
    // other properties
    approved_by_admin2: 0, // initial value, change as needed,
    approved_by_admin1: 0 // initial value, change as needed
  };

  disablecheckbox1: boolean = false;
  disablecheckbox2: boolean = false;
  private isNavigatedBack: boolean = false; // Flag to check navigation source

  disableAddbutton: boolean = false;

  constructor(private sharedService: SharedService, private adminService: AdminService, private checkService: CheckService,
    private router: Router, private location: Location, private spinner: NgxSpinnerService, private activatedRoute: ActivatedRoute, private dialog:MatDialog) {

    const currentDate = moment(); // Current date and time
    this.formattedDate = currentDate.format('YYYY-MM-DD');
    const oneYearLater = currentDate.add(1, 'year');
    this.newpurchaseItem.issue_date = this.formattedDate;
    this.newpurchaseItem.expected_date = oneYearLater.format('YYYY-MM-DD');
    this.itemData.warrantyend_Date = oneYearLater.format('YYYY-MM-DD');
  };


  ngOnInit() {
    this.statemanagement();
    this.validation();
    this.getPruchaseorderData();
    this.baseUrl = environment.BASE_URL;
  }

  statemanagement() {
    this.isNavigatedBack = localStorage.getItem('navigated') === 'true';
    localStorage.removeItem('navigated');

    this.activatedRoute.queryParams.subscribe(async (params: any) => {
  console.log(params['purchaseid'], "params['purchaseid']");

      if (this.isNavigatedBack === true) {
        if (params['purchaseid'] && params['purchaseid'] !== '') {
          const purchaseobj = {
            purchase_id: params['purchaseid']
          }
          // this.inspectionformData.purchase_id = params['purchaseid'];
          this.selectpurchaseId(purchaseobj);
        }
        // setTimeout(() => {
        //   // Call the filter method to apply the saved state
        //   this.filterData();
        // }, 800)
      }
      else{
         // Remove all query params when isNavigatedBack is false
      this.router.navigate([], {
        relativeTo: this.activatedRoute, // Navigate relative to the current route
        queryParams: {}, // Empty object to clear the query parameters
        queryParamsHandling: '' // Explicitly state that no query params should be handled
      });
      }
    });

    this.isNavigatedBack === false;
  }

  async getPruchaseorderData() {

    //only invoice uploaded data has shown in the purchase id 
    //only invoice uploaded po has right to inspect
    this.spinner.show();

    try {
      const results: any = await this.sharedService.getpurchaseorderdata_acctoinvoiceupload().pipe(
        retry(3), // Retry the request up to 3 times
        // catchError((error: HttpErrorResponse) => {
        //   console.error('Error fetching accepted requests:', error);
        //   return of([]); // Return an empty array if an error occurs
        // })
      ).toPromise();

      this.getpurchasejoinData = JSON.parse(JSON.stringify(results));
      console.log()
      for (let item of this.getpurchasejoinData) {
        //save the data in array
        this.purchaseId.push(item.purchase_id);
      }
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

  getinspectioninfoFrompid(pid: any[]) {
    this.sharedService.getinspectionDatafromarrayofpid(pid).subscribe((results: any) => {
      console.log(results, "getinspectionDatafromarrayofpid");
      this.inspectioninfo = results;
    })
  }


  async selectpurchaseId(data: any) {
    this.AddinspectionDisbaling = true;
    this.selectedpurchaseId = data?.purchase_id;
    this.display = false;
    this.display3 = true;
    this.display2 = false;

    this.purchaseIdforverification.purchase_id = data?.purchase_id;
    this.purchaseIdObj.purchase_id = data?.purchase_id;
    //  verfying that purchase id is present in item table or not....

    // this.verificationOfItem();
    //we need to understand that after verification we have to do multiple things...

    this.inspectionformData.purchase_id = data?.purchase_id;
    this.itemData.purchase_id = data?.purchase_id;
    // console.log(this.purchaseIdObj, "this.purchaseIdObj");


    this.sharedService.getPurchaseJoinDatabyPid(this.purchaseIdObj).subscribe({
      next: async (results: any) => {
        // console.log(results, "results");

        this.VendorEvaluationDatabysupplierid(this.itemData.purchase_id, this.InspectionData);
        // console.log('I am in VendorEvaluationDatabysupplierid');

        this.getpurchaseDatabyId = results;
        const checkinpection = await results.map((e: any) => {
          //checking all purchase items are inspected in the respective purchase order
          if (e.inspected_by === 10) {
            return true   //true ---> inspected
          }
          else {
            return false     // false ---> not inspected
          }
        })

        if (checkinpection.includes(false)) {
          this.evaluateornot = false;
          // this.selectpurchaseId(this.inspectionformData.purchase_id);      
        } else {
          this.evaluateornot = true;
        }

        console.log(results, "getpurchaseDatabyId");
        this.itemNameinArray.length = 0;
        this.itemQunaitiyinArray.length = 0;
        this.filteredItemIds.length = 0;
        this.itemlastValues.length = 0;
        this.filepath = this.getpurchaseDatabyId[0]?.filepath;
        // console.log(this.baseUrl + '/' + this.filepath, "this.filepath")

        const checkInspection = (results: any, approvalKey: any) => {
          return results.map((e: any) => e[approvalKey] === 1);
        };

        const checkinpectionforadmin1 = checkInspection(results, 'approved_by_admin1');
        const checkinpectionforadmin2 = checkInspection(results, 'approved_by_admin2');

        this.disablecheckbox1 = checkinpectionforadmin1.every((inspected: any) => inspected);
        this.disablecheckbox2 = checkinpectionforadmin2.every((inspected: any) => inspected);

        for (let items of results) {
          this.newpurchaseItem.received_quantity = items.quantity;
          if (items.approved_by_admin1 === 0 || items.approved_by_admin2 === 0 || items.is_active === '0') {
            //with this condition only filtered data(i.e.. the po that is approved by both admins and not added in items table) of product and quantity

            // items.is_active=="0" means its already add in item table.

            //  should be pushed in the arrays.

            this.filteredItemIds.push(items.id);
            this.display4 = true;
            this.itemNameinArray.push(items.product_name);
            this.itemQunaitiyinArray.push(items.quantity);
            // this.itemQunaitiyinArray.push(items.received_quantity);
            this.categoryIdsinArray.push(items.category_id);
            this.itemName.item_name = items.product_name;

            // console.log(this.itemNameinArray, this.itemQunaitiyinArray, "Name and quantity");
            //this only gives the count of items
            this.sharedService.getlastItemcode(this.itemName).subscribe({
              next: (results: any) => {
                this.itemlastValues.push(results)
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

        }

        //same for every object of same po
        //lower Data
        this.inspectionformData.supplier_name = this.getpurchaseDatabyId[0]?.supplier_name;
        this.inspectionformData.invoice_no = this.getpurchaseDatabyId[0]?.invoice_no;
        this.itemData.invoice_no = this.getpurchaseDatabyId[0]?.invoice_no;

        if (this.getpurchaseDatabyId[0]?.product_received_date) {

          const dateofproductreceiving = moment(this.getpurchaseDatabyId[0]?.product_received_date)?.local()?.format('YYYY-MM-DD');
          this.showinspectionForm.get('product_received_date')?.patchValue((dateofproductreceiving));
        }
        else {
          this.showinspectionForm.get('product_received_date')?.patchValue((this.formattedDate));
        }

        if (this.getpurchaseDatabyId[0]?.date_of_inspection) {
          const dateofinspection = moment(this.getpurchaseDatabyId[0]?.date_of_inspection).local().format('YYYY-MM-DD');
          console.log(dateofinspection, "dateofinspection")
          this.showinspectionForm.get('date_of_inspection')?.patchValue((dateofinspection));
        }
        else {
          this.showinspectionForm.get('date_of_inspection')?.patchValue((this.formattedDate));
        }

        for (let i = 0; i < this.getpurchaseDatabyId.length; i++) {
          this.InspectionData.approved_by_admin1 = this.getpurchaseDatabyId[i]?.approved_by_admin1;
          this.InspectionData.approved_by_admin2 = this.getpurchaseDatabyId[i]?.approved_by_admin2;
          this.InspectionData.id = this.getpurchaseDatabyId[0]?.id;
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
    this.disabingAddItemfnc();
  }



  receivedquantityfnc() {
    return this.newpurchaseItem.received_quantity;
  }

  purchaseIdtosession(pid: any) {
    sessionStorage.setItem('purchase_id', pid);
  }

  showData() {
    this.display = true;
  }
  hidedata() {
    this.display = false;
  }

  getApprovalDetailfromid(id: any) {
    let idobj = {
      id: id
    }
    this.sharedService.getpurchasedatabyid(idobj).subscribe(
      {
        next: (results: any) => {
          this.admin1approval = results[0].approved_by_admin1;
          this.admin2approval = results[0].approved_by_admin2;
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

  // async disabingAddItemfnc(){
  //   const tempvar = await this.sharedService.getPurchaseJoinDatabyPid(this.purchaseIdforverification).toPromise();

  //   this.purchasedataforitemdisable = JSON.parse(JSON.stringify(tempvar));
  //   // console.log(this.purchasedataforitemdisable, "checkdisabling item");
  //   console.log(this.purchasedataforitemdisable, "purchasedataforitemdisable");


  //   // this.disablingaddItem = this.purchasedataforitemdisable.every((e: any) => e.inspected_by === 10);

  //    const checkinpection = this.purchasedataforitemdisable.map((e:any)=>{
  //     // console.log(e, "checkinspection")
  //     //checking all purchase items are inspected in the respective purchase order
  //        if(e.inspected_by ===10) {

  //         return  true   //true ---> inspected
  //        }
  //        else{
  //         return  false     // false ---> not inspected
  //        }

  //     })

  //     const checkisactive = this.purchasedataforitemdisable.map((e:any)=>{
  //       // console.log(e, "checkinspection")
  //       //checking all purchase items are inspected in the respective purchase order
  //          if(e.is_active ==='1') {

  //           return  true   //true ---> inspected
  //          }
  //          else{
  //           return  false     // false ---> not inspected
  //          }

  //       })


  //       if(checkinpection.includes(false) && checkisactive.includes(false)){
  //         this.disablingaddItem = true;
  //       }else{
  //         this.disablingaddItem = false;
  //       }



  //     console.log("disablingaddItem:", this.disablingaddItem)

  //   return this.disablingaddItem;

  //   }

  async disabingAddItemfnc() {
    const tempvar = await this.sharedService.getPurchaseJoinDatabyPid(this.purchaseIdforverification).toPromise();

    this.purchasedataforitemdisable = JSON.parse(JSON.stringify(tempvar));
    console.log(this.purchasedataforitemdisable, "purchasedataforitemdisable");

    // Check if every item is inspected and active
    const allInspectedAndActive = this.purchasedataforitemdisable.every((e: any) => {
      return e.inspected_by === 10 && e.is_active === '0';
    });

    // Set disablingaddItem based on the condition
    this.disablingaddItem = !allInspectedAndActive;

    console.log("disablingaddItem:", this.disablingaddItem);

    return this.disablingaddItem;
  }

  approvalupdate1(items: any, value: any, receivedquantity: any) {
    console.log(receivedquantity, "receivedquantity")

    this.disabingAddItemfnc();

    this.getApprovalDetailfromid(+items.id);

    setTimeout(() => {
      // if(this.admin2approval && this.InspectionData.approved_by_admin2 === 0){
      this.InspectionData.approved_by_admin2 = this.admin2approval;
      // }
      this.AddinspectionDisbaling = false;
      this.InspectionData.id = +items.id;
      this.InspectionData.product_id = +items.product_id;
      this.InspectionData.approved_by_admin1 = + value;

      //for multiple inspection
      if (this.user_id) {
        const login_id = + this.user_id;

        const inspectionData = {
          id: +items.id,
          product_id: +items.product_id,
          approved_by_admin1: + value,
          approved_by_admin2: +  this.admin2approval,
          inspected_by: login_id,
          date_of_inspection: this.inspectionformData.date_of_inspection ? this.inspectionformData.date_of_inspection : '',
          product_received_date: this.InspectionData.product_received_date ? this.InspectionData.product_received_date : ''
        }

        const receivedQuantity = {
          id: +items.id,
          received_quantity: +receivedquantity
        }

        this.recevievedQuantityarray.push(receivedQuantity);;
        this.inspectionarray.push(inspectionData);
        console.log(this.recevievedQuantityarray, "receivedQuantity");
        console.log(this.inspectionarray, "this.inspectionarray");
      }
      // console.log(this.InspectionData, "for admin1");
    }, 200)
  }

  approvalupdate2(items: any, value: any, receivedquantity: any) {
    console.log(receivedquantity, "receivedquantity")
    this.disabingAddItemfnc();
    this.getApprovalDetailfromid(items?.id);

    setTimeout(() => {
      // console.log(id,productId, value);

      this.InspectionData.approved_by_admin1 = this.admin1approval;
      this.AddinspectionDisbaling = false;
      // console.log(id, value, this.getpurchaseDatabyId.length);
      this.InspectionData.id = +items?.id;
      this.InspectionData.product_id = +items?.product_id;
      this.InspectionData.approved_by_admin2 = + items?.id;
      this.InspectionData.id = + items?.id;
      // console.log(this.InspectionData, "for admin2");

      //for multiple inspection
      if (this.user_id) {
        const login_id = + this.user_id;
        const inspectionData = {
          id: +items?.id,
          product_id: +items?.product_id,
          approved_by_admin1: + this.admin1approval,
          approved_by_admin2: + value,
          inspected_by: login_id,
          date_of_inspection: this.inspectionformData.date_of_inspection ? this.inspectionformData.date_of_inspection : '',
          product_received_date: this.InspectionData.product_received_date ? this.InspectionData.product_received_date : ''
        }

        const receivedQuantity = {
          id: +items.id,
          received_quantity: +receivedquantity
        }


        this.recevievedQuantityarray.push(receivedQuantity);
        this.inspectionarray.push(inspectionData);
        console.log(this.recevievedQuantityarray, "receivedQuantity");
        console.log(this.inspectionarray, "this.inspectionarray");
      }
    }, 200)

  }



  SubmitInspection() {

    if (this.showinspectionForm.invalid) {
      this.showinspectionForm.get('supplier_name').markAsTouched();
      this.showinspectionForm.get('product_received_date').markAsTouched();
    }

    if (this.inspectionformData.date_of_inspection < this.InspectionData.product_received_date) {
      Swal.fire({
        title: "warning!",
        text: "Receive date is never greater than inspection date!",
        icon: "warning",
        color: 'red',
        footer: 'Please correct dates manually.'
      })
    }
    // console.log(this.inspectionformData.date_of_inspection);
    // console.log(moment(this.inspectionformData.date_of_inspection)< moment(this.inspectionformData.product_received_date))

    else {

      this.AddinspectionDisbaling = true;
      this.inspectionarray.forEach((inspectionData: any) => {
        console.log(inspectionData, "inspectionData");
        if (inspectionData.approved_by_admin2 === 1 && inspectionData.approved_by_admin1 === 0) {
          inspectionData.inspected_by = 0
        }
        else if (inspectionData.approved_by_admin2 === 0 && inspectionData.approved_by_admin1 === 1) {
          inspectionData.inspected_by = 1

        }
        else if (inspectionData.approved_by_admin2 === 1 && inspectionData.approved_by_admin1 === 1) {
          inspectionData.inspected_by = 10
        }
        // this.InspectionData.date_of_inspection = this.formattedDate;
        console.log(this.InspectionData, "this.InspectionData")
        inspectionData.date_of_inspection = this.inspectionformData.date_of_inspection;
        inspectionData.product_received_date = this.InspectionData.product_received_date;
      })

      console.log(this.inspectionarray, "this.inspectionarray");

      if (this.inspectionarray) {
        console.log("Multiple Inspection")
        console.log(this.inspectionarray, "this.inspectionarray");
        this.adminService.addmultipleinspectioninPI(this.inspectionarray).subscribe(
          {
            next: (results: any) => {
              this.display4 = true;
              this.display3 = false;

              Swal.fire({
                position: 'center',
                icon: 'success',
                title: `Item succesfully inspected by ${this.user_name}!`,
                showConfirmButton: false,
                timer: 1500
              }).then(async () => {
                this.isCheckboxChecked1 = !this.isCheckboxChecked1;
                this.isCheckboxChecked2 = !this.isCheckboxChecked2;
                this.checkeddisabling = true;
                // this.AddinspectionDisbaling = true;
                console.log(this.recevievedQuantityarray, "this.recevievedQuantityarray");

                // if(this.recevievedQuantityarray){
                //   await this.adminService.updatePurchaseItemforholdingstock(this.recevievedQuantityarray).toPromise();
                //   // .subscribe((results:any)=>{
                //   //   console.log(results, "receivedQuantity update");
                //   // });
                //   this.disabingAddItemfnc();
                //   this.PRDreadonly = true;
                // }

                // setTimeout(() => {
                //  this.getPruchaseorderData();

                const purchaseId = {
                  purchase_id: this.selectedpurchaseId
                }
                this.selectpurchaseId(purchaseId);
                // }, 500);
                setTimeout(() => {
                  this.disabingAddItemfnc();
                  this.PRDreadonly = true;
                }, 500);


              })

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
      else {
        console.log("Single Inspection")
        this.adminService.addinspectioninPI(this.InspectionData).subscribe(
          {
            next: (results: any) => {
              this.display4 = true;
              this.display3 = false;

              Swal.fire({
                position: 'center',
                icon: 'success',
                title: `Item succesfully inspected by ${this.user_name}!`,
                showConfirmButton: false,
                timer: 1500
              }).then(async () => {

                await this.getPruchaseorderData();

                const purchaseId = {
                  purchase_id: this.selectedpurchaseId
                }
                await this.selectpurchaseId(purchaseId);

                // const holdingStock = await this.quantityinPO(this.holdingStock.orgqty,this.holdingStock.receivedqty,this.holdingStock.Id, this.holdingStock.prdId);

                // const purchaseItemData = {
                //   id: this.InspectionData.id,
                //   received_quantity: this.newpurchaseItem.received_quantity
                // }

                // this.adminService.updatePurchaseItemforholdingstock(purchaseItemData);

                this.disabingAddItemfnc();
                this.PRDreadonly = true;


              })

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


    }
  }


  // warrantyEndDate() {
  //   const date = new Date();
  //   let day = date.getDate();
  //   let month = date.getMonth() + 1;
  //   let year = date.getFullYear() + 1;
  //   let newMonth = `0${month}`.slice(-2);
  //   let Newday = `0${day}`.slice(-2);
  //   // This arrangement can be altered based on how we want the date's format to appear.
  //   let NextYearDate = `${year}-${newMonth}-${Newday}`;
  //   // console.log(NextYearDate); // "2024-04-13"
  //   this.itemData.warrantyend_Date = NextYearDate;
  // }

  async itemcodegeneration() {

    this.itemsDataobjinarray.length = 0;
    console.log(this.categoryIdsinArray, "this.categoryIdsinArray");

    for (let i = 0; i < this.itemNameinArray.length; i++) {

      //category ids should be changed no static category now
      this.itemData.category_id = this.categoryIdsinArray[i];
      this.itemData.item_name = this.itemNameinArray[i];
      this.itemName.item_name = this.itemData.item_name;

      for (let j = 0; j < this.itemQunaitiyinArray[i]; j++) {
        //here last item is encounter mean the count and adding +1 each times loops runs

        // if (this.itemlastValues[i] == null || '') {
        try {
          const newItemCode = await this.sharedService.generateNextItemCode(this.itemName).toPromise();
          console.log(newItemCode, "newItemCode");

          // this.itemData.item_code = this.itemName.item_name + '-' + (+j + 1);
          this.itemData.item_code = JSON.parse(JSON.stringify(newItemCode)).newItemCode;
          //JSON.parse(JSON.stringify(this.itemData)) is compulasary otherwise the updated(last data loop times) data is pushed in array loop times
          //this is called deep copy
          let deepCopyofItemArray = JSON.parse(JSON.stringify(this.itemData))
          this.itemsDataobjinarray = [...this.itemsDataobjinarray, deepCopyofItemArray];
          console.log(this.itemsDataobjinarray, "itemsDataobjinarray");
          // }
          // else {
          //   // console.log(this.itemlastValues[i]);
          //   let splitItemCode = this.itemlastValues[i].split('-');

          //   let newcode = + splitItemCode[1] + j + 1;
          //   let newItemcode = splitItemCode[0] + '-' + newcode;
          //   this.itemData.item_code = newItemcode;

          //   //this is called deep copy
          //   let deepCopyofItemArray = JSON.parse(JSON.stringify(this.itemData))

          //   this.itemsDataobjinarray = [...this.itemsDataobjinarray, deepCopyofItemArray];

          //   // console.log(this.itemsDataobjinarray, "Data is ready to add");
          //   console.log(this.itemsDataobjinarray, "itemsDataobjinarray");
          // }
        }

        catch (error) {
          if (error) {
            console.error('No product found for the given item name');
          } else {
            console.error('Error generating next item code:', error);
          }
        }
      }

    }

    console.log(this.itemsDataobjinarray, "itemsDataobjinarray");
    if (this.itemsDataobjinarray) {
      this.adminService.addItem(this.itemsDataobjinarray).subscribe({
        next: (results: any) => {
          this.itemCodetoverify = JSON.parse(JSON.stringify(results));
          console.log(this.itemCodetoverify, "Code varification");

          Swal.fire({
            title: 'Success!',
            text: 'Item added successfully!',
            icon: 'success',
          }).then(() => {
            this.updateaisactiveinpi(this.filteredItemIds);
            location.reload();
          });
        },
        error: (error) => {
          // console.log('error')

          //  const expirationTime = error.error.expirationTime;
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
    else {
      Swal.fire({
        title: "warning!",
        icon: 'warning',
        text: 'Please generate last item code first!',
        footer: 'Please correct last item manually.'
      })
    }



    // console.warn(this.filteredItemIds);
  }

  //active at code generation/ item added in item table
  updateaisactiveinpi(id: any[]) {
    const filteredidsobj = {
      ids: id
    }
    if (filteredidsobj.ids || id !== null) {
      this.adminService.updateisactiveinpiforitems(filteredidsobj).subscribe({
        next: (results: any) => {
          // console.log(results, "isactive updated");
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
    // console.log("empty array in filteredidsobj")

  }

  navigateToNewRoute(items:any) {
    const queryParams: any = {};

    // Conditionally add parameters to queryParams based on their values
    if (this.selectedpurchaseId) queryParams.purchaseid = this.selectedpurchaseId;


// Store only the base path
this.previousUrl = this.location.path().split('?')[0];
localStorage.setItem('backUrl', this.previousUrl);

// Store query parameters as JSON
localStorage.setItem('backUrlQueryParams', JSON.stringify(queryParams));
localStorage.setItem('navigated', 'true');

// Navigate forward with the same params
    this.router.navigate(['user/vendor-evaluation', items.purchase_id], { queryParams });
  }

  buildQueryString(params: any): string {
    return '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&');
  }

  //now depreciated by ritik by may be useful


  // verificationOfItem() {
  //   // console.log(this.purchaseIdObj)
  //   this.checkService.verificationofItems(this.purchaseIdObj).subscribe((results: any)=>{
  //     results.map((e:any)=>{
  //       // console.log(e, "value of e ");
  //     })
  //     this.verifyItems = results[0]?.verification_ofitems;
  //     // console.log(this.verifyItems, "Verify Item");
  //   })
  //   // this.checkService.verificationofItems(this.purchaseIdObj).subscribe(
  //   //   //with new way of doing it
  //   //   {
  //   //     next: (results: any) => {
  //   //       results.map((e:any)=>{
  //   //         console.log(e, "value of e ");
  //   //       })
  //   //       this.verifyItems = results[0]?.verification_ofitems;
  //   //       console.log(this.verifyItems, "Verify Item");
  //   //     },

  //   //     error: (error) => {
  //   //       // console.log('error')
  //   //       if (error.status == 403) {
  //   //         Swal.fire({
  //   //           icon: 'error',
  //   //           title: 'Oops...',
  //   //           text: 'Token expired. Please login..',
  //   //           footer: '<a href="../login">Login..</a>'
  //   //         })
  //   //         this.router.navigate(['../login']);
  //   //       }
  //   //       else {
  //   //         Swal.fire({
  //   //           icon: 'error',
  //   //           title: 'Oops...',
  //   //           text: 'Internal Server Error...',
  //   //           footer: '<a href="../login">Please Login..</a>'
  //   //         })
  //   //         this.router.navigate(['../login']);
  //   //       }
  //   //     }
  //   //   }
  //   // )
  // }

  savingValuesforHoldingStock(items: any, value: number) {

    console.log(items, "items")
    // this.holdingStock.orgqty = + items?.quantity;
    // this.holdingStock.receivedqty = +items?.received_quantity;
    // // this.holdingStock.Id=+ items.?id;
    // this.holdingStock.prdId = prdId;
    this.receivedQuantity.receivedqty = +items.received_quantity;

    console.log(this.receivedQuantity.receivedqty, "this.receivedQuantity.receivedqty");

    // console.log(orgqty,receivedqty, Id, prdId);
    console.log(items.quantity, value);

    if (items.quantity - value !== 0) {
      // items.approved_by_admin2 = 0;
      this.approval1.nativeElement.value = 0;
      this.approval2.nativeElement.value = 0;


      // const receivedquantityobj = {
      //   id:+items.id,

      // }
    }

    // const receivedQuantity={
    //   id: +items.id,
    //   received_quantity:+value
    // }

    // this.recevievedQuantityarray.push(receivedQuantity);


    // if(this.holdingStock.orgqty - receivedqtyfromdb){

    // }
  }


  enableInspection() {
    this.approval1.nativeElement.value = 0;
    this.approval2.nativeElement.value = 0;
  }

  async quantityinPO(orgqty: number, receivedqty: number, Id: number, prdId: number) {
    // this.quanityinPO.quantity = qty;
    // this.quanityinPO.received_quantity = receivedqty;

    // console.log(receivedqty, "receivedqty");
    this.inputReceivedQuantity = 0;

    // this.inputReceivedQuantity = this.inputReceivedQuantity + receivedqty;

    // this.newpurchaseItem.received_quantity = receivedqty;
    if (orgqty - receivedqty > 0) {
      Swal.fire({
        title: `Do you want to put ${orgqty - receivedqty} items on holding stock?`,
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, hold items!'
      }).then(async (result) => {

        if (result.isConfirmed) {

          // this.quanityinPO.quantity =  orgqty - receivedqty;
          // console.log(this.quanityinPO, "this.quanityinPO"); 

          this.newpurchaseItem.purchase_id = this.purchaseIdObj.purchase_id;
          this.newpurchaseItem.quantity = orgqty - receivedqty;
          this.newpurchaseItem.received_quantity = this.newpurchaseItem.quantity;
          this.newpurchaseItem.product_id = prdId;


          //update purchase Item (recieved Quantity)
          const purchaseItemData = {
            id: Id,
            received_quantity: receivedqty
          }

          // const updatePurchaseItem = await this.adminService.updatePurchaseItemforholdingstock(purchaseItemData).toPromise();


          // console.log(this.newpurchaseItem, "this.newpurchaseItem");

          // const makenewPurchaseOrder = await this.adminService.makePurchaseOrder(this.newpurchaseItem).toPromise().then(()=>{

          //   const purchaseId ={
          //     purchase_id : this.purchaseIdObj.purchase_id
          //   }
          //  this.selectpurchaseId(purchaseId);

          //   })


        }
        else {
          const purchaseId = {
            purchase_id: this.purchaseIdObj.purchase_id
          }

          this.selectpurchaseId(purchaseId);

        }
      })
    }
  }

  isInspectedByIdadmin1(item: any): boolean {
    return (item?.includes(null) || item?.includes(0)) || false;
  }

  isInspectedByIdadmin2(item: any): boolean {
    return (item?.includes(null) || item?.includes(1)) || false;
  }

  selectAllforadmin1() {
    console.log("selectAllforadmin1");

    this.checkeddisabling = !this.checkeddisabling;
    this.recevievedQuantityarray.length = 0;

    if (this.isCheckboxChecked1) {
      this.getpurchaseDatabyId.map((e: any, index: any) => {
        if (e.approved_by_admin1 !== 1) {
          e.approved_by_admin1 = 1;
          // this.getpurchaseDatabyId[index].approved_by_admin1 = 1;
          if (e.approved_by_admin2 === 1) {
            // console.log(index,"index");

            // e.approved_by_admin1 = 1;
            const inspectionDataforadmin1 = {
              id: e.id,
              product_id: e.product_id,
              approved_by_admin1: 1,
              approved_by_admin2: e.approved_by_admin2,
              inspected_by: 10,
              date_of_inspection: this.inspectionformData.date_of_inspection ? this.inspectionformData.date_of_inspection : '',
              product_received_date: this.InspectionData.product_received_date ? this.InspectionData.product_received_date : ''
            }

            this.inspectionarray.push(inspectionDataforadmin1);
          }
          else if (e.approved_by_admin2 === 0) {
            e.approved_by_admin1 = 1;
            // e[index].approved_by_admin1 =1;

            const inspectionDataforadmin1 = {
              id: e.id,
              product_id: e.product_id,
              approved_by_admin1: 1,
              approved_by_admin2: e.approved_by_admin2,
              inspected_by: 1,
              date_of_inspection: this.inspectionformData.date_of_inspection ? this.inspectionformData.date_of_inspection : '',
              product_received_date: this.InspectionData.product_received_date ? this.InspectionData.product_received_date : ''
            }


            this.inspectionarray.push(inspectionDataforadmin1);
          }
          else {
            const inspectionDataforadmin1 = {
              id: e.id,
              product_id: e.product_id,
              approved_by_admin1: 1,
              approved_by_admin2: e.approved_by_admin2,
              inspected_by: null,
              date_of_inspection: this.inspectionformData.date_of_inspection ? this.inspectionformData.date_of_inspection : '',
              product_received_date: this.InspectionData.product_received_date ? this.InspectionData.product_received_date : ''
            }


            this.inspectionarray.push(inspectionDataforadmin1);
          }
        }
      })

      console.log(this.recevievedQuantityarray, "this.recevievedQuantityarray");
    }

    else {

      const purchaseId = {
        purchase_id: this.purchaseIdObj.purchase_id
      }

      this.selectpurchaseId(purchaseId);
    }
  }

  selectAllforadmin2() {
    console.log("selectAllforadmin2");

    this.checkeddisabling = !this.checkeddisabling;

    this.recevievedQuantityarray.length = 0;

    if (this.isCheckboxChecked2) {
      this.getpurchaseDatabyId.map((e: any, index: any) => {
        if (e.approved_by_admin1 !== 2) {
          e.approved_by_admin2 = 1;
          // e[index].approved_by_admin2 =1;


          if (e.approved_by_admin1 === 1) {
            const inspectionDataforadmin2 = {
              id: e.id,
              product_id: e.product_id,
              approved_by_admin1: e.approved_by_admin1,
              approved_by_admin2: 1,
              inspected_by: 10,
              date_of_inspection: this.inspectionformData.date_of_inspection ? this.inspectionformData.date_of_inspection : '',
              product_received_date: this.InspectionData.product_received_date ? this.InspectionData.product_received_date : ''
            }

            this.inspectionarray.push(inspectionDataforadmin2);
          }
          else if (e.approved_by_admin1 === 0) {
            const inspectionDataforadmin2 = {
              id: e.id,
              product_id: e.product_id,
              approved_by_admin1: e.approved_by_admin1,
              approved_by_admin2: 1,
              inspected_by: 0,
              date_of_inspection: this.inspectionformData.date_of_inspection ? this.inspectionformData.date_of_inspection : '',
              product_received_date: this.InspectionData.product_received_date ? this.InspectionData.product_received_date : ''
            }

            this.inspectionarray.push(inspectionDataforadmin2);

          }
          else {
            const inspectionDataforadmin2 = {
              id: e.id,
              product_id: e.product_id,
              approved_by_admin1: e.approved_by_admin1,
              approved_by_admin2: 1,
              inspected_by: null,
              date_of_inspection: this.inspectionformData.date_of_inspection ? this.inspectionformData.date_of_inspection : '',
              product_received_date: this.InspectionData.product_received_date ? this.InspectionData.product_received_date : ''
            }

            this.inspectionarray.push(inspectionDataforadmin2);
          }
          console.log(this.recevievedQuantityarray, "this.recevievedQuantityarray");
        }

      })
    }
    else {
      const purchaseId = {
        purchase_id: this.purchaseIdObj.purchase_id
      }

      this.selectpurchaseId(purchaseId);
    }

  }

  async VendorEvaluationDatabysupplierid(id: any, data: any) {
    console.log(data, "this.InspectionData");
    const getSupplierEvaluationdata: any = await this.sharedService.getvendorEvaluationjoindata().toPromise();

    const supplierEvaluationData = getSupplierEvaluationdata.filter((data: any) => data.purchase_id == id);

    console.log(supplierEvaluationData,data.approved_by_admin1,data.approved_by_admin2, "supplierEvaluationData");

    if (supplierEvaluationData.length == 0 && data.approved_by_admin1 == 1 && data.approved_by_admin2 == 1) {
      // this.disablingaddItem = true;
      this.disableAddbutton = true;
      let timerInterval:any;
      
      await Swal.fire({
        title: "PO not evaluated. Please evaluate!",
        icon:'question',
        timer: 1500,
        timerProgressBar: false,
        showConfirmButton: false,
        willClose: () => {
          clearInterval(timerInterval);
        }
      })
  
    }
    else {
      this.disableAddbutton = false;
      // this.disablingaddItem = false;
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

  openModal(data: any) {
    // console.log(data, "data");
    // const purchaseData =  {
    //   purchase_id:data
    // }

    setTimeout(() => {
      this.dialog.open(PurchaseOrderViewComponent,{
        width:'1200px',
        maxHeight: '85vh',
        data:data
      }) 
    }, 500);
  
  }


  validation() {
    this.showinspectionForm = new FormGroup({
      purchase_id: new FormControl(''),
      supplier_name: new FormControl(''),
      product_received_date: new FormControl('', [Validators.required]),
      date_of_inspection: new FormControl('', [Validators.required]),
      invoice_no: new FormControl(''),
    })
  }

}