import { Component } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CheckService } from 'src/app/services/check.service';
import { AdminService } from 'src/app/services/admin.service';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { NgxSpinnerService } from "ngx-spinner";
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';
import { retry } from 'rxjs/operators';
// import { of } from 'rxjs';


@Component({
  selector: 'app-transfer-stock',
  templateUrl: './transfer-stock.component.html',
  styleUrls: ['./transfer-stock.component.scss']
})

export class TransferStockComponent {
  transferStockForm: any;
  systemtouserForm: any;
  itemtosystemForm: any;
  itemtolocationForm: any;

  systemData: any;
  getSystemDatabyitemId: any;
  getTransferDataDetailotherthanCPU: any;
  itemDataOtherThanCPU: any;
  itemDataOtherThanCPUwithalllocation: any;
  getuserData: any;
  locationdata: any[]=[];
  systemConfigurationobj: any[] = [];
  systemConfigurationforsrapcpu: any[] = [];
  systemConfigurationlength: number = 0;

  arrayforscrappeddata: any[] = [];
  arrayforsoldout: any[] = [];
  acceptedLocationforscrapped: any[] = [];
  arrayofassigneditemsints: any = [];
  arrayofassigneditemsinsysinfo: any = [];

  // transferStockData is for assign system to user form
  transferStockData = {
    item_id: 0,
    transfer_to_user: 0,
    location_id: 0,
    transfer_by: localStorage.getItem('login_id'),
    transfer_category: 0,
    transfer_to_system: null
  };

  // transferStockData is for assign item to system form
  transferStockData2 = {
    item_id: 0,
    transfer_to_user: 0,
    location_id: 0,
    transfer_by: localStorage.getItem('login_id'),
    transfer_category: 0,
    transfer_to_system: null,
  };

  // transferStockData is for assign items to location form
  transferStockData3 = {
    item_id: 0,
    transfer_to_user: 0,
    location_id: 0,
    transfer_by: localStorage.getItem('login_id'),
    transfer_category: 0,
    transfer_to_system: 0,
  };

  itemId = {
    item_id: 0
  };

  transferTo = {
    transfer_to_user: 0,
    transfer_to_system: 0
  };

  dataforsystemInfo: any = {
    item_code: '',
    username: ''
  };

  dataforsysteminfowhenscrapped = {
    item_code: '',
  };


  //radio buttons value
  assignsysttouserbtnValue: any;
  assignitemstosysbtnValue: any;
  assignitemstolocationbtnValue: any;

  systemTransferData: any;
  systemTransferDatadistplay: boolean = false;
  configureitemdetails: any[] = [];
  itemdetailsbyitemid: any;
  getItemsData: any;
  selectedLocation: number | null = null;
  dropdownSettingsFortransferTo2: IDropdownSettings = {};
  dropdownSettingsForItem2: IDropdownSettings = {};
  dropdownSettingsForLocation2: IDropdownSettings = {};
  dropdownSettingsForLocation3: IDropdownSettings = {};
  dropdownSettingsForItem3: IDropdownSettings = {};

  itemnamearray: any = [];
  selecteditemname: any;
  allconnectedusersandsystems: any[] = [];
  itemdataforotheritems: any;
  sendingalltowarehousewhencpuscrap: any[] = [];

  itemsdataforusers: any[] = [];
   isNavigatedBack: boolean = false; // Flag to check navigation source
   checkBackURL:boolean = false;


  constructor(private sharedService: SharedService, private router: Router, private checkService: CheckService,
    private adminService: AdminService, private spinner: NgxSpinnerService, private activatedRoute: ActivatedRoute) { }


  ngOnInit(): void {
    this.validationradiobtn();
    this.getAllDataatonce();
  }



  ngAfterViewInit() {
    this.getAssigneddatafromtsandsysteminfo();
    this.getalluserandsystemused();
    this.checkQueryParams();
  }

  nonNullValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value === null || value === 0) {
        return { 'nonNull': true };
      }
      return null;
    };
  }

//   checkQueryParams() {
//     this.isNavigatedBack = localStorage.getItem('navigated') === 'true';
//     localStorage.removeItem('navigated');

//     this.activatedRoute.queryParams.subscribe(async (params) => {
     
//       if (params['radiobtnatTransfer'] && params['radiobtnatTransfer'] !== '') {
//         var radioBtnValue = params['radiobtnatTransfer'];
//         this.transferStockForm.get('transferType')?.setValue(radioBtnValue);
//       }
//       this.spinner.show();

//       setTimeout(() => {

//         if (params['itemId'] !== '' && params['ItemCode'] && params['itemNameforts'] && params['locationId']) {
//           const ItemObj: any = {
//             item_id: +params['itemId'],
//             item_code: params['ItemCode'],
//             item_name: params['itemNameforts'],
//             location_id: +params['locationId']
//           }

//           if (params['radiobtnatTransfer'] == "assignsystemtouser") {
//             this.transferStockData.item_id = +params['itemId'];
//             this.selectedCPU(ItemObj);
//           }
//           else if (params['radiobtnatTransfer'] == "assingitemtosystem") {
//             this.transferStockData2.item_id = +params['itemId'];

//             this.selecteditems2(ItemObj);
//           }
//           else {
//             // this.transferStockData3.item_id =  +params['itemId'] ;
//             this.selectitem3(ItemObj);
//           }
//         }
//         this.spinner.hide();

//       }, 500);
    
//   })
// }

checkQueryParams() {
  this.isNavigatedBack = localStorage.getItem('navigated') === 'true';
  localStorage.removeItem('navigated'); // consume the flag

  this.activatedRoute.queryParams.subscribe((params) => {
    if (this.isNavigatedBack) {
      this.checkBackURL = false;
      // ✅ Case 1: Came from another page -> process query params
      if (params['radiobtnatTransfer']) {
        this.transferStockForm.get('transferType')?.setValue(params['radiobtnatTransfer']);
      }

      this.spinner.show();
      setTimeout(() => {
        if (params['itemId'] && params['ItemCode'] && params['itemNameforts'] && params['locationId']) {
          const ItemObj: any = {
            item_id: +params['itemId'],
            item_code: params['ItemCode'],
            item_name: params['itemNameforts'],
            location_id: +params['locationId']
          };

          if (params['radiobtnatTransfer'] === "assignsystemtouser") {
            this.transferStockData.item_id = +params['itemId'];
            this.selectedCPU(ItemObj);
          } else if (params['radiobtnatTransfer'] === "assingitemtosystem") {
            this.transferStockData2.item_id = +params['itemId'];
            this.selecteditems2(ItemObj);
          } else {
            this.selectitem3(ItemObj);
          }
        }
        this.spinner.hide();
      }, 500);

    } else {
        // ✅ Case 2: Fresh load / reload (not navigated)
      this.checkBackURL = true;   // <-- mark as fresh load
      // ✅ Case 2: Page reload -> clear query params once
      if (Object.keys(params).length > 0) {
        setTimeout(() => {
          this.router.navigate([], {
            relativeTo: this.activatedRoute,
            queryParams: {},   // clears query params
            replaceUrl: true   // replace current URL (so no back history mess)
          });
        }, 0);
      }
    }
  });
}

 


  async getAllDataatonce() {
    this.spinner.show();
    try {
      const [systemData, itemDataOtherThanCPU, itemDataOtherThanCPUwithalllocation, locationdata, getuserData, getItemsData]: any =
        await forkJoin([
          this.sharedService.getSystemsDatafromitems().pipe(
            retry(3), // Retry the request up to 3 times
            // catchError((error: HttpErrorResponse) => {
            //   console.error('Error fetching accepted requests:', error);
            //   return of([]); // Return an empty array if an error occurs
            // })
          ),
          this.sharedService.getitemsoptherthanCPU().pipe(
            retry(3), // Retry the request up to 3 times
            // catchError((error: HttpErrorResponse) => {
            //   console.error('Error fetching accepted requests:', error);
            //   return of([]); // Return an empty array if an error occurs
            // })
          ),
          this.sharedService.getitemsoptherthanCPUwithalllocation().pipe(
            retry(3), // Retry the request up to 3 times
            // catchError((error: HttpErrorResponse) => {
            //   console.error('Error fetching accepted requests:', error);
            //   return of([]); // Return an empty array if an error occurs
            // })
          ),
          this.checkService.getLocationdatabystatus().pipe(
            retry(3), // Retry the request up to 3 times
            // catchError((error: HttpErrorResponse) => {
            //   console.error('Error fetching accepted requests:', error);
            //   return of([]); // Return an empty array if an error occurs
            // })
          ),
          this.sharedService.getUsersdatabystatus().pipe(
            retry(3), // Retry the request up to 3 times
            // catchError((error: HttpErrorResponse) => {
            //   console.error('Error fetching accepted requests:', error);
            //   return of([]); // Return an empty array if an error occurs
            // })
          ),
          this.sharedService.getitemsData().pipe(
            retry(3), // Retry the request up to 3 times
            // catchError((error: HttpErrorResponse) => {
            //   console.error('Error fetching accepted requests:', error);
            //   return of([]); // Return an empty array if an error occurs
            // })
          ),
        ]).toPromise();
      this.systemData = JSON.parse(JSON.stringify(systemData));
      this.itemDataOtherThanCPU = JSON.parse(JSON.stringify(itemDataOtherThanCPU));
     

      console.log(itemDataOtherThanCPUwithalllocation, "itemDataOtherThanCPU");

      this.itemDataOtherThanCPUwithalllocation = JSON.parse(JSON.stringify(itemDataOtherThanCPUwithalllocation));
      this.locationdata = JSON.parse(JSON.stringify(locationdata));
      this.getuserData = JSON.parse(JSON.stringify(getuserData));
      console.log(this.getuserData, "this.getuserData")
      this.getItemsData = JSON.parse(JSON.stringify(getItemsData));

    //items thats should be shown in item to location (item i/p box)
    //   const location_ids = [1, 2, 3, 4, 7, 8];
    //   this.itemDataOtherThanCPUwithalllocation = this.itemDataOtherThanCPUwithalllocation.filter((item: any) => 
    //     location_ids.includes(item?.location_id)
    // );

    const nonBrandedAllowedlocationIds = [1, 2, 3, 4, 7, 8];
    const allowedForBRND = [1, 4, 7, 8];

    this.itemDataOtherThanCPUwithalllocation = this.itemDataOtherThanCPUwithalllocation.filter((item: any) => {
      //only shows item id (not branded), have these location ids "location_ids"
      const locId = item?.location_id;

      //only shows item id (branded) have these location ids  "allowedForBRND"
      // location_ids.includes(item?.location_id)
      const isBRND = item?.purchase_id?.startsWith('BRND');
      return isBRND? allowedForBRND.includes(locId): nonBrandedAllowedlocationIds.includes(locId);
    }
    )


      this.itemDataOtherThanCPUwithalllocation.map((e: any) => {

        if (e.location_id == 4 || e.location_id == 7 || e.location_id == 8) {

          this.arrayforscrappeddata.push(e?.item_id);
        }

        const itemname = ['RAM', 'B-RAM', 'HDD', 'SSD HDD', 'B-HDD', 'SMPS', 'B-SMPS', 'Graphics Card', 'B-Graphics card', 'B-GRAPHICS CARD', 'B-Graphics Card'];

        this.itemDataOtherThanCPU = this.itemDataOtherThanCPU.filter((item: any) => {
          // Return true for items whose item_name is not included in itemname
          return !itemname.includes(item?.item_name);
        });

      })
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


  async getAssigneddatafromtsandsysteminfo() {
    try {
      const [assigneddatafromts, assigneditemstouserfromts, assgineddatafromsysinfo]: any = await forkJoin([
        this.sharedService.getAssigneditemsfromts().pipe(retry(3),
          // catchError((error: HttpErrorResponse) => {return of([])})
        ),
        this.sharedService.getassigneditemstouserfromts().pipe(retry(3),
          // catchError((error: HttpErrorResponse) => {
          //   console.error('Error fetching accepted requests:', error);
          //       return of([]); // Return an empty array if an error occurs
          //     })
        ),
        this.sharedService.getAssigneditemsfromsysteminfo().pipe(retry(3),
          // catchError((error: HttpErrorResponse) => {
          //     console.error('Error fetching accepted requests:', error);
          //     return of([]); // Return an empty array if an error occurs
          //   })
        )
        ,])
        .toPromise();
      // console.log(assigneddatafromts, "assigneddatafromts");
      // console.log(assgineddatafromsysinfo, "assgineddatafromsysinfo");
      const deepcloningofassgineddatafromsysinfo = JSON.parse(JSON.stringify(assgineddatafromsysinfo));
      const deepcloningofassigneditemtouserfromts = JSON.parse(JSON.stringify(assigneditemstouserfromts));
      const deepcloningofassgineddatafromsts = JSON.parse(JSON.stringify(assigneddatafromts));
      const filteringdata = deepcloningofassgineddatafromsysinfo.reduce((acc: any, obj: any) => {
        Object.keys(obj).forEach((key) => {
          if (obj[key] !== null && key !== 'sid') {
            acc.push(obj[key]);
          }
        });
        return acc;
      }, []);

      this.arrayofassigneditemsints = [...assigneddatafromts.map((e: any) => e.name), ...assigneditemstouserfromts.map((e: any) => e.name)];
      this.arrayofassigneditemsinsysinfo = [...filteringdata, ...this.arrayofassigneditemsints];
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

  //all three radio button fnc
  assignitemstosysbtn() {
    if (this.transferStockData2.location_id && this.transferStockData2.location_id != 0) {
      this.transferStockData2.location_id = 0;
    }

    this.resetextraarrays();

    this.systemtouserForm.reset({
      item_id: 0,
      location_id: 0,
      transfer_to_user: 0
    })

    this.systemtouserForm.controls['location_id'].enable();
    this.itemtolocationForm.reset({
      item_id3: 0,
      location_id3: 0
    })

    if (this.configureitemdetails && this.configureitemdetails.length != 0) {
      this.configureitemdetails.length = 0;
    }

  }


  assignsysttouserbtn() {
    this.resetextraarrays();

    if (this.systemConfigurationobj && this.systemConfigurationobj.length !== 0) {
      this.systemConfigurationobj.length = 0;
    }

    if (this.configureitemdetails && this.configureitemdetails.length !== 0) {
      this.configureitemdetails.length = 0;
    }

    if (this.transferStockData.location_id && this.transferStockData.location_id != 0) {
      this.transferStockData.location_id = 0;
    }

    this.itemtosystemForm.reset({
      item_id2: 0,
      location_id2: 0,
      transfer_to_user: 0
    })

    this.itemtolocationForm.reset({
      item_id3: 0,
      location_id3: 0
    })

    this.itemtosystemForm.controls['location_id2'].enable();
  }

  assignitemstolocationbtn() {
    this.resetextraarrays();

    if (this.configureitemdetails && this.configureitemdetails.length !== 0) {
      this.configureitemdetails.length = 0;
    }

    if (this.transferStockData2.location_id && this.transferStockData2.location_id != 0) {
      this.transferStockData2.location_id = 0;
    }

    this.systemtouserForm.reset({
      item_id: 0,
      location_id: 0,
      transfer_to_user: 0,
    });

    this.itemtosystemForm.reset({
      item_id2: 0,
      location_id2: 0,
      transfer_to_user: 0,
    })

    this.itemtosystemForm.controls['location_id2'].enable();

  }

  getSystmeDatabyItemId(id: any) {
    this.systemTransferData = '';
    return new Promise<void>((resolve) => {
      const itemId = {
        item_id: id
      }

      this.sharedService.getsystemDatabyitemId(itemId).subscribe({
        next: (results: any) => {
          // const lengthofresults =+ results.length-1 ;
          console.log(results, "getsystemdata");
          this.systemTransferData = results.filter((e: any) => {
            return (e.location_id == 2 || e.location_id == 3)
          }).map((item: any) => {
            const filterdate = item.transfer_date ? moment(item.transfer_date).utc().local().format('DD-MM-YYYY') : 'NA';
            return {
              ...item, transfer_date: filterdate
            };
          })
          [0];
          resolve();
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
    })
  }

  async getTransferData(data: any): Promise<any> {
    try {
      //configuration  
      const results: any = await this.sharedService.getsystemDataotherThanCPU(data).toPromise();
      console.log(results, "getsystemDataotherThanCPU");

      if (results[0] && results[0].length !== 0) {
        this.configureitemdetails = JSON.parse(JSON.stringify(results));
        if (results[0].system_name == null && results[0].user_name == null) {
          console.log('Not assigned yet!')
        }
        else {
          this.getTransferDataDetailotherthanCPU = `${results[results.length - 1].item_code} is presently assigned to ${results[0].system_name ? results[0].system_name : results[0].user_name}`;

        }

      } else {
        // console.log(this.configureitemdetails, "this.configureitemdetails")
        this.resetextraarrays();

        // this.getTransferDataDetailotherthanCPU = '';
        //if there is no configuration at all 
        // console.log("in else part...");
        // this.configureitemdetails = [];
        // console.log(data, "this.itemdetailsbyitemid")
        //below gives system information
        const itemResults: any = await this.sharedService.getitemsdatabyitemid(data).toPromise();
        this.itemdetailsbyitemid = await itemResults;
        console.log(itemResults, "itemResults");

        return itemResults;
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
  }

  async selecteditems2(itemid: any) {
    // console.log(this.systemConfigurationobj, "this.systemConfigurationobj")
    this.selecteditemname = itemid?.item_name;

    if (itemid?.item_id) {

      this.transferStockData2.item_id = itemid.item_id;
      this.itemId.item_id = itemid.item_id;

      try {
        await this.getTransferData(this.itemId);

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
    else {
      this.transferStockData2.item_id = 0;
      // this.configureitemdetails.length = 0;
    }
  }
  // replacementLogic(newitem: any, replacement: any) {

  //   // this.getItemidwithitemcode(replacement);
  //   /* inputOptions can be an object or Promise */
  //   Swal.fire({
  //     title: "Are you sure?",
  //     text: `You want to replace ${newitem} with ${replacement}`,
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#3085d6",
  //     cancelButtonColor: "#d33",
  //     confirmButtonText: "Yes, replace it!"
  //   }).then(async (result) => {
  //     if (result.isConfirmed) {
  //       /* inputOptions can be an object or Promise */
  //       const inputOptions = new Promise<{ [key: number]: string }>((resolve) => {
  //         setTimeout(() => {
  //           const options = {
  //             1: "Warehouse",
  //             4: "Scraped",
  //           };
  //           console.log("Options:", options); // Add this line for debugging
  //           resolve(options);
  //         }, 500);
  //       });

  //       try {
  //         const { value: selectedLocation } = await Swal.fire({
  //           title: `Where you want to put ${replacement}`,
  //           input: "radio",
  //           inputOptions: await inputOptions, // Resolve the promise here
  //           inputValidator: (value: string) => {
  //             if (!value) {
  //               return "You need to choose something!";
  //             }
  //             return '';
  //           }
  //         });

  //         if (selectedLocation) {
  //           console.log(selectedLocation, "selectedLocation")
  //           this.getItemidwithitemcodeforotheritems(replacement).then(async () => {
  //             const transferStockdata =
  //             {
  //               item_id: +this.itemdataforotheritems[0].item_id,
  //               transfer_to: 0,
  //               location_id: + selectedLocation,
  //               transfer_by: localStorage.getItem('login_id'),
  //               transfer_category: 1
  //             }
  //             console.log(transferStockdata, "transferStockdata");
  //             await this.transferStocktoLocation().then(() => {
  //               // console.log(calledfunction.name, "calledfunction.name");
  //               // if (calledfunction) {
  //               //   const functionname = '' + calledfunction.name;
  //               //   switch (functionname) {

  //               //     case 'selectram1forassembled':
  //               //       this.newsystemFormData.ram1code = newitem;
  //               //       this.newsystemFormDataforupdate.ram1code = newitem;
  //               //       break;

  //               //     case 'selectram1forbrandedsystem':
  //               //       this.newsystemFormData.ram1code = newitem;
  //               //       this.newsystemFormDataforupdate.ram1code = newitem;
  //               //       break;

  //               //     case 'selectram2forassembled':
  //               //       this.newsystemFormData.ram2code = newitem;
  //               //       this.newsystemFormDataforupdate.ram2code = newitem;
  //               //       break;

  //               //     case 'selectram2forbrandedsystem':
  //               //       this.newsystemFormData.ram2code = newitem;
  //               //       this.newsystemFormDataforupdate.ram2code = newitem;

  //               //       break;

  //               //     case 'selectram3forassembled':
  //               //       this.newsystemFormData.ram3code = newitem;
  //               //       this.newsystemFormDataforupdate.ram3code = newitem;

  //               //       break;

  //               //     case 'selectram3forbrandedsystem':
  //               //       this.newsystemFormData.ram3code = newitem;
  //               //       this.newsystemFormDataforupdate.ram3code = newitem;
  //               //       break;

  //               //     case 'selectram4forassembled':
  //               //       this.newsystemFormData.ram4code = newitem;
  //               //       this.newsystemFormDataforupdate.ram4code = newitem;
  //               //       break;
  //               //     case 'selectram4forbrandedsystem':
  //               //       this.newsystemFormData.ram4code = newitem;
  //               //       this.newsystemFormDataforupdate.ram4code = newitem;
  //               //       break;
  //               //     case 'selecthdd1forassembled':
  //               //       this.newsystemFormData.hdd1code = newitem;
  //               //       this.newsystemFormDataforupdate.hdd1code = newitem;
  //               //       break;
  //               //     case 'selecthdd1forbrandedsystem':
  //               //       this.newsystemFormData.hdd1code = newitem;
  //               //       this.newsystemFormDataforupdate.hdd1code = newitem;
  //               //       break;
  //               //     case 'selecthdd2forassembled':
  //               //       this.newsystemFormData.hdd2code = newitem;
  //               //       this.newsystemFormDataforupdate.hdd2code = newitem;
  //               //       break;
  //               //     case 'selecthdd2brandedsystem':
  //               //       this.newsystemFormData.hdd2code = newitem;
  //               //       this.newsystemFormDataforupdate.hdd2code = newitem;
  //               //       break;
  //               //     case 'selectsmpsforassembled':
  //               //       this.newsystemFormData.smpscode = newitem;
  //               //       this.newsystemFormDataforupdate.smpscode = newitem;
  //               //       break;
  //               //     case 'selectsmpsforbrandedsystem':
  //               //       this.newsystemFormData.smpscode = newitem;
  //               //       this.newsystemFormDataforupdate.smpscode = newitem;
  //               //       break;
  //               //     case 'selectgraphiccardcodeforassembled':
  //               //       this.newsystemFormData.graphiccardcode = newitem;
  //               //       this.newsystemFormDataforupdate.graphiccardcode = newitem;
  //               //       break;
  //               //     case 'selectgraphiccardcodeforbrandedsystem':
  //               //       this.newsystemFormData.graphiccardcode = newitem;
  //               //       this.newsystemFormDataforupdate.graphiccardcode = newitem;
  //               //       break;
  //               //   }
  //               // }

  //               // this.previousDatafromsubjectBehaviour();
  //             });
  //           })

  //           //now send it according to selected value
  //           // Swal.fire({ html: `You selected: ${selectedColor}` });
  //         }
  //       } catch (error: unknown) {
  //         if (error instanceof HttpErrorResponse && error.status === 403) {
  //           await Swal.fire({
  //             icon: 'error',
  //             title: 'Oops!',
  //             text: 'Token expired.',
  //             footer: '<a href="../login">Please login again!</a>'
  //           }).then(() => {
  //             this.router.navigate(['../login']);
  //           })

  //         } else {
  //           await Swal.fire({
  //             icon: 'error',
  //             title: 'Oops!',
  //             text: 'Internal server error. Please try after some time!',
  //             footer: '<a href="../login">Login</a>'
  //           }).then(() => {
  //             location.reload();
  //           })
  //         }
  //       }
  //     }
  //     else {

  //       // console.log(calledfunction.name, "calledfunction.name");
  //       // if (calledfunction) {
  //       //   const functionname = '' + calledfunction.name;
  //       //   switch (functionname) {

  //       //     case 'selectram1forassembled':
  //       //       this.newsystemFormData.ram1code = this.backupoldItemsfromsysteminfo.ram1code;
  //       //       this.newsystemFormDataforupdate.ram1code = this.backupoldItemsfromsysteminfo.ram1code;
  //       //       break;

  //       //     case 'selectram1forbrandedsystem':
  //       //       this.newsystemFormData.ram1code = this.backupoldItemsfromsysteminfo.ram1code;
  //       //       this.newsystemFormDataforupdate.ram1code = this.backupoldItemsfromsysteminfo.ram1code;
  //       //       break;

  //       //     case 'selectram2forassembled':
  //       //       this.newsystemFormData.ram2code = this.backupoldItemsfromsysteminfo.ram2code;
  //       //       this.newsystemFormDataforupdate.ram2code = this.backupoldItemsfromsysteminfo.ram2code;
  //       //       break;

  //       //     case 'selectram2forbrandedsystem':
  //       //       this.newsystemFormData.ram2code = this.backupoldItemsfromsysteminfo.ram2code;
  //       //       this.newsystemFormDataforupdate.ram2code = this.backupoldItemsfromsysteminfo.ram2code;

  //       //       break;

  //       //     case 'selectram3forassembled':
  //       //       this.newsystemFormData.ram3code = this.backupoldItemsfromsysteminfo.ram3code;
  //       //       this.newsystemFormDataforupdate.ram3code = this.backupoldItemsfromsysteminfo.ram3code;

  //       //       break;

  //       //     case 'selectram3forbrandedsystem':
  //       //       this.newsystemFormData.ram3code = this.backupoldItemsfromsysteminfo.ram3code;
  //       //       this.newsystemFormDataforupdate.ram3code = this.backupoldItemsfromsysteminfo.ram3code;
  //       //       break;

  //       //     case 'selectram4forassembled':
  //       //       this.newsystemFormData.ram4code = this.backupoldItemsfromsysteminfo.ram4code;
  //       //       this.newsystemFormDataforupdate.ram4code = this.backupoldItemsfromsysteminfo.ram4code;
  //       //       break;
  //       //     case 'selectram4forbrandedsystem':
  //       //       this.newsystemFormData.ram4code = this.backupoldItemsfromsysteminfo.ram4code;
  //       //       this.newsystemFormDataforupdate.ram4code = this.backupoldItemsfromsysteminfo.ram4code;
  //       //       break;
  //       //     case 'selecthdd1forassembled':
  //       //       this.newsystemFormData.hdd1code = this.backupoldItemsfromsysteminfo.hdd1code;
  //       //       this.newsystemFormDataforupdate.hdd1code = this.backupoldItemsfromsysteminfo.hdd1code;
  //       //       break;
  //       //     case 'selecthdd1forbrandedsystem':
  //       //       this.newsystemFormData.hdd1code = this.backupoldItemsfromsysteminfo.hdd1code;
  //       //       this.newsystemFormDataforupdate.hdd1code = this.backupoldItemsfromsysteminfo.hdd1code;
  //       //       break;
  //       //     case 'selecthdd2forassembled':
  //       //       this.newsystemFormData.hdd2code = this.backupoldItemsfromsysteminfo.hdd2code;
  //       //       this.newsystemFormDataforupdate.hdd2code = this.backupoldItemsfromsysteminfo.hdd2code;
  //       //       break;
  //       //     case 'selecthdd2brandedsystem':
  //       //       this.newsystemFormData.hdd2code = this.backupoldItemsfromsysteminfo.hdd2code;
  //       //       this.newsystemFormDataforupdate.hdd2code = this.backupoldItemsfromsysteminfo.hdd2code;
  //       //       break;
  //       //     case 'selectsmpsforassembled':
  //       //       this.newsystemFormData.smpscode = this.backupoldItemsfromsysteminfo.smpscode;
  //       //       this.newsystemFormDataforupdate.smpscode = this.backupoldItemsfromsysteminfo.smpscode;
  //       //       break;
  //       //     case 'selectsmpsforbrandedsystem':
  //       //       this.newsystemFormData.smpscode = this.backupoldItemsfromsysteminfo.smpscode;
  //       //       this.newsystemFormDataforupdate.smpscode = this.backupoldItemsfromsysteminfo.smpscode;
  //       //       break;
  //       //     case 'selectgraphiccardcodeforassembled':
  //       //       this.newsystemFormData.graphiccardcode = this.backupoldItemsfromsysteminfo.graphiccardcode;
  //       //       this.newsystemFormDataforupdate.graphiccardcode = this.backupoldItemsfromsysteminfo.graphiccardcode;
  //       //       break;
  //       //     case 'selectgraphiccardcodeforbrandedsystem':
  //       //       this.newsystemFormData.graphiccardcode = this.backupoldItemsfromsysteminfo.graphiccardcode;
  //       //       this.newsystemFormDataforupdate.graphiccardcode = this.backupoldItemsfromsysteminfo.graphiccardcode;
  //       //       break;
  //       //   }
  //       // }
  //       // this.newsystemFormDataforupdate. 
  //     }
  //   });
  // }

  // getItemidwithitemcodeforotheritems(item_code: any): Promise<void> {
  //   return new Promise<void>((resolve, reject) => {

  //     const ItemId = {
  //       item_code: item_code
  //     }
  //     // console.log(ItemId, "ItemId")

  //     this.sharedService.getitemdatafromitemcode(ItemId).subscribe({
  //       next: (results: any) => {
  //         console.log(results, "getitemdatafromitemcode");

  //         this.itemdataforotheritems = results;
  //         resolve();

  //       },
  //       error: (error) => {
  //         if (error.status == 403) {
  //           Swal.fire({
  //             icon: 'error',
  //             title: 'Oops!',
  //             text: 'Token expired.',
  //             footer: '<a href="../login">Please login again!</a>'
  //           }).then(() => {
  //             this.router.navigate(['../login']);
  //             reject(); // Reject the Promise in case of an error

  //           })
  //         }
  //         else {
  //           Swal.fire({
  //             icon: 'error',
  //             title: 'Oops!',
  //             text: 'Internal server error.Please try after some time!',
  //             footer: '<a href="../login">Login</a>'
  //           }).then(() => {
  //             location.reload();
  //             reject(); // Reject the Promise in case of an error

  //           })
  //         }
  //       }
  //     });
  //   });
  // }


  //all configuration of the cpu
  getSystemConfiguration(cpu: any) {
    this.systemConfigurationobj.length = 0;
    this.sharedService.getSystemConfiguration(cpu).subscribe(
      {
        next: (results: any) => {


          if (results?.length === 0) {

            this.systemConfigurationobj.length = 0;
          }

          else {
            //only shows those items having appropriate location
            // this.systemConfigurationobj = results.filter((items: any) => {
            //   return items.location_id === 2;
            // });
            console.log(results, "getSystemConfigurationbeforefilter");
            //  this.systemConfigurationobj = results;

            this.systemConfigurationobj = results
              .filter((item: any) => (item.location_id === 2 || item.location_id === 3) && item.category_name == "Computer Hardware" && (item.item_name !== 'CPU' || item.item_name !== 'LAPTOP' || item.item_name !== 'ALL IN ONE PC'))
              .map((item: any) => {
                const filtereditemDate = item.transfer_date ? item.transfer_datemoment(item.transfer_date).utc().format('DD-MM-YYYY') : 'NA';
                //checking itemname assigned to the above system
                this.itemnamearray.push(item?.item_name);
                return {
                  ...item, transfer_date: filtereditemDate
                }
              });

            //  this.systemConfigurationobj = results.filter((items: any) => {
            //   return (items.location_id === 2 ||items.location_id === 3);
            // });
            // // this.systemConfigurationlength = this.systemConfigurationobj.length;
            // //saving all item names in an array
            // this.systemConfigurationobj.map((e:any)=>{
            //   const filtereditemDate = moment(e.transfer_date).local().format('YYYY-MM-DD');
            //   //checking itemname assigned to the above system
            //    this.itemnamearray.push(e?.item_name);
            //    return {
            //     ...e, transfer_date:filtereditemDate
            //    }

            //  })
            console.log(this.itemnamearray, "this.itemnamearray");
          }
        }, error: error => {
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

  async getSystemConfigurationforscrapsystem(cpu: any) {
    const TransferTo = {
      transfer_to: +cpu
    };

    console.log(TransferTo, "TransferTo");

    try {
      const results: any = await new Promise((resolve, reject) => {
        this.sharedService.getSystemConfiguration(TransferTo).subscribe({
          next: resolve,
          error: reject
        });
      });
      console.log(results, "getSystemConfiguration")

      if (results?.length === 0) {
        this.systemConfigurationforsrapcpu.length = 0;
      } else {
        this.systemConfigurationforsrapcpu = results
          .filter((item: any) => (item.location_id === 2 || item.location_id === 3) && (item.item_name !== 'CPU' || item.item_name !== 'LAPTOP' || item.item_name !== 'ALL IN ONE PC'))
          .map((item: any) => {
            const filtereditemDate = item.transfer_date ? moment(item.transfer_date).local().format('YYYY-MM-DD') : 'NA';
            //checking itemname assigned to the above system
            this.itemnamearray.push(item?.item_name);
            return {
              ...item, transfer_date: filtereditemDate
            };
          });

        console.log(this.systemConfigurationforsrapcpu, "systemConfigurationforsrapcpu");
        console.log(this.itemnamearray, "this.itemnamearray");
      }
    } catch (error) {
      console.error("Error occurred while fetching system configuration:", error);
      // Handle error appropriately
    }
  }

  assignitemstolocationbtnChecked() {
    this.ngOnInit();
    this.assignsysttouserbtnValue = false;
    this.assignitemstosysbtnValue = false;
    this.assignitemstolocationbtnValue = true;
  }

  selectedCPU(data: any) {
    this.systemtouserForm.get('location_id')?.enable();
    // this.transferStockData.item_id = +data;
    this.dataforsystemInfo.item_code = data?.item_code;
    // console.log(data.item_code, "data");

    if (data?.item_id) {
      this.systemTransferDatadistplay = true;
      this.transferStockData.location_id = 2;
      this.getSystmeDatabyItemId(data?.item_id);
      this.systemtouserForm.get('location_id')?.disable();
    }
    else {
      this.transferStockData.item_id = 0;
    }

  }

  async selectedCPU2(data: any) {
    if (data?.item_id) {
      this.transferStockData2.transfer_to_user = data?.user_id;
      this.systemTransferDatadistplay = true;
      this.transferTo.transfer_to_user = data?.item_id;
      await this.getSystmeDatabyItemId(data?.item_id).then(() => {
        if (this.systemTransferData) {
          console.log(this.systemTransferData, "this.systemTransferData");
          // this.getLocationbyitem_id(data?.item_id);
          this.getSystemConfiguration(this.transferTo);
          this.transferStockData2.location_id = this.systemTransferData?.location_id;
          this.transferStockData.location_id = this.systemTransferData?.location_id;
          this.itemtosystemForm.controls['location_id2'].disable();
        }
        else {
          Swal.fire({
            icon: 'question',
            html: 'This system is not assigned to any user!<br>Please assigned to any user first!',
          }).then(() => {
            this.transferStockData2.transfer_to_user = 0;
            this.transferStockData2.location_id = 0;
            this.transferStockData.location_id = 0;
            this.itemtosystemForm.controls['location_id2'].enable();
          }
          )
        }

      })
    }
    else {
      this.itemtosystemForm.reset({
        transfer_to_user: 0
      })
    }
  }

  async selectitem3(itemid: any) {

    console.log(itemid, "itemid");

    const locationofItem = itemid.location_id;

    this.dataforsysteminfowhenscrapped.item_code = itemid?.item_code;
    this.transferStockData3.item_id = itemid?.item_id;

    console.log(this.dataforsysteminfowhenscrapped, "this.dataforsysteminfowhenscrapped")
    // console.log(itemid, "dataforsysteminfowhenscrapped")

    if (itemid?.location_id == 1 || itemid?.location_id == 2 || itemid?.location_id == 3) {
      this.getAllDataatonce()

      //  timer(700).pipe(take(1)).subscribe(()=>{
      setTimeout(() => {
        this.locationdata = this.locationdata.filter((item: any) => {

          return item.location_id != 5 && item.location_id != 6 && item.location_id != locationofItem
        });

        this.transferStockData3.item_id = itemid.item_id;
        this.itemId.item_id = itemid.item_id;
        this.getTransferData(this.itemId);
      }, 800);
    }
    else {
      if (itemid?.location_id == 4 || itemid?.location_id == 7 || itemid?.location_id == 8) {
        this.getAllDataatonce();
        //timer and take works as setimeout
        // timer(700).pipe(take(1)).subscribe(async()=>{
        setTimeout(async () => {
          
          this.locationdata = this.locationdata.filter((item: any) => {
            return (item.location_id == 5 || item.location_id == 6);
          })
          // console.log(this.locationdata, "location_data");
          this.transferStockData3.item_id = itemid.item_id;
          this.itemId.item_id = itemid.item_id;
          await this.getTransferData(this.itemId).then(() => {
            this.getTransferDataDetailotherthanCPU = `Item is scrapped.`;
          });
        }, 800);
        //scrapped items only soldout or gifted
        // });     
      }
      // else if(itemid?.location_id == 5){
      //   this.transferStockData3.item_id = itemid.item_id;
      //   this.itemId.item_id = itemid.item_id;
      //   this.getTransferDataDetailotherthanCPU = `Item is soldout.`
      // }
      // this.transferStockData3.item_id = 0;
      if (this.configureitemdetails) {
        this.configureitemdetails.length = 0;
      }
    }
  }

  selectLocation3(location: any) {
    console.log(location?.location_id, "selectLocation3");
    this.transferStockData3.location_id = location?.location_id;
  }

  selecteduser2(data: any) {
    this.dataforsystemInfo.username = '' + data?.user_id;

    if (data?.user_id) {
      this.transferStockData2.transfer_to_user = +data?.user_id;
      this.transferTo.transfer_to_user = +data?.user_id;
      this.systemTransferDatadistplay = true;
      this.transferStockData2.location_id = 2;
      this.itemtosystemForm.get('location_id2')?.disable();
      this.getitemtouserdata(data?.user_id);
    }
    else {
      this.transferStockData2.transfer_to_user = 0;
    }
  }

  selecteduser(data: any) {
    this.dataforsystemInfo.username = '' + data?.user_id;

    if (data?.user_id) {
      this.transferStockData.transfer_to_user = +data?.user_id;
      this.transferTo.transfer_to_user = +data?.user_id;
      this.getitemtouserdata(data?.user_id);
    }
    else {
      this.transferStockData.transfer_to_user = 0;
    }
  }

  async getitemtouserdata(userId: number) {
    const usersid = {
      user_id: userId
    }

    const result: any = await this.sharedService.getitemsforusers(usersid).toPromise();
    console.log("getitemtouserdata", result);
    if (result) {
      this.itemsdataforusers = result.filter((e: any) => {
        return (e.location_id == 1 || e.location_id == 2)
      })

        .map((items: any) => {
          const filtereditemsdate = items.transfer_date ? moment(items.transfer_date).utc().local().format('DD-MM-YYYY') : 'NA';

          return {
            ...items, transfer_date: filtereditemsdate
          }
        });
    }
  }

  getLocationbyitem_id(id: any) {
    const itemId = {
      item_id: id
    }

    this.sharedService.getLocationbyitemid(itemId).subscribe({
      next: (results: any) => {
        this.transferStockData2.location_id = results[0].location_id;
        this.transferStockData.location_id = results[0].location_id;
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

  async basicTransferFunction(): Promise<void> {
    //making it new promise to use as async/await in other function.
    return new Promise<void>(async (resolve) => {
      if (this.itemtosystemForm.invalid) {
        this.itemtosystemForm.markAllAsTouched();
      }

      else {
        const getTransferDatafunction = this.getTransferData(this.itemId);
        console.log(this.transferStockData2);

        this.adminService.transferStock(this.transferStockData2).subscribe({
          next: async (results: any) => {
            await Swal.fire({
              title: 'Success!',
              text: `Item transferred to the user successfully!`,
              icon: 'success',
            });
            this.resetextraarrays();

            //updating location in items and transfer stock tbl in db
            //not needed automaticallylocationupdate from api
            // this.updateLocationinitemandTransferStock(this.itemId.item_id, this.transferStockData2.location_id);

            resolve(); // Resolving the promise after asynchronous operations
          },
          error: (error) => {
            if (error.status == 403) {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Token expired. Please login..',
                footer: '<a href="../login">Please Login..</a>'
              }).then(() => {
                this.router.navigate(['../login']);
                resolve(); // Resolving the promise after asynchronous operations
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Oops',
                text: 'Internal server error!',
                footer: '<a href="../login">Please try after some time.</a>'
              }).then(() => {
                location.reload();
                resolve(); // Resolving the promise after asynchronous operations
              });
            }
          }
        });
      }
    });
  }

  transfersystemtouser() {
    if (this.systemtouserForm.invalid) {
      this.systemTransferDatadistplay = !this.systemTransferDatadistplay;
      this.systemtouserForm.markAllAsTouched();
    }
    else {
      console.log(this.transferStockData, "transfer_data");

      this.adminService.transferStock(this.transferStockData).subscribe({
        next: (results: any) => {

          Swal.fire({
            title: 'Success!',
            text: `System successfully assigned to the user!`,
            icon: 'success',
          }).then(() => {

            this.updateUserinSysteminfo();
            this.systemTransferDatadistplay = !this.systemTransferDatadistplay;
            this.systemtouserForm.reset({
              item_id: 0,
              location_id: 0,
              transfer_to_user: 0
            })
            this.resetextraarrays();
            this.systemtouserForm.controls['location_id'].enable();
            this.getAllDataatonce()
            this.getalluserandsystemused();
            if (this.systemtouserForm.markAsTouched()) {
              this.systemtouserForm?.markAsUnTouched();
            }

          })
        }

      })
    }
  }


  updateUserinSysteminfo() {
    console.log(this.dataforsystemInfo, "dataforsysteminfo");
    this.adminService.updateuserinSysteminfo(this.dataforsystemInfo).subscribe({
      next: (results: any) => {
        console.log('User updated in system_info', results)
      },
      error: (error) => {
        console.error(error);
        if (error.status == 403) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Token expired. Please login..',
            footer: '<a href="../login">Please Login..</a>'
          }).then(() => {
            this.router.navigate(['../login']);
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops',
            text: 'Internal server error!',
            footer: '<a href="../login">Please try after some time.</a>'
          }).then(() => {
            location.reload();
          });
        }
      }
    })

  }


  async transferItemtoSystem() {
    await this.basicTransferFunction()
      .then(() => {
        if (this.configureitemdetails && this.configureitemdetails.length !== 0) {
          this.configureitemdetails.length = 0;
        }
        this.systemTransferDatadistplay = !this.systemTransferDatadistplay;
        this.itemtosystemForm.reset({
          item_id2: 0,
          transfer_to_user: 0,
          location_id2: 0
        })
        this.itemtosystemForm.controls['location_id2'].enable();
        // this.getTransferDataDetailotherthanCPU.length = 0;
        this.systemConfigurationobj.length = 0;
        this.getTransferDataDetailotherthanCPU = '';

        // this.systemConfigurationlength = 0;
        this.getAllDataatonce();
        this.getalluserandsystemused();
        this.getAssigneddatafromtsandsysteminfo();
      })
  }



  async transferitemtoLocation() {
    const itemId = {
      item_id: +this.transferStockData3.item_id
    };

    const itemResults: any = await this.sharedService.getitemsdatafromitemid(itemId).toPromise();
    console.log(itemResults, "itemResults");

    console.log(this.transferStockData3, "transferStockData3");
    if (this.itemtolocationForm.invalid) {
      this.itemtolocationForm.markAllAsTouched();
    }
    else {
      switch (+this.transferStockData3.location_id) {
        case 4:
        case 7:
        case 8:
          if (itemResults[0].item_name == 'CPU' || itemResults[0].item_name == 'LAPTOP' || itemResults[0].item_name == 'ALL IN ONE PC') {
            await this.getSystemConfigurationforscrapsystem(itemResults[0].item_id);

            Swal.fire({
              title: `Are you  really want to transfer ${itemResults[0].item_name} to scrap?`,
              text: "You won't be able to revert this!",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Yes, Scrap it!'
            }).then(async (result) => {

              if (result.isConfirmed) {

                this.dataforsystemInfo.item_code = itemResults[0].item_code;
                this.dataforsystemInfo.username = null;
                this.updateUserinSysteminfo();

                const checkconfigureditems = this.systemConfigurationforsrapcpu.filter((e: any) => {
                  return (e.location_id == 2 || e.location_id == 3)
                })

                console.log(checkconfigureditems, "checkconfigureditems");

                if (checkconfigureditems && checkconfigureditems.length !== 0) {

                  const inputOptions = new Promise<{ [key: number]: string }>((resolve) => {
                    setTimeout(() => {
                      const options = {
                        1: "Warehouse",
                        4: "Scrapped",
                      };
                      console.log("Options:", options); // Add this line for debugging
                      resolve(options);
                    }, 500);
                  });

                  const { value: selectedLocation } = await Swal.fire({
                    title: `Where you want to put items configured in ${itemResults[0].item_code}`,
                    input: "radio",
                    inputOptions: await inputOptions, // Resolve the promise here
                    inputValidator: (value: string) => {
                      if (!value) {
                        return "You need to choose something!";
                      }
                      return '';
                    }
                  })
                  // alert(itemResults[0].item_name);
                  if (selectedLocation) {
                    // cpu scrap
                    this.sendingalltowarehousewhencpuscrap = this.systemConfigurationforsrapcpu.map((item: any) => ({
                      item_id: item.item_id,
                      transfer_to_system: null,
                      location_id: +selectedLocation,
                      transfer_by: localStorage.getItem('login_id'),
                      transfer_category: 0,
                      transfer_to_user: null,
                    }));

                    try {

                      await this.adminService.transferStockformultipledata(this.sendingalltowarehousewhencpuscrap).toPromise();

                      await this.transferStocktoLocation().then(() => {
                        this.updatesysteminfoforsrapitem();
                        this.itemtolocationForm.markAsUntouched({ emitEvent: true });
                      })
                      Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Done!",
                        showConfirmButton: false,
                        timer: 1000
                      });
                    }
                    catch {
                      Swal.fire({
                        position: "center",
                        icon: "error",
                        title: "Cancelled!",
                        showConfirmButton: false,
                        timer: 1000
                      });
                    }

                    console.log(this.sendingalltowarehousewhencpuscrap);
                  }
                  else {

                    Swal.fire({
                      position: "center",
                      icon: "error",
                      title: "Cancelled!",
                      showConfirmButton: false,
                      timer: 1000
                    });

                  }
                }
                else {
                  await this.transferStocktoLocation().then(() => {
                    this.updatesysteminfoforsrapitem();
                    this.itemtolocationForm.markAsUntouched({ emitEvent: true });
                  })
                }
              }
            })
          }
          else {
            Swal.fire({
              title: 'Are you  really want to transfer this item to scrap?',
              text: "You won't be able to revert this!",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Yes, Scrap it!'
            }).then(async (result) => {
              if (result.isConfirmed) {
                console.log(this.transferStockData3, "this.transferStockData3");

                await this.transferStocktoLocation().then(() => {
                  this.updatesysteminfoforsrapitem();
                  this.itemtolocationForm.markAsUntouched({ emitEvent: true });
                })
              }
            })
          }

          break;
        case 5:
          Swal.fire({
            title: 'Are you really want to sold out this item?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, sold it!'
          }).then(async (result) => {
            if (result.isConfirmed) {
              await this.transferStocktoLocation()
              // .then(()=>{
              //   //if scrapped here also show in system info
              //   this.updatesysteminfoforsrapitem();
              // })
              this.itemtolocationForm.markAsUntouched({ emitEvent: true });
            }
          })
          break;

        case 6:
          Swal.fire({
            title: 'Are you really want to gift this item?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, sold it!'
          }).then(async (result) => {
            if (result.isConfirmed) {
              await this.transferStocktoLocation()
              // .then(()=>{
              //   //if scrapped here also show in system info
              //   this.updatesysteminfoforsrapitem();
              // })

              this.itemtolocationForm.markAsUntouched({ emitEvent: true });
            }
          })
          break;

        default:
          //locatiob id 1,2,3
          //if cpu then username get removed from system info also
          if (itemResults[0].item_name == 'CPU' || itemResults[0].item_name == 'LAPTOP' || itemResults[0].item_name == 'ALL IN ONE PC') {
            this.dataforsystemInfo.item_code = itemResults[0].item_code;
            this.dataforsystemInfo.username = null;
            this.updateUserinSysteminfo();
          }
          this.updatesysteminfoforsrapitem();
          this.transferStocktoLocation();
          break;
      }
    }

    this.getAssigneddatafromtsandsysteminfo();
    this.getalluserandsystemused();
    this.resetextraarrays();

  }


  updatesysteminfoforsrapitem() {
    this.adminService.updatescrappediteminSysteminfo(this.dataforsysteminfowhenscrapped).subscribe({
      next: (results: any) => {
        console.log(results, "Scrapped item updated in system info")
      },
      error: (error: any) => {
        console.error(error);
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


  transferStocktoLocation(): Promise<void> {
    return new Promise<void>((resolve) => {
      console.log(this.transferStockData3, "this.transferStockData3");
      this.adminService.transferStock(this.transferStockData3).subscribe({
        next: (results: any) => {
          Swal.fire({
            title: 'Success!',
            text: `Item transferred to the location successfully!`,
            icon: 'success',
          }).then(() => {
            this.itemtolocationForm.reset({
              item_id3: 0,
              location_id3: 0,
            })

            this.systemConfigurationobj.length = 0;
            this.getAllDataatonce();
            resolve(); // Resolve the Promise when done

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

      });
    });
  }

  onLocationSelect2(item: any) {
    // Handle selected item
    if (item?.location_id) {
      this.transferStockData2.location_id = item.location_id
    }
    else {
      this.transferStockData2.location_id = 0;
    }
  }


  onLocationSelect3(item: any) {
    // Handle selected item
    this.transferStockData3.location_id = item.location_id
  }

  async getalluserandsystemused() {
    try {
      this.allconnectedusersandsystems.length = 0;
      const results: any = await this.sharedService.getallusershavingsystem().toPromise();
      console.log(results, "results")
      for (let items of results) {

        if (items.location_id && (items.location_id == 2 || items.location_id == 3)) {
          this.allconnectedusersandsystems.push(items.item_code, items.user_name);
        }
        //all cpus and users are in pushed in same array...
      }
      // console.log(this.allconnectedusersandsystems, "this.allconnectedusersandsystems");
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

  resetextraarrays() {
    this.systemConfigurationobj.length = 0;
    this.itemsdataforusers.length = 0;
    this.systemTransferData = '';
    this.getTransferDataDetailotherthanCPU = '';
    this.systemTransferDatadistplay = false;
  }

  // navigateBack() {
  //   const variable = localStorage.getItem('backUrl');
  //   console.log(variable, "variable");

  //   // If a back URL exists in localStorage, navigate to it
  //   if (variable) {
  //     this.router.navigateByUrl(variable);  // This ensures the full URL with query params is used
  //     localStorage.removeItem('backUrl');  // Remove the stored back URL after navigation
  //   } else {
  //     console.log('No back URL found in localStorage');
  //   }
  // }

  navigateBack() {
  const variable = localStorage.getItem('backUrl');
  console.log(variable, "variable");

  if (variable) {
    // Restore back URL (with params if it had any)
    this.router.navigateByUrl(variable).then(() => {
      // After navigating back, mark it as navigated so checkQueryParams() processes once
      localStorage.setItem('navigated', 'true');
      // Clear stored back URL (so it won’t keep reusing old one)
      localStorage.removeItem('backUrl');
    });
  } else {
    console.log('No back URL found in localStorage');
  }
}


// for system transfer to user
resetsystemTransfer(){
  this.systemTransferData = null;
}

// for Item transfer to user
resetItemsTransfer(){
  this.getTransferDataDetailotherthanCPU = "";
  
}

// when you select user 
resetItemsDataForuser(){
  this.itemsdataforusers = [];
}






  //three different forms for different transferring...
  validationradiobtn() {
    this.transferStockForm = new FormGroup({
      transferType: new FormControl('assignsystemtouser', [Validators.required]),
    })

    this.systemtouserForm = new FormGroup({
      item_id: new FormControl(0, [Validators.required, Validators.pattern(/^[1-9][0-9]*$/)]),
      transfer_to_user: new FormControl(0, [Validators.required, Validators.pattern(/^[1-9][0-9]*$/)]),
      location_id: new FormControl(0, [Validators.required, Validators.pattern(/^[1-9][0-9]*$/)]),
    })

    this.itemtosystemForm = new FormGroup({
      item_id2: new FormControl(0, [Validators.required, Validators.pattern(/^[1-9][0-9]*$/)]),
      transfer_to_user: new FormControl(0, [Validators.required, Validators.pattern(/^[1-9][0-9]*$/)]),
      location_id2: new FormControl(0, [Validators.required, Validators.pattern(/^[1-9][0-9]*$/)]),
    })

    this.itemtolocationForm = new FormGroup({
      item_id3: new FormControl(0, [Validators.required, Validators.pattern(/^[1-9][0-9]*$/)]),
      location_id3: new FormControl(0, [Validators.required, Validators.pattern(/^[1-9][0-9]*$/)]),
    })
  }

}
