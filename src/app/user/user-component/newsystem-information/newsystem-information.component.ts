import { Component, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { AdminService } from 'src/app/services/admin.service';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom, lastValueFrom, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import * as moment from 'moment';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from 'src/app/environments/environment.prod';

// Define a type for the item
interface TransferStockItem {
  item_id: number;
  transfer_to_system: number;
  location_id: number;
  transfer_by: any;
  transfer_category: number;
  transfer_to_user: null;

}

interface itemsDatatypes {
  purchase_id: string;
  item_code: string;
  item_name: string;
  description: string;
  category_id: number;
  location_id: number;
  invoice_no: string;
  warrantyend_date: string;
  item_status: string;
  created_by: any;
}

// Define a type for the entire data structure
interface TransferStockData {
  ram1: TransferStockItem[];
  ram2: TransferStockItem[];
  ram3: TransferStockItem[];
  ram4: TransferStockItem[];
  hdd1: TransferStockItem[];
  hdd2: TransferStockItem[];
  smps: TransferStockItem[];
  graphiccard: TransferStockItem[];
  [key: string]: TransferStockItem[];
}

type TransferStockKey =
  | 'ram1'
  | 'ram2'
  | 'ram3'
  | 'ram4'
  | 'hdd1'
  | 'hdd2'
  | 'smps'
  | 'graphiccard';

  type SystemFormData = {
  cpucode: any;
  username: any;
  processor: any;
  processorcode?: any;

  ram1: any;
  ram1code: any;
  ram2: any;
  ram2code: any;
  ram3: any;
  ram3code: any;
  ram4: any;
  ram4code: any;

  hdd1: any;
  hdd1code: any;
  hdd2: any;
  hdd2code: any;

  smps: any;
  smpscode: any;

  graphiccard: any;
  graphiccardcode: any;

  cabinet?: any;
  cabinetcode?: any;
  cmos?: any;
  cmoscode?: any;
  motherboard?: any;
  motherboardcode?: any;

  system_type: any;
  description?: any;
};



// interface TransferStockData {
//   [key: string]: { item_id: number, transfer_to_system: number, location_id: number, transfer_by: any, transfer_category: number, transfer_to_user: null }[];
// }


@Component({
  selector: 'app-newsystem-information',
  templateUrl: './newsystem-information.component.html',
  styleUrls: ['./newsystem-information.component.scss']
})


export class NewsystemInformationComponent {
  dropdownSettings = {};

  currentdate: any
  systemradioBtn: any;
  newsystemForm: any;
  newsystemFormData: any = {
    cpucode: '',
    username: 0,
    processor: '',
    processorcode: '',
    ram1: '',
    ram1code: '',
    ram2: '',
    ram2code: '',
    ram3: '',
    ram3code: '',
    ram4: '',
    ram4code: '',
    hdd1: '',
    hdd1code: '',
    hdd2: '',
    hdd2code: '',
    graphiccard: '',
    graphiccardcode: '',
    smps: '',
    smpscode: '',
    cabinet: '',
    cabinetcode: '',
    cmos: '',
    cmoscode: '',
    motherboard: '',
    motherboardcode: '',
    system_type: 'Branded Computer',
    description: '',
    system_status: 1,
    created_by: localStorage.getItem('name')
  }

  newsystemFormDataforupdate: any = {
    sid: 0,
    username: 0,
    processor: '',
    ram1: '',
    ram1code: '',
    ram2: '',
    ram2code: '',
    ram3: '',
    ram3code: '',
    ram4: '',
    ram4code: '',
    hdd1: '',
    hdd1code: '',
    hdd2: '',
    hdd2code: '',
    graphiccard: '',
    graphiccardcode: '',
    smps: '',
    smpscode: '',
    cabinet: '',
    cmos: '',
    motherboard: '',
    system_type: '',
    description: '',
    system_status: 1,
  }

  backupoldItemsfromsysteminfo: any = {
    sid: 0,
    username: 0,
    processor: '',
    ram1: '',
    ram1code: '',
    ram2: '',
    ram2code: '',
    ram3: '',
    ram3code: '',
    ram4: '',
    ram4code: '',
    hdd1: '',
    hdd1code: '',
    hdd2: '',
    hdd2code: '',
    graphiccard: '',
    graphiccardcode: '',
    smps: '',
    smpscode: '',
    cabinet: '',
    cmos: '',
    motherboard: '',
    system_type: '',
    description: '',
    system_status: 1,
  };

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

  //for radio buttons
  systemTypes = [
    { value: 'Branded Computer', label: 'Branded Computer' },
    { value: 'Assembled Computer', label: 'Assembled Computer' },
    { value: 'Old Assembled Computer', label: 'Old Assembled Computer' }
  ];

  displayassembledComputer = false;
  displaybrandedComputer = false;
  displayoldComputer = false;
  displayupdateButton = false;
  displayaddButton = true;
  makecpucoodereadonly = false;
  allsystems: any[] = []
  allsystemsfromsysteminfo: any[] = []
  allRams: any[] = []
  allHDD: any[] = []
  allsmps: any[] = []
  allgraphiccard: any[] = []
  allsysteminfodata: any;
  allusersdata: any;
  matchArray: any = [];
  systemTransferData: any;
  systemTransferDatabyitemid: any
  getTransferDataDetailotherthanCPU: any;
  arrayofassigneditemsints: any = [];
  arrayofassigneditemsinsysinfo: any = [];
  systemtypeforupdatingdata: any;
  itemdatafromts: any;
  itemdataforotheritems: any;
  selectedItem: any;
  updatedataintransferstock: any[] = [];


  // Initialize the itemsData object
  itemsdataobj: any = {
    ram1code: [],
    ram2code: [],
    ram3code: [],
    ram4code: [],
    hdd1code: [],
    hdd2code: [],
    smpscode: [],
    graphiccardcode: [],

  };
  ;

  transferStockDataobj: TransferStockData =
    {
      ram1: [{ item_id: 0, transfer_to_system: 0, location_id: 2, transfer_by: localStorage.getItem('login_id'), transfer_category: 1, transfer_to_user: null }],
      ram2: [{ item_id: 0, transfer_to_system: 0, location_id: 2, transfer_by: localStorage.getItem('login_id'), transfer_category: 1, transfer_to_user: null }],
      ram3: [{ item_id: 0, transfer_to_system: 0, location_id: 2, transfer_by: localStorage.getItem('login_id'), transfer_category: 1, transfer_to_user: null }],
      ram4: [{ item_id: 0, transfer_to_system: 0, location_id: 2, transfer_by: localStorage.getItem('login_id'), transfer_category: 1, transfer_to_user: null }],
      hdd1: [{ item_id: 0, transfer_to_system: 0, location_id: 2, transfer_by: localStorage.getItem('login_id'), transfer_category: 1, transfer_to_user: null }],
      hdd2: [{ item_id: 0, transfer_to_system: 0, location_id: 2, transfer_by: localStorage.getItem('login_id'), transfer_category: 1, transfer_to_user: null }],
      smps: [{ item_id: 0, transfer_to_system: 0, location_id: 2, transfer_by: localStorage.getItem('login_id'), transfer_category: 1, transfer_to_user: null }],
      graphiccard: [{ item_id: 0, transfer_to_system: 0, location_id: 2, transfer_by: localStorage.getItem('login_id'), transfer_category: 1, transfer_to_user: null }],
    }
    ;

  transferStockDataarray: any[] = [];
  userorNot: any;
  private subscription: any;
  adminUrl = '';
  configureitemdetails: any;

  dataforsysteminfowhenscrapped = {
    item_code: '',
  };

  constructor(private sharedServices: SharedService, private router: Router, private adminService: AdminService, private cdr: ChangeDetectorRef, private spinner: NgxSpinnerService, private route: ActivatedRoute) {
    this.validationradiobtn();
    this.adminUrl = environment.ADMIN_URL;
    const today = moment();
    this.currentdate = today.local().format('YYYY-MM-DD');
    this.getDataFromparams();
  }


  ngOnInit(): void {
    this.getSystems();
  }

  async getDataFromparams() {
    try {
      this.spinner.show();

      const existingItem = this.adminService.getSelectedItemValue();
      console.log(existingItem, "existingItem");

      if (existingItem) {
        await this.previousDatafromsubjectBehaviour();
      }
      else {
        const params = await firstValueFrom(this.route.queryParams);

        if (params['systemId']) {
          const systemId = +params['systemId'];
          const results: any = await firstValueFrom(this.sharedServices.getSysteminformationList());

          const filteredData = results.filter((items: any) => {
            return items.sid == systemId;
          })

          // console.log(Databysid, "Databysid");
          const item = filteredData[0];
          if (item) {
            this.adminService.sendSelectedItem(item);
            await this.previousDatafromsubjectBehaviour();

            this.adminService.resetSelectedItem();
          }
        }

      }


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
    finally {
      this.spinner.hide();
    }
  }

  async previousDatafromsubjectBehaviour() {
    try {
      // subject behaviour
      const item = await firstValueFrom(this.adminService.selectedItem$);
      this.spinner.show();
      if (item) {
        //   / /g represent regex for space where g is the globla mean replace all instances of space to the non space.(mean remove all spaces.) 
        this.displayupdateButton = true;
        this.displayaddButton = false;
        this.makecpucoodereadonly = true;
        // console.log(item, "this.subscription");
        // const convertitem = ((item?.system_type).replace(/ /g, '')).toLowerCase();

        //select radio button
        this.systemradioBtn.get('systemType').patchValue(item?.system_type);
        this.systemtypeforupdatingdata = item?.system_type;

        if (item?.cpucode) {
          this.newsystemForm.get('cpucode').patchValue(item?.cpucode);
          this.newsystemForm.cpucode = item?.cpucode;
        }

        this.newsystemFormData = {
          cpucode: item?.cpucode,
          username: +item?.username,
          processor: item?.processor,
          processorcode: item?.processorcode,
          ram1: item?.ram1,
          ram1code: item?.ram1code,
          ram2: item?.ram2,
          ram2code: item?.ram2code,
          ram3: item?.ram3,
          ram3code: item?.ram3code,
          ram4: item?.ram4,
          ram4code: item?.ram4code,
          hdd1: item?.hdd1,
          hdd1code: item?.hdd1code,
          hdd2: item?.hdd2,
          hdd2code: item?.hdd2code,
          graphiccard: item?.graphiccard,
          graphiccardcode: item?.graphiccardcode,
          smps: item?.smps,
          smpscode: item?.smpscode,
          cabinet: item?.cabinet,
          cabinetcode: item?.cabinetcode,
          cmos: item?.cmos,
          cmoscode: item?.cmoscode,
          motherboard: item?.motherboard,
          motherboardcode: item?.motherboardcode,
          system_type: item?.system_type,
          description: item?.description,
          system_status: 1,
          created_by: localStorage.getItem('name')
        };


        const cpucode = this.newsystemFormData.cpucode;
          await this.getItemidwithitemcodeforotheritems(cpucode);
          //putting data in transfer_stock object
          this.transferStockDataobj.ram1[0].transfer_to_system = this.itemdataforotheritems[0]?.item_id;
          this.transferStockDataobj.ram2[0].transfer_to_system = this.itemdataforotheritems[0]?.item_id;
          this.transferStockDataobj.ram3[0].transfer_to_system = this.itemdataforotheritems[0]?.item_id;
          this.transferStockDataobj.ram4[0].transfer_to_system = this.itemdataforotheritems[0]?.item_id;
          this.transferStockDataobj.hdd1[0].transfer_to_system = this.itemdataforotheritems[0]?.item_id;
          this.transferStockDataobj.hdd2[0].transfer_to_system = this.itemdataforotheritems[0]?.item_id;
          this.transferStockDataobj.smps[0].transfer_to_system = this.itemdataforotheritems[0]?.item_id;
          this.transferStockDataobj.graphiccard[0].transfer_to_system = this.itemdataforotheritems[0]?.item_id;
        
 

        this.newsystemFormDataforupdate = {
          sid: + item?.sid,
          username: +item?.username,
          processor: item?.processor,
          ram1: item?.ram1,
          ram1code: item?.ram1code,
          ram2: item?.ram2,
          ram2code: item?.ram2code,
          ram3: item?.ram3,
          ram3code: item?.ram3code,
          ram4: item?.ram4,
          ram4code: item?.ram4code,
          hdd1: item?.hdd1,
          hdd1code: item?.hdd1code,
          hdd2: item?.hdd2,
          hdd2code: item?.hdd2code,
          graphiccard: item?.graphiccard,
          graphiccardcode: item?.graphiccardcode,
          smps: item?.smps,
          smpscode: item?.smpscode,
          cabinet: item?.cabinet,
          cmos: item?.cmos,
          motherboard: item?.motherboard,
          system_type: item?.system_type,
          description: item?.description,
          system_status: 1,
        }

        this.backupoldItemsfromsysteminfo = {
          sid: + item?.sid,
          username: item?.username,
          processor: item?.processor,
          ram1: item?.ram1,
          ram1code: item?.ram1code,
          ram2: item?.ram2,
          ram2code: item?.ram2code,
          ram3: item?.ram3,
          ram3code: item?.ram3code,
          ram4: item?.ram4,
          ram4code: item?.ram4code,
          hdd1: item?.hdd1,
          hdd1code: item?.hdd1code,
          hdd2: item?.hdd2,
          hdd2code: item?.hdd2code,
          graphiccard: item?.graphiccard,
          graphiccardcode: item?.graphiccardcode,
          smps: item?.smps,
          smpscode: item?.smpscode,
          cabinet: item?.cabinet,
          cmos: item?.cmos,
          motherboard: item?.motherboard,
          system_type: item?.system_type,
          description: item?.description,
        }
        // console.log(this.transferStockDataobj,"this.transferStockDataobj.")
        await this.spinner.hide();

      }


      // console.log(this.subscription, "subscription");
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


  newEditdata() {
    this.displayupdateButton = true;
    this.displayaddButton = false;
    this.makecpucoodereadonly = true;
  }

  ngAfterViewInit() {
    this.getdatafromsysteminformationlist();
    this.getAssigneddatafromtsandsysteminfo();
    // this.newsystemForm.controls['cpucode'].disable(true);
  }

  selectSystemType(event: any) {
    // Your function implementation for selecting system type
    // console.log(event.target.value, "selectSystemType");
    this.newsystemFormData.system_type = event.target?.value;
  }

  async getSystems() {
    try {
      const [systemdata, systeminforamtionList, userData, Ramdata, hdddata, Smpsdata, allgraphiccard]: any =
        await lastValueFrom(forkJoin([
          this.sharedServices.getSystemsDatafromitems().pipe(retry(3)),
          this.sharedServices.getSysteminformationList().pipe(retry(3)),
          this.sharedServices.getUsersdatabystatus().pipe(retry(3)),

          this.sharedServices.getRamDatafromitems().pipe(retry(3), catchError(() => of([]))),
          this.sharedServices.getHDDfromitems().pipe(retry(3), catchError(() => of([]))),
          this.sharedServices.getSMPSfromitems().pipe(retry(3), catchError(() => of([]))),
          this.sharedServices.getgraphiccarddatafromitems().pipe(retry(3), catchError(() => of([]))),
        ]));

      this.allsystemsfromsysteminfo = (systeminforamtionList || []).map((e: any) => e.cpucode);

      this.allsystems = (systemdata || []).filter((e: any) => !this.allsystemsfromsysteminfo.includes(e.item_code));

      this.allusersdata = userData || [];
      this.allRams = Ramdata || [];
      this.allHDD = hdddata || [];
      this.allsmps = Smpsdata || [];
      this.allgraphiccard = allgraphiccard || [];
    }
    catch (error: unknown) {
      if (error instanceof HttpErrorResponse && error.status === 403) {
        await Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Token expired.',
          footer: '<a href="../login">Please login again!</a>'
        });

        this.router.navigate(['../login']);

      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Internal server error. Please try again later!',
          footer: '<a href="../login">Login</a>'
        });

        location.reload();
      }
    }

  }


  assigntransferto(itemid: any) {
    // List of keys to iterate over
    const keys = Object.keys(this.transferStockDataobj);

    // Loop over each key and update the transfer_to property
    keys.forEach((key, index) => {
      this.transferStockDataobj[key][0].transfer_to_system = itemid;
    });
  }

  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.keyCode === 32) {
      event.preventDefault();
    }

  }


  async getdatafromsysteminformationlist() {
    try {

      const results = await firstValueFrom(this.sharedServices.getSysteminformationList());

      setTimeout(() => {
        this.allsysteminfodata = results;
        if (this.allsystems && this.allsysteminfodata) {
          this.allsystems.map((e: any) => {
            this.allsysteminfodata.map((f: any) => {
              //checking condition for color change...
              if (e?.item_code === f?.cpucode) {
                this.matchArray.push(f?.cpucode);
              }
            })
          })
        }
        else {
        }
      }, 1000);
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

  async addsysteminfo() {
    this.newsystemFormData.ram1 = this.newsystemFormDataforupdate.ram1 ? this.newsystemFormDataforupdate.ram1 : this.newsystemFormData.ram1;
    this.newsystemFormData.ram2 = this.newsystemFormDataforupdate.ram2 ? this.newsystemFormDataforupdate.ram2 : this.newsystemFormData.ram2;
    this.newsystemFormData.ram3 = this.newsystemFormDataforupdate.ram3 ? this.newsystemFormDataforupdate.ram3 : this.newsystemFormData.ram3;
    this.newsystemFormData.ram4 = this.newsystemFormDataforupdate.ram4 ? this.newsystemFormDataforupdate.ram4 : this.newsystemFormData.ram4;
    this.newsystemFormData.hdd1 = this.newsystemFormDataforupdate.hdd1 ? this.newsystemFormDataforupdate.hdd1 : this.newsystemFormData.hdd1;
    this.newsystemFormData.hdd2 = this.newsystemFormDataforupdate.hdd2 ? this.newsystemFormDataforupdate.hdd2 : this.newsystemFormData.hdd2;

    if (this.newsystemForm.invalid) {
      this.newsystemForm.controls['cpucode'].markAsTouched();
    }
    else {
      console.log(this.newsystemFormData, "this.newsystemFormData");

      try {
        await firstValueFrom(this.adminService.addSysteminfo(this.newsystemFormData));

        await Swal.fire({
          title: 'Success!',
          text: 'System Information added successfully!',
          icon: 'success',
        })

        if (this.newsystemFormData.system_type === "Assembled Computer" || this.newsystemFormData.system_type === "Old Assembled Computer" && this.transferStockDataobj) {
          //adding data in transferstock
          for (const key in this.transferStockDataobj) {
            // console.log(this.transferStockDataobj.hasOwnProperty(key), "this.transferStockDataobj.hasOwnProperty(key)");
            if (this.transferStockDataobj.hasOwnProperty(key)) {
              // console.log(key, "key for in this.transferStockDataobj");
              const currentObject = this.transferStockDataobj[key][0];
              // Check if item_id is not 0
              if (currentObject.item_id !== 0 && currentObject.transfer_to_system !== 0) {
                this.transferStockDataarray.push(currentObject);
              }
            }
          }

          if (this.transferStockDataarray) {
            this.transferStockformultipledata(this.transferStockDataarray);
          }
        }

        if (this.newsystemFormData.system_type === "Branded Computer") {
          await this.insertsysteminfointoitemstable();

        }

        this.newsystemForm.reset({
          username: 0,
        })

        this.newsystemFormData.cpucode = '';
        this.newsystemFormData.username = 0;
        this.newsystemFormDataforupdate.username = 0;
        this.newsystemFormData.processor = '';
        this.newsystemFormDataforupdate.processor = '';
        this.newsystemFormData.ram1 = '';
        this.newsystemFormData.ram1code = '';
        this.newsystemFormDataforupdate.ram1 = '';
        this.newsystemFormData.ram2code = '';
        this.newsystemFormData.ram2 = '';
        this.newsystemFormDataforupdate.ram2 = '';
        this.newsystemFormData.ram3 = '';
        this.newsystemFormData.ram3code = '';
        this.newsystemFormDataforupdate.ram3 = '';
        this.newsystemFormData.ram4 = '';
        this.newsystemFormData.ram4code = '';
        this.newsystemFormDataforupdate.ram4 = '';
        this.newsystemFormData.hdd1 = '';
        this.newsystemFormDataforupdate.hdd1 = '';
        this.newsystemFormData.hdd1code = '';
        this.newsystemFormDataforupdate.hdd1code = '';
        this.newsystemFormData.hdd2code = '';
        this.newsystemFormDataforupdate.hdd2code = '';
        this.newsystemFormData.hdd2 = '';
        this.newsystemFormDataforupdate.hdd2 = '';
        this.newsystemFormData.graphiccard = '';
        this.newsystemFormData.graphiccardcode = '';
        this.newsystemFormDataforupdate.graphiccard = '';
        this.newsystemFormData.smps = '';
        this.newsystemFormData.smpscode = '';
        this.newsystemFormDataforupdate.smps = '';
        this.newsystemFormDataforupdate.smpscode = '';
        this.newsystemFormData.cabinet = '';
        this.newsystemFormDataforupdate.cabinet = '';
        this.newsystemFormData.cmos = '';
        this.newsystemFormDataforupdate.cmos = '';
        this.newsystemFormData.motherboard = '';
        this.newsystemFormDataforupdate.motherboard = '';
        this.newsystemFormData.description = '';
        this.newsystemFormDataforupdate.description = '';
        this.ngOnInit();

      }  catch (error: unknown) {
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
  }



  async updateSystemInfo(autoSave: boolean = false) {

    if (this.newsystemForm.invalid) {
      this.newsystemForm.controls['cpucode'].markAsTouched();
    }
    else {

      this.newsystemFormDataforupdate.username = this.newsystemFormData.username;
      this.newsystemFormDataforupdate.processor = this.newsystemFormData.processor;
      this.newsystemFormDataforupdate.ram1 = this.newsystemFormDataforupdate.ram1 ? this.newsystemFormDataforupdate.ram1 : this.newsystemFormData.ram1;
      this.newsystemFormDataforupdate.ram1code = this.newsystemFormData.ram1code
      this.newsystemFormDataforupdate.ram2 = this.newsystemFormDataforupdate.ram2 ? this.newsystemFormDataforupdate.ram2 : this.newsystemFormData.ram2;
      this.newsystemFormDataforupdate.ram2code = this.newsystemFormData.ram2code
      this.newsystemFormDataforupdate.ram3 = this.newsystemFormDataforupdate.ram3 ? this.newsystemFormDataforupdate.ram3 : this.newsystemFormData.ram3;
      this.newsystemFormDataforupdate.ram4 = this.newsystemFormDataforupdate.ram4 ? this.newsystemFormDataforupdate.ram4 : this.newsystemFormData.ram4;
      this.newsystemFormDataforupdate.ram3code = this.newsystemFormDataforupdate.ram3code;
      this.newsystemFormDataforupdate.ram4code = this.newsystemFormDataforupdate.ram4code;

      this.newsystemFormDataforupdate.hdd1 = this.newsystemFormData.hdd1;
      this.newsystemFormDataforupdate.hdd1code = this.newsystemFormData.hdd1code;
      this.newsystemFormDataforupdate.hdd2 = this.newsystemFormData.hdd2;
      this.newsystemFormDataforupdate.hdd2code = this.newsystemFormData.hdd2code;
      this.newsystemFormDataforupdate.graphiccard = this.newsystemFormData.graphiccard;
      this.newsystemFormDataforupdate.graphiccardcode = this.newsystemFormData.graphiccardcode;
      this.newsystemFormDataforupdate.smps = this.newsystemFormData.smps;
      this.newsystemFormDataforupdate.smpscode = this.newsystemFormData.smpscode;
      this.newsystemFormDataforupdate.cabinet = this.newsystemFormData.cabinet;
      this.newsystemFormDataforupdate.cmos = this.newsystemFormData.cmos
      this.newsystemFormDataforupdate.motherboard = this.newsystemFormData.motherboard
      this.newsystemFormDataforupdate.system_type = this.newsystemFormData.system_type
      this.newsystemFormDataforupdate.description = this.newsystemFormData.description;

      try {
        console.log(this.newsystemFormDataforupdate, "this.newsystemFormDataforupdate")
       await firstValueFrom(this.adminService.updateSysteminfo(this.newsystemFormDataforupdate));

        await Swal.fire({
          title: 'Success!',
          text: 'System Information updated successfully!',
          icon: 'success',
        }).then(() => {

          if (this.newsystemFormData.system_type === "Assembled Computer" || this.newsystemFormData.system_type === "Old Assembled Computer" && this.transferStockDataobj) {
            //adding data in transferstock
            for (const key in this.transferStockDataobj) {

              console.log(this.transferStockDataobj.hasOwnProperty(key), "Assembled Computer");
              console.log(this.transferStockDataobj, "this.transferStockDataobj");

              if (this.transferStockDataobj.hasOwnProperty(key)) {
                const currentObject = this.transferStockDataobj[key][0];
                // Check if item_id is not 0
                if (currentObject.item_id !== 0 && currentObject.transfer_to_system !== 0) {
                  this.transferStockDataarray.push(currentObject);
                  console.log(this.transferStockDataobj, "this.transferStockDataobj2");

                }
              }
            }

            console.log(this.transferStockDataarray, "array of transferstock data");
            if (this.transferStockDataarray) {
              this.transferStockformultipledata(this.transferStockDataarray);
            }

          }

          else if (this.newsystemFormData.system_type === "Branded Computer" && this.transferStockDataobj) {
            //adding data in transferstock
            for (const key in this.transferStockDataobj) {

              console.log(this.transferStockDataobj.hasOwnProperty(key), "Branded Computer");

              if (this.transferStockDataobj.hasOwnProperty(key)) {
                const currentObject = this.transferStockDataobj[key][0];
                // Check if item_id is not 0
                if (currentObject.item_id !== 0 && currentObject.transfer_to_system !== 0) {
                  console.log(this.newsystemForm.cpucode, 'cpucode');

                  this.getItemidwithitemcode(this.newsystemForm.cpucode).then(() => {
                    console.log('Reached');
                    console.log(this.itemdatafromts, "brandedsystemthings")
                    currentObject.transfer_to_system = this.itemdatafromts[0].item_id;

                    console.log(currentObject, "currentObject");
                  })

                  console.log(this.itemdatafromts, "brandedsystemthings")

                  // currentObject.transfer_to = ; 
                  this.transferStockDataarray.push(currentObject);
                }
              }
            }

            setTimeout(() => {
              console.log(this.transferStockDataarray, "array of transferstock data");

              if (this.transferStockDataarray) {
                this.transferStockformultipledata(this.transferStockDataarray);
              }
            }, 500);

          }

          if (!autoSave) {
            this.newsystemFormData.username = 0;
            this.newsystemFormData.cpucode = '';
            this.newsystemFormData.ram1code = '';
            this.newsystemFormData.ram2code = '';
            this.newsystemFormData.ram3code = '';
            this.newsystemFormData.ram4code = '';
            this.newsystemFormData.smpscode = '';
            this.newsystemFormData.graphiccardcode = '';
            this.newsystemFormDataforupdate.username = 0
            this.newsystemForm.patchValue({
              cpucode: '',
              processor: '',
              ram1: '',
              ram2: '',
              ram3: '',
              ram4: '',
              hdd1: '',
              hdd2: '',
              graphiccard: '',
              smps: '',
              cabinet: '',
              cmos: '',
              motherboard: '',
              description: '',
            })
            this.ngOnInit();

            this.adminService.sendSelectedItem(null);


            this.router.navigateByUrl('user/system-information-list');
          }

        })
        console.log(this.newsystemFormDataforupdate, "this.newsystemFormDataforupdate");
      } catch (error: unknown) {
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
  }

  // async insertsysteminfointoitemstable() {
  //   //this data is for items table when new system assigned
  //   // if (!this.newsystemFormData) {
  //   //   console.log('No form data found');
  //   //   return;
  //   // }
  //   console.log(this.newsystemFormData, "this.newsystemFormData insertsysteminfointoitemstable");

  //   const pushData = async (category: string, formData: any) => {
  //     console.log(formData[category], "formData");

  //     if (this.newsystemFormData.system_type == 'Branded Computer') {

  //       const newItem = {
  //         purchase_id: `BRND-${formData[category]}`,
  //         item_code: formData[category],
  //         item_name: '',
  //         description: '',
  //         category_id: 0,
  //         location_id: 2,
  //         invoice_no: '',
  //         warrantyend_date: this.currentdate,
  //         item_status: '2',
  //         created_by: localStorage.getItem('login_id'),
  //         complain_id: null
  //       };

  //       // if (!formData[category]) return []; // skip if no data

  //       const itemCode = formData[category].toUpperCase();

  //       console.warn(itemCode, "Graphics Card")

  //       if (itemCode.includes('RAM')) {
  //         newItem.item_name = 'B-RAM';
  //         newItem.category_id = 1;
  //         newItem.description = 'BRANDED RAM'
  //       }
  //       else if (itemCode.includes('HDD')) {
  //         newItem.item_name = 'B-HDD';
  //         newItem.category_id = 1;
  //         newItem.description = 'BRANDED HDD'
  //       }
  //       else if (itemCode.includes('SMPS')) {
  //         newItem.item_name = 'B-SMPS';
  //         newItem.category_id = 1;
  //         newItem.description = 'BRANDED SMPS'
  //       }
  //       else if (itemCode.includes('GRAPHICCARD')) {
  //         newItem.item_name = 'B-Graphics Card';
  //         newItem.category_id = 1;
  //         newItem.description = 'BRANDED Graphics Card'
  //       }
  //       console.log(newItem, "this.newitem");
  //       this.itemsdataobj[category].push(newItem);
  //       console.log(this.itemsdataobj, "this.itemsdataobj");
  //       return this.itemsdataobj[category];

  //     };

  //     if (this.newsystemFormData) {

  //       const allcodes = ['ram1code', 'ram2code', 'ram3code', 'ram4code', 'hdd1code', 'hdd2code', 'smpscode', 'graphiccardcode'];

  //       try {
  //         const itemsDataArray = await Promise.all(allcodes.map((category) => pushData(category, this.newsystemFormData)));
  //         // const itemsDataArray = await Promise.all(itemsPromises);
  //         const itemsobjectarray = itemsDataArray.flat();
  //         console.log(itemsobjectarray, "itemsobjectarray");

  //         const result = await this.adminService.insertmultipleitemsinitemstable(itemsobjectarray).toPromise();
  //         console.log(result);

  //       }
  //       catch (error: unknown) {
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
  //       console.log('No form data found');
  //     }
  //   }

  // }

  async insertsysteminfointoitemstable() {
    if (!this.newsystemFormData) {
      console.log('No form data found');
      return;
    }

    console.log(this.newsystemFormData, "this.newsystemFormData insertsysteminfointoitemstable");

    const allcodes = ['ram1code', 'ram2code', 'ram3code', 'ram4code', 'hdd1code', 'hdd2code', 'smpscode', 'graphiccardcode'];

    const pushData = async (category: string, formData: any) => {
      const partCode = formData[category];
      const cpucode = formData.cpucode; // Example: CPU-APV001

      if (!partCode || !cpucode) {
        console.warn(`Missing code for ${category} or cpucode`);
        return [];
      }

      const partType = category.replace('code', ''); // e.g., ram1code → ram1
      const itemCode = `${partType}-${cpucode}`;
      const purchaseId = `BRND-${partType}-${cpucode}`;

      const newItem = {
        purchase_id: purchaseId,
        item_code: itemCode,
        item_name: '',
        description: '',
        category_id: 0,
        location_id: 2,
        invoice_no: '',
        warrantyend_date: this.currentdate,
        item_status: '2',
        created_by: localStorage.getItem('login_id'),
        complain_id: 1
      };

      // Set name/description/category based on partType
      if (partType.includes('ram')) {
        newItem.item_name = 'B-RAM';
        newItem.category_id = 1;
        newItem.description = 'BRANDED RAM';
      } else if (partType.includes('hdd')) {
        newItem.item_name = 'B-HDD';
        newItem.category_id = 1;
        newItem.description = 'BRANDED HDD';
      } else if (partType.includes('smps')) {
        newItem.item_name = 'B-SMPS';
        newItem.category_id = 1;
        newItem.description = 'BRANDED SMPS';
      } else if (partType.toLowerCase().includes('graphiccard')) {
        newItem.item_name = 'B-Graphics Card';
        newItem.category_id = 1;
        newItem.description = 'BRANDED Graphics Card';
      }

      console.log(newItem, `Prepared item for ${category}`);
      return [newItem];
    };

    try {
      const itemsDataArray = await Promise.all(
        allcodes.map(category => pushData(category, this.newsystemFormData))
      );
      const itemsobjectarray = itemsDataArray.flat();

      console.log(itemsobjectarray, "Final items to insert");

      if (itemsobjectarray.length > 0) {
        const result = await firstValueFrom(this.adminService.insertmultipleitemsinitemstable(itemsobjectarray));
        console.log("Insert result:", result);
      } else {
        console.warn("No items to insert.");
      }
    } catch (error: unknown) {
      if (error instanceof HttpErrorResponse && error.status === 403) {
        await Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Token expired.',
          footer: '<a href="../login">Please login again!</a>'
        });
        this.router.navigate(['../login']);
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Internal server error. Please try after some time!',
          footer: '<a href="../login">Login</a>'
        });
        location.reload();
      }
    }
  }


  async transferStockformultipledata(arrayofdata: any) {
    console.log(arrayofdata, "arrayofdata");
    try{
    await firstValueFrom(this.adminService.transferStockformultipledata(arrayofdata));
    }
     catch (error: unknown) {
      if (error instanceof HttpErrorResponse && error.status === 403) {
        console.log(error, "err at getTransferData");
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


  async selectCPU(event: any) {
    this.transferStockDataobj.ram1[0].transfer_to_system = event?.item_id;
    this.transferStockDataobj.ram2[0].transfer_to_system = event?.item_id;
    this.transferStockDataobj.ram3[0].transfer_to_system = event?.item_id;
    this.transferStockDataobj.ram4[0].transfer_to_system = event?.item_id;
    this.transferStockDataobj.smps[0].transfer_to_system = event?.item_id;
    this.transferStockDataobj.graphiccard[0].transfer_to_system = event?.item_id;

    await this.getsystemUserid(event?.item_id);

      if (this.systemradioBtn.get('systemType').value === 'Branded Computer') {
        this.newsystemFormData.cpucode = event?.item_code;
        this.newsystemFormData.processorcode = `processor-${event?.item_code}`;
        this.newsystemFormData.ram1code = `ram1-${event?.item_code}`;
        this.newsystemFormData.ram2code = `ram2-${event?.item_code}`;
        this.newsystemFormData.ram3code = `ram3-${event?.item_code}`;
        this.newsystemFormData.ram4code = `ram4-${event?.item_code}`;
        this.newsystemFormData.hdd1code = `hdd1-${event?.item_code}`;
        this.newsystemFormData.hdd2code = `hdd2-${event?.item_code}`;
        //change graphic code according to the requirement from graphiccard --> GraphicCard
        this.newsystemFormData.graphiccardcode = `graphiccard-${event?.item_code}`;
        this.newsystemFormData.smpscode = `smps-${event?.item_code}`;
        this.newsystemFormData.cabinetcode = `cabinet-${event?.item_code}`;
        this.newsystemFormData.cmoscode = `cmos-${event?.item_code}`;
        this.newsystemFormData.motherboardcode = `motherboard-${event?.item_code}`;
      } else {
        this.newsystemFormData.cpucode = event?.item_code;
        this.newsystemFormData.processorcode = `processor-${event?.item_code}`;
        this.newsystemFormData.cabinetcode = `cabinet-${event?.item_code}`;
        this.newsystemFormData.cmoscode = `cmos-${event?.item_code}`;
        this.newsystemFormData.motherboardcode = `motherboard-${event?.item_code}`;
      }


  }


  // async getsystemUserid(item_id: any){
  //   const itemId = {
  //     item_id: item_id
  //   };

  //   this.userorNot = null;

  //   this.sharedServices.getsystemDatabyitemId(itemId).subscribe({
  //     next: async (results: any) => {
  //       // const lengthofresults =+ results.length-1 ;
  //       console.log(results, "this.systemTransferData");
  //       this.systemTransferData = results[0]?.transfer_to_user;

  //       if (results[0]) {
  //         // this.newsystemFormData.username = + results[0]?.transfer_to;
  //         this.isuserornot(+results[0]?.transfer_to_user).then(() => {

  //           if (this.userorNot) {
  //             // console.log('user allowed')
  //             this.newsystemFormData.username = + results[0]?.transfer_to_user;
  //           }

  //           else {
  //             // console.log(' not a user')
  //             Swal.fire({
  //               icon: 'question',
  //               html: 'This system is not assigned to any user!<br>Please assigned first and then add to the system information.',
  //             }).then(() => {
  //               location.reload();
  //             })
  //           }
  //         });
  //       }
  //       else {
  //         this.newsystemFormDataforupdate.username = 0;
  //         this.newsystemFormData.username = 0;

  //         await Swal.fire({
  //           icon: 'question',
  //           html: 'This system is not assigned to any user!<br>Please assigned first and then add to the system information.',
  //         }).then(() => {
  //           location.reload();

  //         })
  //       }

  //     },
  //     error: (error) => {
  //       if (error.status == 403) {
  //         Swal.fire({
  //           icon: 'error',
  //           title: 'Oops!',
  //           text: 'Token expired.',
  //           footer: '<a href="../login">Please login again!</a>'
  //         }).then(() => {
  //           this.router.navigate(['../login']);
  //         })
  //       }
  //       else {
  //         Swal.fire({
  //           icon: 'error',
  //           title: 'Oops!',
  //           text: 'Internal server error.Please try after some time!',
  //           footer: '<a href="../login">Login</a>'
  //         }).then(() => {
  //           location.reload();
  //         })
  //       }
  //     }
  //   })

  // }

  async getsystemUserid(item_id: any): Promise<void> {
    const itemId = { item_id };
    this.userorNot = null;
    try {
      const results: any = await firstValueFrom(this.sharedServices.getsystemDatabyitemId(itemId));
      // const lengthofresults =+ results.length-1 ;
      console.log(results, "this.systemTransferData");
      this.systemTransferData = results[0]?.transfer_to_user;

      if (results[0]) {
        // this.newsystemFormData.username = + results[0]?.transfer_to;
        await this.isuserornot(+results[0]?.transfer_to_user);

        if (this.userorNot) {
          // console.log('user allowed')
          this.newsystemFormData.username = + results[0]?.transfer_to_user;
        }

        else {
          // console.log(' not a user')
          await Swal.fire({
            icon: 'question',
            html: 'This system is not assigned to any user!<br>Please assigned first and then add to the system information.',
          });

          location.reload();
        }

      }
      else {
        this.newsystemFormDataforupdate.username = 0;
        this.newsystemFormData.username = 0;

        await Swal.fire({
          icon: 'question',
          html: 'This system is not assigned to any user!<br>Please assigned first and then add to the system information.',
        }).then(() => {
          location.reload();
        })
      }
    } 
    catch (error: unknown) {
      if (error instanceof HttpErrorResponse && error.status === 403) {
        console.log(error, "err at getTransferData");
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

  // isuserornot(userid: any): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     // console.log(userid, "userid");
  //     const userId = {
  //       user_id: userid
  //     }
  //     this.sharedServices.getUsersdatabyid(userId).subscribe({
  //       next: (results: any) => {
  //         if (results.length) {
  //           this.userorNot = results;
  //         }
  //         else {
  //           console.warn('User not  found');
  //         }
  //         resolve();
  //       },
  //       error: (error) => {
  //         console.error(error);
  //         reject();
  //       }
  //     })
  //   })
  // }

  async isuserornot(user_id: number) {
    const userId = { user_id };
    const results: any = await firstValueFrom(this.sharedServices.getUsersdatabyid(userId));
    this.userorNot = results?.length ? results : null;
  }


  async getTransferData(data: any): Promise<any> {
    try {
      // get_sytemdata_byitemidotherthancpu (only system data)
      const itemId = {
        item_id: +data
      }
      const results: any = await firstValueFrom(this.sharedServices.getsystemDataotherThanCPU(itemId));
      console.log(results, "configureitemdetails");

      // const configureitemdetails = results;
      if (results && results.length > 0) {
        this.configureitemdetails = results;
        this.getTransferDataDetailotherthanCPU = `${results[results.length - 1].item_code} is presently assigned to ${results[results.length - 1].system_name} system`;
      }

      // return results;
    }
    catch (error: unknown) {
      if (error instanceof HttpErrorResponse && error.status === 403) {
        console.log(error, "err at getTransferData");
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

  selectUsersname(id: any) {
    console.log(id);
  }

  async selectram1forassembled(ram1code: any) {
    console.log(ram1code, "selectram1forassembled");
    await this.getItemidwithitemcode(ram1code).then(async () => {
      const item_id = this.itemdatafromts[0]?.item_id;
      this.transferStockDataobj.ram1[0].item_id = item_id;

      // await this.getTransferData(item_id);

      // if(this.configureitemdetails && this.configureitemdetails.length>0 && this.configureitemdetails[0].transfer_to_system){
      //   await Swal.fire({
      //     text: `${this.configureitemdetails[0].item_code} already installed in ${this.configureitemdetails[0].system_name}.`,
      //     icon: "info",
      //     // showCancelButton: true,
      //     confirmButtonColor: "#3085d6",
      //     cancelButtonColor: "#d33",
      //     confirmButtonText: "Yes"
      //   })
      // }

      await this.checkalreadyAssignorNot(item_id);


      // Check if the item already exists in the array
      const existingIndex = this.transferStockDataobj.ram1.findIndex(item => item?.item_id === item_id);
      // already exists
      if (existingIndex !== -1) {
        // If the item already exists, replace it in the ram1 array
        this.transferStockDataobj.ram1[existingIndex].item_id = item_id;
      } else {
        // If the item doesn't exist, push a new object to the ram1 array
        this.transferStockDataobj.ram1.push({
          item_id: item_id,
          transfer_to_system: 0,
          location_id: 2,
          transfer_by: localStorage.getItem('login_id'),
          transfer_category: 1,
          transfer_to_user: null
        });
      }
      console.log(this.transferStockDataobj);
    });

    console.log(this.backupoldItemsfromsysteminfo.ram1code, "this.backupoldItemsfromsysteminfo.ram1code");
    if ((this.newsystemFormData.ram2code !== '' && this.newsystemFormData.ram2code === ram1code) || (this.newsystemFormData.ram3code !== '' && this.newsystemFormData.ram3code === ram1code) || (this.newsystemFormData.ram4code !== '' && this.newsystemFormData.ram4code === ram1code)) {

      Swal.fire({
        title: "warning",
        text: "Sorry same RAMs are not assgined to any system!",
        icon: "warning"
      }).then(() => {
        this.newsystemFormData.ram1code = '';
        this.newsystemFormDataforupdate.ram1code = '';
      })
    }
    else if (this.backupoldItemsfromsysteminfo.ram1code) {
      console.log('this.backupoldItemsfromsysteminfo.ram1code', this.backupoldItemsfromsysteminfo.ram1code)

      if (this.backupoldItemsfromsysteminfo.ram1code !== ram1code) {

        this.replacementLogic(ram1code, this.backupoldItemsfromsysteminfo.ram1code, this.selectram1forassembled);
        // console.log('We have to update this ram1',this.backupoldItemsfromsysteminfo.ram1code)
      }
    }
    else {
      this.newsystemFormData.ram1code = ram1code;
      this.newsystemFormDataforupdate.ram1code = ram1code;

    }
  }

  // new handler to handle all functions in one

//   async handlePartSelection(config: {
//   code: any;
//   partKey: TransferStockKey;
//   codeField: keyof SystemFormData;
//   otherCodeField?: (keyof SystemFormData)[];
//   backupCode: any;
//   calledFn: Function;
// }) {
//   const { code, partKey, codeField, otherCodeField, backupCode, calledFn } = config;

//   if (!code) {
//     console.log('No data found');
//     return;
//   }

//   // 1️⃣ Fetch item
//   await this.getItemidwithitemcode(code);
//   const item_id = this.itemdatafromts?.[0]?.item_id;

//   if (!item_id) {
//     console.warn('Invalid item selected');
//     return;
//   }

//   // 2️⃣ Prevent duplicate part usage (HDD1 vs HDD2)
//  if (otherCodeField?.some(field => this.newsystemFormData[field] === code)) { 
  
//     await Swal.fire({
//       title: 'Warning',
//       text: 'Sorry, same items cannot be assigned to the same system!',
//       icon: 'warning'
//     });

//     this.newsystemFormData[codeField] = '';
//     return;
//   }

//   // 3️⃣ Check already assigned
//   await this.checkalreadyAssignorNot(item_id);

//   // 4️⃣ Update transferStockDataobj safely
//   const partArray = this.transferStockDataobj[partKey];
//   const existingIndex = partArray.findIndex(x => x?.item_id === item_id);

//   if (existingIndex !== -1) {
//     partArray[existingIndex].item_id = item_id;
//   } else {
//     partArray.push({
//       item_id,
//       transfer_to_system: this.itemdataforotheritems?.[0]?.item_id,
//       location_id: 2,
//       transfer_by: localStorage.getItem('login_id'),
//       transfer_category: 1,
//       transfer_to_user: null
//     });
//   }

//   console.log(partArray, "Updated partArray");

//   // 5️⃣ Set selected value
//   this.newsystemFormData[codeField] = code;
//   this.newsystemFormDataforupdate[codeField] = code;

//   // 6️⃣ Replacement logic
//   if (backupCode && backupCode !== code) {
//     await this.replacementLogic(code, backupCode, calledFn);
//   }
// }


  async selectram1forbrandedsystem(ram1code: any) {
    console.log(ram1code, "ram1code");
    if (ram1code) {
      await this.getItemidwithitemcode(ram1code).then(async () => {

        const item_id = this.itemdatafromts[0]?.item_id;
        this.transferStockDataobj.ram1[0].item_id = item_id;


        await this.checkalreadyAssignorNot(item_id);

        // for items table
        // Check if the item already exists in the array
        const existingIndex = this.transferStockDataobj.ram1.findIndex(item => item?.item_id === item_id);
        // already exists
        if (existingIndex !== -1) {
          // If the item already exists, replace it in the ram1 array
          this.transferStockDataobj.ram1[existingIndex].item_id = item_id;
        } else {
          // If the item doesn't exist, push a new object to the ram1 array
          this.transferStockDataobj.ram1.push({
            item_id: item_id,
            transfer_to_system: 0,
            location_id: 2,
            transfer_by: localStorage.getItem('login_id'),
            transfer_category: 1,
            transfer_to_user: null
          });
        }
      });


      //branded object
      // console.log(ram1code);
      // this.newsystemFormData.ram1code = ram1code;
      // this.newsystemFormDataforupdate.ram1code = ram1code;
      console.log(this.backupoldItemsfromsysteminfo.ram1code, "this.backupoldItemsfromsysteminfo.ram1code");
      if ((this.newsystemFormData.ram2code !== '' && this.newsystemFormData.ram2code === ram1code) || (this.newsystemFormData.ram3code !== '' && this.newsystemFormData.ram3code === ram1code) || (this.newsystemFormData.ram4code !== '' && this.newsystemFormData.ram4code === ram1code)) {

        Swal.fire({
          title: "warning",
          text: "Sorry same RAMs are not assgined to any system!",
          icon: "warning"
        }).then(() => {
          this.newsystemFormData.ram1code = '';
          this.newsystemFormDataforupdate.ram1code = '';
        })
      }
      else if (this.backupoldItemsfromsysteminfo.ram1code) {

        if (this.backupoldItemsfromsysteminfo.ram1code !== ram1code) {

          this.replacementLogic(ram1code, this.backupoldItemsfromsysteminfo.ram1code, this.selectram1forbrandedsystem);
          // console.log('We have to update this ram1',this.backupoldItemsfromsysteminfo.ram1code)
        }
      }
      else {
        this.newsystemFormData.ram1code = ram1code;
        this.newsystemFormDataforupdate.ram1code = ram1code;
      }
    }
    else {
      console.log('No data found');
    }

  //   await this.handlePartSelection({
  //   code: ram1code,
  //   partKey: 'ram1',
  //   codeField: 'ram1code',
  //   otherCodeField: 'ram2code', // prevents same RAM in slot 2
  //   backupCode: this.backupoldItemsfromsysteminfo.ram1code,
  //   calledFn: this.selectram1forbrandedsystem
  // });
  }

  async selectram2forassembled(ram2code: any) {
    if (ram2code) {
      await this.getItemidwithitemcode(ram2code).then(async () => {
        const item_id = this.itemdatafromts[0]?.item_id;

        this.transferStockDataobj.ram2[0].item_id = item_id;

        await this.checkalreadyAssignorNot(item_id);
        // Check if the item already exists in the array
        const existingIndex = this.transferStockDataobj.ram2.findIndex(item => item?.item_id === item_id);
        // already exists
        if (existingIndex !== -1) {
          // If the item already exists, replace it in the ram1 array
          this.transferStockDataobj.ram2[existingIndex].item_id = item_id;
        } else {
          // If the item doesn't exist, push a new object to the ram1 array
          this.transferStockDataobj.ram2.push({
            item_id: item_id,
            transfer_to_system: this.itemdataforotheritems[0].item_id,
            location_id: 2,
            transfer_by: localStorage.getItem('login_id'),
            transfer_category: 1,
            transfer_to_user: null
          });

        }
        console.log(this.transferStockDataobj);
      });

      if ((this.newsystemFormData.ram1code !== '' && this.newsystemFormData.ram1code === ram2code) || (this.newsystemFormData.ram3code !== '' && this.newsystemFormData.ram3code === ram2code) || (this.newsystemFormData.ram4code !== '' && this.newsystemFormData.ram4code === ram2code)) {

        Swal.fire({
          title: "warning",
          text: "Sorry same RAMs are not assgined to any system!",
          icon: "warning"
        }).then(() => {
          this.newsystemFormData.ram2code = '';
        })
      }

      else if (this.backupoldItemsfromsysteminfo.ram2code) {

        if (this.backupoldItemsfromsysteminfo.ram2code !== ram2code) {

          this.replacementLogic(ram2code, this.backupoldItemsfromsysteminfo.ram2code, this.selectram2forassembled);
          // console.log('We have to update this ram1',this.backupoldItemsfromsysteminfo.ram1code)
        }
      }

      else {
        this.newsystemFormData.ram2code = ram2code;
        this.newsystemFormDataforupdate.ram2code = ram2code;

      }
    }
    else {
      console.log('No data found');
    }
  }

  async selectram2forbrandedsystem(ram2code: any) {
    // this.newsystemFormData.ram2code = ram1code;
    // this.newsystemFormDataforupdate.ram2code = ram1code;
    if (ram2code) {
      await this.getItemidwithitemcode(ram2code).then(async () => {
        const item_id = this.itemdatafromts[0]?.item_id;
        this.transferStockDataobj.ram2[0].item_id = item_id;

        await this.checkalreadyAssignorNot(item_id);
        // Check if the item already exists in the array
        const existingIndex = this.transferStockDataobj.ram2.findIndex(item => item?.item_id === item_id);
        // already exists
        if (existingIndex !== -1) {
          // If the item already exists, replace it in the ram1 array
          this.transferStockDataobj.ram2[existingIndex].item_id = item_id;
        } else {
          // If the item doesn't exist, push a new object to the ram1 array
          this.transferStockDataobj.ram2.push({
            item_id: item_id,
            transfer_to_system: this.itemdataforotheritems[0].item_id,
            location_id: 2,
            transfer_by: localStorage.getItem('login_id'),
            transfer_category: 1,
            transfer_to_user: null
          });
        }
        console.log(this.transferStockDataobj);
      });

      if ((this.newsystemFormData.ram1code !== '' && this.newsystemFormData.ram1code === ram2code) || (this.newsystemFormData.ram3code !== '' && this.newsystemFormData.ram3code === ram2code) || (this.newsystemFormData.ram4code !== '' && this.newsystemFormData.ram4code === ram2code)) {

        Swal.fire({
          title: "warning",
          text: "Sorry same RAMs are not assgined to any system!",
          icon: "warning"
        }).then(() => {
          this.newsystemFormData.ram2code = '';
        })
      }

      else if (this.backupoldItemsfromsysteminfo.ram2code) {
        if (this.backupoldItemsfromsysteminfo.ram2code !== ram2code) {
          this.replacementLogic(ram2code, this.backupoldItemsfromsysteminfo.ram2code, this.selectram2forbrandedsystem);
        }
      }

      else {
        this.newsystemFormData.ram2code = ram2code;
        this.newsystemFormDataforupdate.ram2code = ram2code;

      }
    }
    else {
      console.log('No data found');
    }
  }

  async selectram3forassembled(ram3code: any) {
    if (ram3code) {
      await this.getItemidwithitemcode(ram3code).then(async () => {
        const item_id = this.itemdatafromts[0]?.item_id;
        this.transferStockDataobj.ram3[0].item_id = item_id;
        await this.checkalreadyAssignorNot(item_id);
        // Check if the item already exists in the array
        const existingIndex = this.transferStockDataobj.ram3.findIndex(item => item?.item_id === item_id);
        // already exists
        if (existingIndex !== -1) {
          // If the item already exists, replace it in the ram1 array
          this.transferStockDataobj.ram3[existingIndex].item_id = item_id;
        } else {

          // If the item doesn't exist, push a new object to the ram1 array
          this.transferStockDataobj.ram3.push({
            item_id: item_id,
            transfer_to_system: 0,
            location_id: 2,
            transfer_by: localStorage.getItem('login_id'),
            transfer_category: 1,
            transfer_to_user: null
          });


        }
        console.log(this.transferStockDataobj);
      })


      if ((this.newsystemFormData.ram1code !== '' && this.newsystemFormData.ram1code === ram3code) || (this.newsystemFormData.ram2code !== '' && this.newsystemFormData.ram2code === ram3code) || (this.newsystemFormData.ram4code !== '' && this.newsystemFormData.ram4code === ram3code)) {
        Swal.fire({
          title: "warning",
          text: "Sorry same RAMs are not assgined to any system!",
          icon: "warning"
        }).then(() => {
          this.newsystemFormData.ram3code = '';
        })
      }
      else if (this.backupoldItemsfromsysteminfo.ram3code) {

        if (this.backupoldItemsfromsysteminfo.ram3code !== ram3code) {

          this.replacementLogic(ram3code, this.backupoldItemsfromsysteminfo.ram3code, this.selectram3forassembled);
          // console.log('We have to update this ram1',this.backupoldItemsfromsysteminfo.ram1code)
        }
      }
      else {
        this.newsystemFormData.ram3code = ram3code;
        this.newsystemFormDataforupdate.ram3code = ram3code;
      }
    }
    else {
      console.log('No data found');
    }
  }

  async selectram3forbrandedsystem(ram3code: any) {
    if (ram3code) {
      await this.getItemidwithitemcode(ram3code).then(async () => {
        const item_id = this.itemdatafromts[0]?.item_id;
        this.transferStockDataobj.ram3[0].item_id = item_id;
        await this.checkalreadyAssignorNot(item_id);
        // Check if the item already exists in the array
        const existingIndex = this.transferStockDataobj.ram3.findIndex(item => item?.item_id === item_id);
        // already exists
        if (existingIndex !== -1) {
          // If the item already exists, replace it in the ram1 array
          this.transferStockDataobj.ram3[existingIndex].item_id = item_id;
        } else {
          // If the item doesn't exist, push a new object to the ram1 array
          this.transferStockDataobj.ram3.push({
            item_id: item_id,
            transfer_to_system: this.itemdataforotheritems[0]?.item_id,
            location_id: 2,
            transfer_by: localStorage.getItem('login_id'),
            transfer_category: 1,
            transfer_to_user: null
          });

        }
      })
      if ((this.newsystemFormData.ram1code !== '' && this.newsystemFormData.ram1code === ram3code) || (this.newsystemFormData.ram2code !== '' && this.newsystemFormData.ram2code === ram3code) || (this.newsystemFormData.ram4code !== '' && this.newsystemFormData.ram4code === ram3code)) {
        Swal.fire({
          title: "warning",
          text: "Sorry same RAMs are not assgined to any system!",
          icon: "warning"
        }).then(() => {
          this.newsystemFormData.ram3code = '';
        })
      }
      else if (this.backupoldItemsfromsysteminfo.ram3code) {
        if (this.backupoldItemsfromsysteminfo.ram3code !== ram3code) {
          this.replacementLogic(ram3code, this.backupoldItemsfromsysteminfo.ram3code, this.selectram3forbrandedsystem);
        }
      }
      else {
        this.newsystemFormData.ram3code = ram3code;
        this.newsystemFormDataforupdate.ram3code = ram3code;
      }
    }
    else {
      console.log('No data found');
    }
  }

  async selectram4forassembled(ram4code: any) {
    if (ram4code) {
      await this.getItemidwithitemcode(ram4code).then(async () => {
        const item_id = this.itemdatafromts[0]?.item_id;
        this.transferStockDataobj.ram4[0].item_id = item_id;
        await this.checkalreadyAssignorNot(item_id);
        // Check if the item already exists in the array
        const existingIndex = this.transferStockDataobj.ram4.findIndex(item => item?.item_id === item_id);
        // already exists
        if (existingIndex !== -1) {
          // If the item already exists, replace it in the ram4 array
          this.transferStockDataobj.ram4[existingIndex].item_id = item_id;
        } else {
          const cpucode = this.newsystemFormDataforupdate.cpucode ? this.newsystemFormDataforupdate.cpucode : this.newsystemFormData.cpucode;

          // If the item doesn't exist, push a new object to the ram1 array
          this.transferStockDataobj.ram4.push({
            item_id: item_id,
            transfer_to_system: this.itemdataforotheritems[0].item_id,
            location_id: 2,
            transfer_by: localStorage.getItem('login_id'),
            transfer_category: 1,
            transfer_to_user: null
          });
        }
        console.log(this.transferStockDataobj);
      })

      if ((this.newsystemFormData.ram1code !== '' && this.newsystemFormData.ram1code === ram4code) || (this.newsystemFormData.ram2code !== '' && this.newsystemFormData.ram2code === ram4code) || (this.newsystemFormData.ram3code !== '' && this.newsystemFormData.ram3code === ram4code)) {
        Swal.fire({
          title: "warning",
          text: "Sorry same RAMs are not assgined to any system!",
          icon: "warning"
        }).then(() => {
          this.newsystemFormData.ram4code = '';
        })
      }
      else if (this.backupoldItemsfromsysteminfo.ram4code) {

        if (this.backupoldItemsfromsysteminfo.ram4code !== ram4code) {

          this.replacementLogic(ram4code, this.backupoldItemsfromsysteminfo.ram4code, this.selectram4forassembled);
          // console.log('We have to update this ram1',this.backupoldItemsfromsysteminfo.ram1code)
        }
      }
      else {
        this.newsystemFormData.ram4code = ram4code;
        this.newsystemFormDataforupdate.ram4code = ram4code;

      }
    }
    else {
      console.log('No data found');
    }
  }

  async selectram4forbrandedsystem(ram4code: any) {
    if (ram4code) {
      await this.getItemidwithitemcode(ram4code).then(async () => {
        const item_id = this.itemdatafromts[0]?.item_id;
        this.transferStockDataobj.ram4[0].item_id = item_id;
        await this.checkalreadyAssignorNot(item_id);
        // Check if the item already exists in the array
        const existingIndex = this.transferStockDataobj.ram4.findIndex(item => item?.item_id === item_id);
        // already exists
        if (existingIndex !== -1) {
          // If the item already exists, replace it in the ram4 array
          this.transferStockDataobj.ram4[existingIndex].item_id = item_id;
        } else {
          this.transferStockDataobj.ram4.push({
            item_id: item_id,
            transfer_to_system: this.itemdataforotheritems[0].item_id,
            location_id: 2,
            transfer_by: localStorage.getItem('login_id'),
            transfer_category: 1,
            transfer_to_user: null
          });

        }
        console.log(this.transferStockDataobj);
      })

      if ((this.newsystemFormData.ram1code !== '' && this.newsystemFormData.ram1code === ram4code) || (this.newsystemFormData.ram2code !== '' && this.newsystemFormData.ram2code === ram4code) || (this.newsystemFormData.ram3code !== '' && this.newsystemFormData.ram3code === ram4code)) {
        Swal.fire({
          title: "warning",
          text: "Sorry same RAMs are not assgined to any system!",
          icon: "warning"
        }).then(() => {
          this.newsystemFormData.ram4code = '';
        })
      }
      else if (this.backupoldItemsfromsysteminfo.ram4code) {

        if (this.backupoldItemsfromsysteminfo.ram4code !== ram4code) {

          this.replacementLogic(ram4code, this.backupoldItemsfromsysteminfo.ram4code, this.selectram4forbrandedsystem);
          // console.log('We have to update this ram1',this.backupoldItemsfromsysteminfo.ram1code)
        }
      }
      else {
        this.newsystemFormData.ram4code = ram4code;
        this.newsystemFormDataforupdate.ram4code = ram4code;

      }
    }
    else {
      console.log('No data found');
    }
  }


  async selecthdd1forassembled(hdd1code: any) {
    if (hdd1code) {
      await this.getItemidwithitemcode(hdd1code).then(async () => {
        const item_id = this.itemdatafromts[0]?.item_id;
        this.transferStockDataobj.hdd1[0].item_id = item_id;

        await this.checkalreadyAssignorNot(item_id);
        // Check if the item already exists in the array
        const existingIndex = this.transferStockDataobj.hdd1.findIndex(item => item?.item_id === item_id);
        // already exists
        if (existingIndex !== -1) {
          // If the item already exists, replace it in the ram4 array
          this.transferStockDataobj.hdd1[existingIndex].item_id = item_id;
        } else {
          const cpucode = this.newsystemFormDataforupdate.cpucode ? this.newsystemFormDataforupdate.cpucode : this.newsystemFormData.cpucode;
          // If the item doesn't exist, push a new object to the ram1 array
          this.transferStockDataobj.hdd1.push({
            item_id: item_id,
            transfer_to_system: this.itemdataforotheritems[0].item_id,
            location_id: 2,
            transfer_by: localStorage.getItem('login_id'),
            transfer_category: 1,
            transfer_to_user: null
          });

        }

        console.log(this.transferStockDataobj);
      })

      if (this.backupoldItemsfromsysteminfo.hdd1) {

        if (this.backupoldItemsfromsysteminfo.hdd1code !== hdd1code) {

          this.replacementLogic(hdd1code, this.backupoldItemsfromsysteminfo.hdd1code, this.selecthdd1forassembled);
          // console.log('We have to update this ram1',this.backupoldItemsfromsysteminfo.ram1code)
        }
        else {

          this.newsystemFormData.hdd1code = hdd1code;
          this.newsystemFormDataforupdate.hdd1code = hdd1code;
        }
      }
    }
    else {
      console.log('No data found');
    }
  }



  async selecthdd1forbrandedsystem(hdd1code: any) {
    if (hdd1code) {
      console.log(hdd1code, "hdd1code")
      await this.getItemidwithitemcode(hdd1code).then(async () => {
        const item_id = this.itemdatafromts[0]?.item_id;
        this.transferStockDataobj.hdd1[0].item_id = item_id;

        await this.checkalreadyAssignorNot(item_id);
        // Check if the item already exists in the array
        const existingIndex = this.transferStockDataobj.hdd1.findIndex(item => item?.item_id === item_id);
        // already exists
        if (existingIndex !== -1) {
          // If the item already exists, replace it in the ram4 array
          this.transferStockDataobj.hdd1[existingIndex].item_id = item_id;
        } else {
          // If the item doesn't exist, push a new object to the ram1 array
          this.transferStockDataobj.hdd1.push({
            item_id: item_id,
            transfer_to_system: this.itemdataforotheritems[0].item_id,
            location_id: 2,
            transfer_by: localStorage.getItem('login_id'),
            transfer_category: 1,
            transfer_to_user: null
          });
        }
        console.log(this.transferStockDataobj);
      });

      this.newsystemFormData.hdd1code = hdd1code;
      this.newsystemFormDataforupdate.hdd1code = hdd1code;

      if ((this.newsystemFormData.hdd2code !== '' && this.newsystemFormData.hdd2code === hdd1code)) {
        Swal.fire({
          title: "warning",
          text: "Sorry same HDDs are not assgined to any system!",
          icon: "warning"
        }).then(() => {
          this.newsystemFormData.hdd1code = '';
        })
      }
      else if (this.backupoldItemsfromsysteminfo.hdd1code) {
        if (this.backupoldItemsfromsysteminfo.hdd1code !== hdd1code) {
          this.replacementLogic(hdd1code, this.backupoldItemsfromsysteminfo.hdd1code, this.selecthdd1forbrandedsystem);
          // console.log('We have to update this ram1',this.backupoldItemsfromsysteminfo.ram1code)
        }
      }
      else {
        this.newsystemFormData.hdd1code = hdd1code;
        this.newsystemFormDataforupdate.hdd1code = hdd1code;
      }
    } else {
      console.log('No data found');
    }
  }


  async selecthdd2forassembled(hdd2code: any) {
    if (hdd2code) {
      await this.getItemidwithitemcode(hdd2code).then(async () => {
        const item_id = this.itemdatafromts[0]?.item_id;
        this.transferStockDataobj.hdd2[0].item_id = item_id;

        await this.checkalreadyAssignorNot(item_id);
        // Check if the item already exists in the array
        const existingIndex = this.transferStockDataobj.hdd2.findIndex(item => item?.item_id === item_id);
        // already exists
        if (existingIndex !== -1) {
          // If the item already exists, replace it in the ram4 array
          this.transferStockDataobj.hdd2[existingIndex].item_id = item_id;
        } else {

          // If the item doesn't exist, push a new object to the ram1 array
          this.transferStockDataobj.hdd2.push({
            item_id: item_id,
            transfer_to_system: this.itemdataforotheritems[0].item_id,
            location_id: 2,
            transfer_by: localStorage.getItem('login_id'),
            transfer_category: 1,
            transfer_to_user: null
          });
        }
        console.log(this.transferStockDataobj, "this.transferStockDataobj");

      });

      this.newsystemFormData.hdd2code = hdd2code;
      this.newsystemFormDataforupdate.hdd2code = hdd2code;

      if ((this.newsystemFormData.hdd1code !== '' && this.newsystemFormData.hdd1code === hdd2code)) {
        Swal.fire({
          title: "warning",
          text: "Sorry same HDDs are not assgined to any system!",
          icon: "warning"
        }).then(() => {
          this.newsystemFormData.hdd2code = '';
        })
      }
      else if (this.backupoldItemsfromsysteminfo.hdd2code) {
        if (this.backupoldItemsfromsysteminfo.hdd2code !== hdd2code) {
          this.replacementLogic(hdd2code, this.backupoldItemsfromsysteminfo.hdd2code, this.selecthdd2forassembled);
        }
      }
      else {
        this.newsystemFormData.hdd2code = hdd2code;
        this.newsystemFormDataforupdate.hdd2code = hdd2code;
      }
    }
    else {
      console.log('No data found');
    }

  }

  async selecthdd2forbrandedsystem(hdd2code: any) {
    if (hdd2code) {
      await this.getItemidwithitemcode(hdd2code).then(async () => {
        const item_id = this.itemdatafromts[0]?.item_id;
        this.transferStockDataobj.hdd2[0].item_id = item_id;

        await this.checkalreadyAssignorNot(item_id);
        // Check if the item already exists in the array
        const existingIndex = this.transferStockDataobj.hdd2.findIndex(item => item?.item_id === item_id);
        // already exists
        if (existingIndex !== -1) {
          // If the item already exists, replace it in the ram4 array
          this.transferStockDataobj.hdd2[existingIndex].item_id = item_id;
        } else {
          // If the item doesn't exist, push a new object to the ram1 array
          this.transferStockDataobj.hdd2.push({
            item_id: item_id,
            transfer_to_system: this.itemdataforotheritems[0].item_id,
            location_id: 2,
            transfer_by: localStorage.getItem('login_id'),
            transfer_category: 1,
            transfer_to_user: null
          });
        }
        console.log(this.transferStockDataobj, "this.transferStockDataobj");

      });

      this.newsystemFormData.hdd2code = hdd2code;
      this.newsystemFormDataforupdate.hdd2code = hdd2code;

      if ((this.newsystemFormData.hdd2code !== '' && this.newsystemFormData.hdd1code === hdd2code)) {
        Swal.fire({
          title: "warning",
          text: "Sorry same HDDs are not assgined to any system!",
          icon: "warning"
        }).then(() => {
          this.newsystemFormData.hdd2code = '';
        })
      }
      else if (this.backupoldItemsfromsysteminfo.hdd2code) {
        if (this.backupoldItemsfromsysteminfo.hdd2code !== hdd2code) {
          this.replacementLogic(hdd2code, this.backupoldItemsfromsysteminfo.hdd2code, this.selecthdd2forbrandedsystem);
        }
      }
      else {
        this.newsystemFormData.hdd2code = hdd2code;
        this.newsystemFormDataforupdate.hdd2code = hdd2code;
      }
    }
    else {
      console.log('No data found');
    }

  }

  async selectsmpsforassembled(smpscode: any) {
    if (smpscode) {
      console.log(smpscode, "smpscode");
      await this.getItemidwithitemcode(smpscode).then(async () => {
        const item_id = this.itemdatafromts[0]?.item_id;
        this.transferStockDataobj.smps[0].item_id = item_id;

        await this.checkalreadyAssignorNot(item_id);
        // Check if the item already exists in the array
        const existingIndex = this.transferStockDataobj.smps.findIndex(item => item?.item_id === item_id);
        // already exists
        if (existingIndex !== -1) {
          // If the item already exists, replace it in the ram4 array
          this.transferStockDataobj.smps[existingIndex].item_id = item_id;
        } else {

          const cpucode = this.newsystemFormDataforupdate.cpucode ? this.newsystemFormDataforupdate.cpucode : this.newsystemFormData.cpucode;
          console.log(cpucode, "cpucode")
          this.getItemidwithitemcodeforotheritems(cpucode).then(() => {
            console.log(this.itemdataforotheritems[0].item_id, "cpuitemid");
            // If the item doesn't exist, push a new object to the ram1 array
            this.transferStockDataobj.graphiccard.push({
              item_id: item_id,
              transfer_to_system: this.itemdataforotheritems[0].item_id,
              location_id: 2,
              transfer_by: localStorage.getItem('login_id'),
              transfer_category: 1,
              transfer_to_user: null
            });

          })


        }
        console.log(this.transferStockDataobj);
      })

      if (this.backupoldItemsfromsysteminfo.smpscode) {

        if (this.backupoldItemsfromsysteminfo.smpscode !== smpscode) {

          this.replacementLogic(smpscode, this.backupoldItemsfromsysteminfo.smpscode, this.selectsmpsforassembled);
          // console.log('We have to update this ram1',this.backupoldItemsfromsysteminfo.ram1code)
        }
        else {
          this.newsystemFormData.smpscode = smpscode;
          this.newsystemFormDataforupdate.smpscode = smpscode;
        }
      }
    }
    else {
      console.log('No data found');
    }
  }

  async selectsmpsforbrandedsystem(smpscode: any) {
    if (smpscode) {
      await this.getItemidwithitemcode(smpscode).then(async () => {
        const item_id = this.itemdatafromts[0]?.item_id;
        this.transferStockDataobj.smps[0].item_id = item_id;

        await this.checkalreadyAssignorNot(item_id);
        // Check if the item already exists in the array
        const existingIndex = this.transferStockDataobj.smps.findIndex(item => item?.item_id === item_id);
        // already exists
        if (existingIndex !== -1) {
          // If the item already exists, replace it in the ram4 array
          this.transferStockDataobj.smps[existingIndex].item_id = item_id;
        } else {
          // If the item doesn't exist, push a new object to the ram1 array
          const cpucode = this.newsystemFormDataforupdate.cpucode ? this.newsystemFormDataforupdate.cpucode : this.newsystemFormData.cpucode;
          // If the item doesn't exist, push a new object to the ram1 array
          this.transferStockDataobj.smps.push({
            item_id: item_id,
            transfer_to_system: this.itemdataforotheritems[0].item_id,
            location_id: 2,
            transfer_by: localStorage.getItem('login_id'),
            transfer_category: 1,
            transfer_to_user: null
          });

        }

        console.log(this.transferStockDataobj);
      })

      if (this.backupoldItemsfromsysteminfo.smpscode) {

        if (this.backupoldItemsfromsysteminfo.smpscode !== smpscode) {

          this.replacementLogic(smpscode, this.backupoldItemsfromsysteminfo.smpscode, this.selectsmpsforbrandedsystem);
          // console.log('We have to update this ram1',this.backupoldItemsfromsysteminfo.ram1code)
        }
        else {

          this.newsystemFormData.smpscode = smpscode;
          this.newsystemFormDataforupdate.smpscode = smpscode;
        }
      }
    }
    else {
      console.log('No data found');
    }
  }


  async selectgraphiccardcodeforassembled(graphiccardcode: any) {
    if (graphiccardcode) {
      await this.getItemidwithitemcode(graphiccardcode).then(async () => {
        const item_id = this.itemdatafromts[0]?.item_id;
        this.transferStockDataobj.graphiccard[0].item_id = item_id;

        await this.checkalreadyAssignorNot(item_id);
        // Check if the item already exists in the array
        const existingIndex = this.transferStockDataobj.graphiccard.findIndex(item => item?.item_id === item_id);
        // already exists
        if (existingIndex !== -1) {
          // If the item already exists, replace it in the ram4 array
          this.transferStockDataobj.graphiccard[existingIndex].item_id = item_id;
        } else {
          const cpucode = this.newsystemFormDataforupdate.cpucode ? this.newsystemFormDataforupdate.cpucode : this.newsystemFormData.cpucode;
          this.getItemidwithitemcodeforotheritems(cpucode).then(() => {
            console.log(this.itemdataforotheritems[0].item_id);
            // If the item doesn't exist, push a new object to the ram1 array
            this.transferStockDataobj.graphiccard.push({
              item_id: item_id,
              transfer_to_system: this.itemdataforotheritems[0].item_id,
              location_id: 2,
              transfer_by: localStorage.getItem('login_id'),
              transfer_category: 1,
              transfer_to_user: null
            });

          })
        }
        console.log(this.transferStockDataobj);
      })
      console.log(graphiccardcode, "graphiccardcode");
      this.newsystemFormData.graphiccardcode = graphiccardcode;
      this.newsystemFormDataforupdate.graphiccardcode = graphiccardcode;
      if (this.backupoldItemsfromsysteminfo.graphiccardcode) {
        if (this.backupoldItemsfromsysteminfo.graphiccardcode !== graphiccardcode) {
          this.replacementLogic(graphiccardcode, this.backupoldItemsfromsysteminfo.graphiccardcode, this.selectgraphiccardcodeforassembled);
        }
      }
      else {
        this.newsystemFormData.graphiccardcode = graphiccardcode;
        this.newsystemFormDataforupdate.graphiccardcode = graphiccardcode;
      }
    }
    else {
      console.log('No data found');
    }
  }

  async selectgraphiccardcodeforbrandedsystem(graphiccardcode: any) {
    if (graphiccardcode) {
      await this.getItemidwithitemcode(graphiccardcode).then(async () => {
        const item_id = this.itemdatafromts[0]?.item_id;
        this.transferStockDataobj.graphiccard[0].item_id = item_id;

        await this.checkalreadyAssignorNot(item_id);
        // Check if the item already exists in the array
        const existingIndex = this.transferStockDataobj.graphiccard.findIndex(item => item?.item_id === item_id);
        // already exists
        if (existingIndex !== -1) {
          // If the item already exists, replace it in the ram4 array
          this.transferStockDataobj.graphiccard[existingIndex].item_id = item_id;
        } else {

          // If the item doesn't exist, push a new object to the ram1 array
          this.transferStockDataobj.graphiccard.push({
            item_id: item_id,
            transfer_to_system: this.itemdataforotheritems[0].item_id,
            location_id: 2,
            transfer_by: localStorage.getItem('login_id'),
            transfer_category: 1,
            transfer_to_user: null
          });
        }
        console.log(this.transferStockDataobj);
      })
      console.log(graphiccardcode, "graphiccardcode");
      this.newsystemFormData.graphiccardcode = graphiccardcode;
      this.newsystemFormDataforupdate.graphiccardcode = graphiccardcode;

      if (this.backupoldItemsfromsysteminfo.graphiccardcode) {
        if (this.backupoldItemsfromsysteminfo.graphiccardcode !== graphiccardcode) {
          this.replacementLogic(graphiccardcode, this.backupoldItemsfromsysteminfo.graphiccardcode, this.selectgraphiccardcodeforbrandedsystem);
        }
      }
      else {
        this.newsystemFormData.graphiccardcode = graphiccardcode;
        this.newsystemFormDataforupdate.graphiccardcode = graphiccardcode;
      }
    }
    else {
      console.log('No data found');
    }
  }

  // getItemidwithitemcode(item_code: any): Promise<void> {
  //   console.log(item_code, "itemcode")
  //   return new Promise<void>((resolve, reject) => {

  //     const ItemId = {
  //       item_code: item_code
  //     }
  //     console.log(ItemId, "ItemId")

  //     this.sharedServices.getitemdatafromitemcode(ItemId).subscribe({
  //       next: (results: any) => {
  //         console.log(results, "getitemdatafromitemcode");
  //         this.itemdatafromts = results;
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

  async getItemidwithitemcode(item_code: any) {
    this.itemdatafromts = await firstValueFrom(this.sharedServices.getitemdatafromitemcode({ item_code }));
  }

  // getItemidwithitemcodeforotheritems(item_code: any): Promise<void> {
  //   return new Promise<void>((resolve, reject) => {

  //     if (item_code) {
  //       const ItemId = {
  //         item_code: item_code
  //       }
  //       // console.log(ItemId, "ItemId")

  //       this.sharedServices.getitemdatafromitemcode(ItemId).subscribe({
  //         next: (results: any) => {
  //           console.log(results, "getitemdatafromitemcode");


  //           this.itemdataforotheritems = results;
  //           resolve();

  //         },
  //         error: (error) => {
  //           if (error.status == 403) {
  //             Swal.fire({
  //               icon: 'error',
  //               title: 'Oops!',
  //               text: 'Token expired.',
  //               footer: '<a href="../login">Please login again!</a>'
  //             }).then(() => {
  //               this.router.navigate(['../login']);
  //               reject(); // Reject the Promise in case of an error

  //             })
  //           }
  //           else {
  //             Swal.fire({
  //               icon: 'error',
  //               title: 'Oops!',
  //               text: 'Internal server error.Please try after some time!',
  //               footer: '<a href="../login">Login</a>'
  //             }).then(() => {
  //               location.reload();
  //               reject(); // Reject the Promise in case of an error

  //             })
  //           }
  //         }
  //       });
  //     }
  //   });
  // }

  async getItemidwithitemcodeforotheritems(item_code: any) {
    this.itemdataforotheritems = await firstValueFrom(this.sharedServices.getitemdatafromitemcode({ item_code }));
  }

  async getAssigneddatafromtsandsysteminfo() {
    try {
      const [assigneddatafromts, assgineddatafromsysinfo]: any =
        await firstValueFrom(forkJoin([
          this.sharedServices.getAssigneditemsfromts(),
          this.sharedServices.getAssigneditemsfromsysteminfo(),
        ]));

      console.log(assigneddatafromts, "assigneddatafromts");
      console.log(assgineddatafromsysinfo, "assgineddatafromsysinfo");
      const deepcloningofassgineddatafromsysinfo = JSON.parse(JSON.stringify(assgineddatafromsysinfo));
      const deepcloningofassgineddatafromsts = JSON.parse(JSON.stringify(assigneddatafromts));


      //TAKING OUT ALL 
      const filteringdata = deepcloningofassgineddatafromsysinfo.reduce((acc: any, obj: any) => {
        Object.keys(obj).forEach((key) => {
          if (obj[key] !== null && key !== 'sid') {
            acc.push(obj[key]);
          }
        });
        return acc;
      }, []);

      const fetchingdatafromassigneddatafromts = deepcloningofassgineddatafromsts.map((e: any) => {

        this.arrayofassigneditemsints.push(e.name);
      })

      this.arrayofassigneditemsinsysinfo = filteringdata;
      this.arrayofassigneditemsinsysinfo = this.arrayofassigneditemsinsysinfo.concat(this.arrayofassigneditemsints);
      console.log(this.arrayofassigneditemsinsysinfo, "this.arrayofassigneditemsints")
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



  // async replacementLogic(newitem: any, replacement: any, calledfunction: Function) {

  //   if (replacement && newitem) {
  //     await this.getItemidwithitemcode(replacement);

  //     console.log(this.itemdatafromts, "this.itemdatafromts");
  //     /* inputOptions can be an object or Promise */
  //     await Swal.fire({
  //       title: "Are you sure?",
  //       text: `You want to replace ${newitem} with ${replacement}`,
  //       icon: "warning",
  //       showCancelButton: true,
  //       confirmButtonColor: "#3085d6",
  //       cancelButtonColor: "#d33",
  //       confirmButtonText: "Yes, replace it!"
  //     }).then(async (result) => {
  //       if (result.isConfirmed) {
  //         /* inputOptions can be an object or Promise */
  //         const inputOptions = new Promise<{ [key: number]: string }>((resolve) => {

  //           setTimeout(() => {
  //             const options = {
  //               1: "Warehouse",
  //               4: "SCRAPPED: Stored at 3/311 OFFICE",
  //               5: "SCRAPPED: Stored at 5/506 OFFICE",
  //             };
  //             console.log("Options:", options); // Add this line for debugging
  //             resolve(options);
  //           }, 500);
  //         });

  //         try {
  //           const { value: selectedLocation } = await Swal.fire({
  //             title: `Where you want to put ${replacement}`,
  //             input: "radio",
  //             inputOptions: await inputOptions, // Resolve the promise here
  //             inputValidator: (value: string) => {
  //               if (!value) {
  //                 return "You need to choose something!";
  //               }
  //               return '';
  //             }
  //           });

  //           if (selectedLocation) {
  //             console.log(selectedLocation, "selectedLocation")
  //             this.getItemidwithitemcodeforotheritems(replacement).then(async () => {
  //               const transferStockdata =
  //               {
  //                 item_id: +this.itemdataforotheritems[0].item_id,
  //                 transfer_to_system: null,
  //                 location_id: + selectedLocation,
  //                 transfer_by: localStorage.getItem('login_id'),
  //                 transfer_category: 1,
  //                 transfer_to_user: null,
  //               }

  //               console.log(transferStockdata, "transferStockdata");
  //               await this.transferStocktoLocation(transferStockdata, +selectedLocation, replacement)
  //                 .then(() => {
  //                     const message = selectedLocation==1?`Item successfully transferred to warehouse!`:`Item successfully transferred to scrap!`;
  //                     if(message){
  //                       Swal.fire({
  //                         position: "center",
  //                         icon: "success",
  //                         title: `${message}`,
  //                         showConfirmButton: false,
  //                         timer: 1500
  //                       });
  //                     }

  //                   // this.previousDatafromsubjectBehaviour();
  //                   console.log(calledfunction.name, "calledfunction.name");
  //                   if (calledfunction) {
  //                     const functionname = '' + calledfunction.name;
  //                     switch (functionname) {
  //                       case 'selectram1forassembled':
  //                         this.newsystemFormData.ram1code = newitem;
  //                         this.newsystemFormDataforupdate.ram1code = newitem;
  //                         break;

  //                       case 'selectram1forbrandedsystem':
  //                         this.newsystemFormData.ram1code = newitem;
  //                         this.newsystemFormDataforupdate.ram1code = newitem;
  //                         break;

  //                       case 'selectram2forassembled':
  //                         this.newsystemFormData.ram2code = newitem;
  //                         this.newsystemFormDataforupdate.ram2code = newitem;
  //                         break;

  //                       case 'selectram2forbrandedsystem':
  //                         this.newsystemFormData.ram2code = newitem;
  //                         this.newsystemFormDataforupdate.ram2code = newitem;

  //                         break;

  //                       case 'selectram3forassembled':
  //                         this.newsystemFormData.ram3code = newitem;
  //                         this.newsystemFormDataforupdate.ram3code = newitem;

  //                         break;

  //                       case 'selectram3forbrandedsystem':
  //                         this.newsystemFormData.ram3code = newitem;
  //                         this.newsystemFormDataforupdate.ram3code = newitem;
  //                         break;

  //                       case 'selectram4forassembled':
  //                         this.newsystemFormData.ram4code = newitem;
  //                         this.newsystemFormDataforupdate.ram4code = newitem;
  //                         break;
  //                       case 'selectram4forbrandedsystem':
  //                         this.newsystemFormData.ram4code = newitem;
  //                         this.newsystemFormDataforupdate.ram4code = newitem;
  //                         break;
  //                       case 'selecthdd1forassembled':
  //                         this.newsystemFormData.hdd1code = newitem;
  //                         this.newsystemFormDataforupdate.hdd1code = newitem;
  //                         break;
  //                       case 'selecthdd1forbrandedsystem':
  //                         this.newsystemFormData.hdd1code = newitem;
  //                         this.newsystemFormDataforupdate.hdd1code = newitem;
  //                         break;
  //                       case 'selecthdd2forassembled':
  //                         this.newsystemFormData.hdd2code = newitem;
  //                         this.newsystemFormDataforupdate.hdd2code = newitem;
  //                         break;
  //                       case 'selecthdd2brandedsystem':
  //                         this.newsystemFormData.hdd2code = newitem;
  //                         this.newsystemFormDataforupdate.hdd2code = newitem;
  //                         break;
  //                       case 'selectsmpsforassembled':
  //                         this.newsystemFormData.smpscode = newitem;
  //                         this.newsystemFormDataforupdate.smpscode = newitem;
  //                         break;
  //                       case 'selectsmpsforbrandedsystem':
  //                         this.newsystemFormData.smpscode = newitem;
  //                         this.newsystemFormDataforupdate.smpscode = newitem;
  //                         break;
  //                       case 'selectgraphiccardcodeforassembled':
  //                         this.newsystemFormData.graphiccardcode = newitem;
  //                         this.newsystemFormDataforupdate.graphiccardcode = newitem;
  //                         break;
  //                       case 'selectgraphiccardcodeforbrandedsystem':
  //                         this.newsystemFormData.graphiccardcode = newitem;
  //                         this.newsystemFormDataforupdate.graphiccardcode = newitem;
  //                         break;
  //                     }
  //                   }



  //                   // this.previousDatafromsubjectBehaviour();
  //                 });

  //                 // dated:2025-03-05
  //                 // if branded system is going to warehouse to use in anyother sytem then its item_status should be 1
  //                 if(selectedLocation==1 && (this.itemdatafromts[0].purchase_id).startsWith('BRND-')){
  //                   console.log('hello');
  //                   const itemId ={
  //                     item_id:this.itemdatafromts[0].item_id,
  //                     item_status:'1'
  //                   }
  //                    const result = await this.adminService.updateItemStatus(itemId).toPromise();
  //                    result==1?console.log('Item status updated successfully!'):console.warn('Error occured during updation!');
  //                 }
  //             })

  //           }
  //         } catch (error: unknown) {
  //           if (error instanceof HttpErrorResponse && error.status === 403) {
  //             await Swal.fire({
  //               icon: 'error',
  //               title: 'Oops!',
  //               text: 'Token expired.',
  //               footer: '<a href="../login">Please login again!</a>'
  //             }).then(() => {
  //               this.router.navigate(['../login']);
  //             })

  //           } else {
  //             await Swal.fire({
  //               icon: 'error',
  //               title: 'Oops!',
  //               text: 'Internal server error. Please try after some time!',
  //               footer: '<a href="../login">Login</a>'
  //             }).then(() => {
  //               location.reload();
  //             })
  //           }
  //         }
  //       }
  //       else {

  //         if (calledfunction) {
  //           const functionname = '' + calledfunction.name;
  //           switch (functionname) {

  //             case 'selectram1forassembled':
  //               this.newsystemFormData.ram1code = this.backupoldItemsfromsysteminfo.ram1code;
  //               this.newsystemFormDataforupdate.ram1code = this.backupoldItemsfromsysteminfo.ram1code;
  //               break;

  //             case 'selectram1forbrandedsystem':
  //               this.newsystemFormData.ram1code = this.backupoldItemsfromsysteminfo.ram1code;
  //               this.newsystemFormDataforupdate.ram1code = this.backupoldItemsfromsysteminfo.ram1code;
  //               break;

  //             case 'selectram2forassembled':
  //               this.newsystemFormData.ram2code = this.backupoldItemsfromsysteminfo.ram2code;
  //               this.newsystemFormDataforupdate.ram2code = this.backupoldItemsfromsysteminfo.ram2code;
  //               break;

  //             case 'selectram2forbrandedsystem':
  //               this.newsystemFormData.ram2code = this.backupoldItemsfromsysteminfo.ram2code;
  //               this.newsystemFormDataforupdate.ram2code = this.backupoldItemsfromsysteminfo.ram2code;

  //               break;

  //             case 'selectram3forassembled':
  //               this.newsystemFormData.ram3code = this.backupoldItemsfromsysteminfo.ram3code;
  //               this.newsystemFormDataforupdate.ram3code = this.backupoldItemsfromsysteminfo.ram3code;

  //               break;

  //             case 'selectram3forbrandedsystem':
  //               this.newsystemFormData.ram3code = this.backupoldItemsfromsysteminfo.ram3code;
  //               this.newsystemFormDataforupdate.ram3code = this.backupoldItemsfromsysteminfo.ram3code;
  //               break;

  //             case 'selectram4forassembled':
  //               this.newsystemFormData.ram4code = this.backupoldItemsfromsysteminfo.ram4code;
  //               this.newsystemFormDataforupdate.ram4code = this.backupoldItemsfromsysteminfo.ram4code;
  //               break;
  //             case 'selectram4forbrandedsystem':
  //               this.newsystemFormData.ram4code = this.backupoldItemsfromsysteminfo.ram4code;
  //               this.newsystemFormDataforupdate.ram4code = this.backupoldItemsfromsysteminfo.ram4code;
  //               break;
  //             case 'selecthdd1forassembled':
  //               this.newsystemFormData.hdd1code = this.backupoldItemsfromsysteminfo.hdd1code;
  //               this.newsystemFormDataforupdate.hdd1code = this.backupoldItemsfromsysteminfo.hdd1code;
  //               break;
  //             case 'selecthdd1forbrandedsystem':
  //               this.newsystemFormData.hdd1code = this.backupoldItemsfromsysteminfo.hdd1code;
  //               this.newsystemFormDataforupdate.hdd1code = this.backupoldItemsfromsysteminfo.hdd1code;
  //               break;
  //             case 'selecthdd2forassembled':
  //               this.newsystemFormData.hdd2code = this.backupoldItemsfromsysteminfo.hdd2code;
  //               this.newsystemFormDataforupdate.hdd2code = this.backupoldItemsfromsysteminfo.hdd2code;
  //               break;
  //             case 'selecthdd2brandedsystem':
  //               this.newsystemFormData.hdd2code = this.backupoldItemsfromsysteminfo.hdd2code;
  //               this.newsystemFormDataforupdate.hdd2code = this.backupoldItemsfromsysteminfo.hdd2code;
  //               break;
  //             case 'selectsmpsforassembled':
  //               this.newsystemFormData.smpscode = this.backupoldItemsfromsysteminfo.smpscode;
  //               this.newsystemFormDataforupdate.smpscode = this.backupoldItemsfromsysteminfo.smpscode;
  //               break;
  //             case 'selectsmpsforbrandedsystem':
  //               this.newsystemFormData.smpscode = this.backupoldItemsfromsysteminfo.smpscode;
  //               this.newsystemFormDataforupdate.smpscode = this.backupoldItemsfromsysteminfo.smpscode;
  //               break;
  //             case 'selectgraphiccardcodeforassembled':
  //               this.newsystemFormData.graphiccardcode = this.backupoldItemsfromsysteminfo.graphiccardcode;
  //               this.newsystemFormDataforupdate.graphiccardcode = this.backupoldItemsfromsysteminfo.graphiccardcode;
  //               break;
  //             case 'selectgraphiccardcodeforbrandedsystem':
  //               this.newsystemFormData.graphiccardcode = this.backupoldItemsfromsysteminfo.graphiccardcode;
  //               this.newsystemFormDataforupdate.graphiccardcode = this.backupoldItemsfromsysteminfo.graphiccardcode;
  //               break;
  //           }
  //         }

  //       }

  //     });
  //   }
  //   else {
  //     console.log('Replacement and newitem is not found');
  //   }
  // }

  //  refactor code at 29-12-2025
  async replacementLogic(newitem: any, replacement: any, calledfunction: Function) {
    if (!replacement || !newitem) {
      console.log('Replacement and newitem is not found');
      return;
    }

    // 🔹 INLINE FIELD MAP (NO EXTRA FUNCTION)
    const fieldMap: any = {
      selectram1forassembled: 'ram1code',
      selectram1forbrandedsystem: 'ram1code',

      selectram2forassembled: 'ram2code',
      selectram2forbrandedsystem: 'ram2code',

      selectram3forassembled: 'ram3code',
      selectram3forbrandedsystem: 'ram3code',

      selectram4forassembled: 'ram4code',
      selectram4forbrandedsystem: 'ram4code',

      selecthdd1forassembled: 'hdd1code',
      selecthdd1forbrandedsystem: 'hdd1code',

      selecthdd2forassembled: 'hdd2code',
      selecthdd2forbrandedsystem: 'hdd2code',

      selectsmpsforassembled: 'smpscode',
      selectsmpsforbrandedsystem: 'smpscode',

      selectgraphiccardcodeforassembled: 'graphiccardcode',
      selectgraphiccardcodeforbrandedsystem: 'graphiccardcode'
    };

    try {
      await this.getItemidwithitemcode(replacement);

      console.log(this.itemdatafromts, "this.itemdatafromts");
      /* inputOptions can be an object or Promise */
      // 🔹 CONFIRMATION

      const confirmResult = await Swal.fire({
        title: "Are you sure?",
        // text: `You want to replace ${newitem} with ${replacement}`,
        html: ` <div style="
      font-size:14px;
      line-height:1.6;
      text-align:left;
      max-width:100%;
      word-break:break-word;
    ">
      <p style="margin-bottom:8px;">
        You want to replace:
      </p>

      <div style="
        background:#f8f9fa;
        padding:8px 10px;
        border-radius:6px;
        margin-bottom:8px;
      ">
        <b>Old Item:</b>
        <div style="word-break:break-word;">${replacement}</div>
      </div>
      <div><p style="margin-bottom:8px;">With 
      </p></div>

      <div style="
        background:#f1f3f5;
        padding:8px 10px;
        border-radius:6px;
      ">
        <b>New Item:</b>
        <div style="word-break:break-word;">${newitem}</div>
      </div>
    </div>`,
        icon: "warning",
        width: 600,
        padding: '1.5rem',
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, replace it!"
      })

      const field = fieldMap[calledfunction?.name];
      console.log(field, "field");
      // ❌ CANCELLED → RESTORE OLD VALUE
      if (!confirmResult.isConfirmed) {
        if (field) {
          this.newsystemFormData[field] = this.backupoldItemsfromsysteminfo[field];
          this.newsystemFormDataforupdate[field] = this.backupoldItemsfromsysteminfo[field];
        }
        return;
      }


      // 🔹 LOCATION SELECTION
      const { value: selectedLocation } = await Swal.fire({
        title: `Where you want to put ${replacement}`,
        width: 620,
        padding: '1.5rem',
        input: "radio",
        inputOptions: {
          1: "Main Warehouse (at 3/311 Office)",
          7: "SCRAPPED: Stored at 3/311 OFFICE",
          8: "SCRAPPED: Stored at 5/506 OFFICE",
        },
        inputValidator: (value: string) =>
          !value ? "You need to choose something!" : ''
      });

      if (!selectedLocation) {
        if (field) {
          this.newsystemFormData[field] = this.backupoldItemsfromsysteminfo[field];
          this.newsystemFormDataforupdate[field] = this.backupoldItemsfromsysteminfo[field];
        }
        return;
      };

      console.log(selectedLocation, "selectedLocation")
      await this.getItemidwithitemcodeforotheritems(replacement);

      // if (!this.itemdataforotheritems?.length) {
      //   if (field) {
      //     this.newsystemFormData[field] = this.backupoldItemsfromsysteminfo[field];
      //     this.newsystemFormDataforupdate[field] = this.backupoldItemsfromsysteminfo[field];
      //   }
      //   throw new Error('Item data not found for transfer');
      // }

      // if (!this.itemdatafromts?.length) {
      //   if (field) {
      //     this.newsystemFormData[field] = this.backupoldItemsfromsysteminfo[field];
      //     this.newsystemFormDataforupdate[field] = this.backupoldItemsfromsysteminfo[field];
      //   }
      //   throw new Error('Original item data not found');
      // }

      if (!this.itemdataforotheritems?.length || !this.itemdatafromts?.length) {

        if (field) {
          const oldValue = this.backupoldItemsfromsysteminfo[field];
          this.newsystemFormData[field] = oldValue;
          this.newsystemFormDataforupdate[field] = oldValue;
        }

        throw new Error(
          !this.itemdataforotheritems?.length
            ? 'Item data not found for transfer'
            : 'Original item data not found'
        );
      }


      const transferStockdata =
      {
        item_id: +this.itemdataforotheritems[0].item_id,
        transfer_to_system: null,
        location_id: + selectedLocation,
        transfer_by: localStorage.getItem('login_id'),
        transfer_category: 1,
        transfer_to_user: null,
      }

      console.log(transferStockdata, "transferStockdata");
      await this.transferStocktoLocation(transferStockdata, +selectedLocation, replacement);


      // const message = selectedLocation == 1 ? `Item successfully transferred to warehouse!` : `Item successfully transferred to scrap!`;

      const locationMessages: any = {
        1: 'Item successfully transferred to Main Warehouse (at 3/311 Office)!',
        7: 'Item successfully transferred to SCRAPPED: Stored at 3/311 OFFICE!',
        8: 'Item successfully transferred to SCRAPPED: Stored at 5/506 OFFICE!'
      };

      // ✅ CONFIRMED → SET NEW VALUE
      if (field) {
        this.newsystemFormData[field] = newitem;
        this.newsystemFormDataforupdate[field] = newitem;
      }

      // dated:2025-03-05
      // if branded system is going to warehouse to use in anyother sytem then its item_status should be 1
      if (selectedLocation == 1 && (this.itemdatafromts[0].purchase_id).startsWith('BRND-')) {
        const itemId = {
          item_id: this.itemdatafromts[0].item_id,
          item_status: '1'
        }
        const result = await firstValueFrom(this.adminService.updateItemStatus(itemId));
        result == 1 ? console.log('Item status updated successfully!') : console.warn('Error occured during updation!');
      }


      const message = locationMessages[selectedLocation];

      if (message) {
        await Swal.fire({
          position: "center",
          icon: "success",
          title: `${message}`,
          showConfirmButton: false,
          timer: 1500
        });
      }

      // this.previousDatafromsubjectBehaviour();
      // console.log(calledfunction.name, "calledfunction.name");


      await this.updateSystemInfo(true);

      // this.previousDatafromsubjectBehaviour()
    }

    catch (error: unknown) {
      if (error instanceof HttpErrorResponse && error.status === 403) {
        await Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Token expired.',
          footer: '<a href="../login">Please login again!</a>'
        })

        this.router.navigate(['../login']);

      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Internal server error. Please try after some time!',
          footer: '<a href="../login">Login</a>'
        });

        location.reload();

      }
    }


  }



  async transferStocktoLocation(tranferingdata: any, selectedlocation: number, item_code: any) {
    try {
      console.log(tranferingdata, selectedlocation, item_code);

      if (selectedlocation && selectedlocation !== 4) {
        console.log('Transfer to other location.')

        await firstValueFrom(this.adminService.transferStock(tranferingdata));
        console.warn(`${item_code} is transferring to location_id:${selectedlocation}`);

      }
      else {
        //for scrapped item
        console.log('Transfer to scraped.')
        const ItemCode = {
          item_code: item_code
        };

        await firstValueFrom(this.adminService.transferStock(tranferingdata));
        await firstValueFrom(this.adminService.updatescrappediteminSysteminfo(ItemCode));
        console.warn(`${item_code} is scraped and updated in every location`);


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

  // Method to handle clearing the selection
  async onClear(source: any) {

    if (this.displayupdateButton) {
      const deletingCode = this.newsystemFormDataforupdate[source];

      this.newsystemFormDataforupdate[source] = '';

      const itemCode = {
        item_code: deletingCode,
        admin_url: this.adminUrl
      }

      console.log(itemCode, "event")


      const getItemsdata: any = await firstValueFrom(this.sharedServices.getitemdatafromitemcode(itemCode));
      console.log(getItemsdata, "getItemsdata");

      if (getItemsdata) {

        if (getItemsdata && getItemsdata.length > 0 && getItemsdata[0].item_name) {
          //deltete if auto-generated code 
          const itemName = getItemsdata[0].item_name;
          const acceptedItemName = ["B-RAM", "B-HDD", "B-Graphics Card", "B-SMPS"];
          if (acceptedItemName.includes(itemName)) {

            await Swal.fire({
              title: "Are you sure?",
              text: `You want to delete ${deletingCode}`,
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Yes, delete it!"
            }).then(async (result) => {
              if (result.isConfirmed) {
                try {
                  //deltete if auto-generated code 
                  console.log(itemCode, "itemCode");
                  await firstValueFrom(this.adminService.deleteitemsfromItemsandSysteminfo(itemCode));

                  await Swal.fire({
                    position: "center",
                    icon: "success",
                    title: `${deletingCode} has been deleted successfully!`,
                    showConfirmButton: false,
                    timer: 1500
                  })
                  // this.newsystemFormDataforupdate[source] = '';
                  // this.newsystemFormData[source] = '';
                  this.backupoldItemsfromsysteminfo[source] = '';

                  //if deleted then remove from source & control
                  this.newsystemFormDataforupdate[source] = '';

                }
                catch (err) {
                  console.error(err, "Error at deleteitemsfromItemsandSysteminfo");
                }
              }
              else {
                const columnName = source;
                if (source) {
                  this.newsystemFormData[columnName] = itemCode.item_code;
                }
              }
            })
          }
          else {
            //not delete is purchased item
            const columnName = source;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Sorry, deletion is not possible!',
            })
            this.newsystemFormData[columnName] = itemCode.item_code;

          }
        }
        else {
          // no item found in item table

          // ddd
          console.info('Item name not found!');
        }

      }
    }
    else {
      console.info('System added scenario');
    }
  }


  validationradiobtn() {
    this.systemradioBtn = new FormGroup({
      systemType: new FormControl('Branded Computer')
    })

    this.newsystemForm = new FormGroup({
      cpucode: new FormControl('', [Validators.required]),
      username: new FormControl(0),
      processor: new FormControl(''),
      ram1: new FormControl(''),
      ram2: new FormControl(''),
      ram3: new FormControl(''),
      ram4: new FormControl(''),
      hdd1: new FormControl(''),
      hdd2: new FormControl(''),
      graphiccard: new FormControl(''),
      smps: new FormControl(''),
      cabinet: new FormControl(''),
      cmos: new FormControl(''),
      motherboard: new FormControl(''),
      description: new FormControl(''),
    })

  }


  navigateBack() {
    let variable = localStorage.getItem('backUrl');
    this.router.navigateByUrl(`${variable}`);
    localStorage.removeItem('backUrl');
  }

  // ngOnDestroy(): void {
  //   // Unsubscribe to prevent memory leaks and multiple subscriptions
  //   if (this.subscription) {
  //     this.subscription.unsubscribe();
  //   }
  // }

  async checkalreadyAssignorNot(data: any) {
    console.log(data, "ItemIdincheckalreadyAssignorNot");

    // Wait for transfer data to be fetched
    await this.getTransferData(data);

    // Check if item has a transfer_to_system
    if (this.configureitemdetails && this.configureitemdetails.length > 0 && this.configureitemdetails[0].transfer_to_system && this.configureitemdetails[0].system_name) {
      const itemCode = this.configureitemdetails[0].item_code;
      const systmeName = this.configureitemdetails[0].system_name;
      // Show the first confirmation popup and wait for the result
      const result = await Swal.fire({
        title: "Item Already Installed", // More concise title
        html: `<p style="font-size: 17px;">${itemCode} is already installed in ${systmeName}.<br>First remove the existing installation.</p>`, // Use HTML for better formatting
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Remove It", // More action-oriented button text
        cancelButtonText: "Cancel", // Add cancel button text
        footer: `<div style="color: red; font-size: smaller;">Note: This will remove ${itemCode} from the system information.</div>` // Improved footer styling
      });

      // If the user clicks "Yes"
      if (result.isConfirmed) {
        this.dataforsysteminfowhenscrapped.item_code = itemCode;

        // Wait for the system info to be updated
        await this.updatesysteminfoforsrapitem();

      } else {
        await this.previousDatafromsubjectBehaviour(); // If user cancels, call this
      }
    } else {
      console.log('Item not deleted from system-info');
      await this.previousDatafromsubjectBehaviour();
    }
  }



  async updatesysteminfoforsrapitem() {
    try {
      await firstValueFrom(this.adminService.updatescrappediteminSysteminfo(this.dataforsysteminfowhenscrapped));

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


    // next: (results: any) => {
    //   resolve();
    //   // console.log(results, "Scrapped item updated in system info")
    // },
    // error: (error: any) => {
    //   reject(error);
    //   console.error(error);
    //   if (error.status == 403) {
    //     Swal.fire({
    //       icon: 'error',
    //       title: 'Oops!',
    //       text: 'Token expired.',
    //       footer: '<a href="../login">Please login again!</a>'
    //     }).then(() => {
    //       this.router.navigate(['../login']);
    //     })
    //   }
    //   else {
    //     Swal.fire({
    //       icon: 'error',
    //       title: 'Oops!',
    //       text: 'Internal server error.Please try after some time!',
    //       footer: '<a href="../login">Login</a>'
    //     }).then(() => {
    //       location.reload();
    //     })
    //   }
    // }
    // })


  }


}
