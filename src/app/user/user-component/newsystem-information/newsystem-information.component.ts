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

enum AssignCheckResult {
  OK = 'OK',
  REMOVED_NEEDS_LOCATION = 'REMOVED_NEEDS_LOCATION',
  CANCELLED = 'CANCELLED'
}


// interface TransferStockData {
//   [key: string]: { item_id: number, transfer_to_system: number, location_id: number, transfer_by: any, transfer_category: number, transfer_to_user: null }[];
// }


@Component({
  selector: 'app-newsystem-information',
  templateUrl: './newsystem-information.component.html',
  styleUrls: ['./newsystem-information.component.scss']
})


export class NewsystemInformationComponent {
  private isReplacementInProgress = false;
  isRestoringFromClear = false;
  dropdownSettings = {};

  currentdate: any
  systemradioBtn: any;
  newsystemForm: any;
  newsystemFormData: any = {
    cpucode: '',
    username: null,
    processor: '',
    processorcode: null,
    ram1: '',
    ram1code: null,
    ram2: '',
    ram2code: null,
    ram3: '',
    ram3code: null,
    ram4: '',
    ram4code: null,
    hdd1: '',
    hdd1code: null,
    hdd2: '',
    hdd2code: null,
    graphiccard: '',
    graphiccardcode: null,
    smps: '',
    smpscode: null,
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
    username: null,
    processor: '',
    ram1: '',
    ram1code: null,
    ram2: '',
    ram2code: null,
    ram3: '',
    ram3code: null,
    ram4: '',
    ram4code: null,
    hdd1: '',
    hdd1code: null,
    hdd2: '',
    hdd2code: null,
    graphiccard: '',
    graphiccardcode: null,
    smps: '',
    smpscode: null,
    cabinet: '',
    cmos: '',
    motherboard: '',
    system_type: '',
    description: '',
    system_status: 1,
  }

  backupoldItemsfromsysteminfo: any = {
    sid: 0,
    username: null,
    processor: '',
    ram1: '',
    ram1code: null,
    ram2: '',
    ram2code: null,
    ram3: '',
    ram3code: null,
    ram4: '',
    ram4code: null,
    hdd1: '',
    hdd1code: null,
    hdd2: '',
    hdd2code: null,
    graphiccard: '',
    graphiccardcode: null,
    smps: '',
    smpscode: null,
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

  isCpuValid: boolean = false;

  constructor(private sharedServices: SharedService, private router: Router, private adminService: AdminService, private cdr: ChangeDetectorRef, private spinner: NgxSpinnerService, private route: ActivatedRoute) {
    this.validationradiobtn();
    this.adminUrl = environment.ADMIN_URL;
    const today = moment();
    this.currentdate = today.local().format('YYYY-MM-DD');
    // this.getDataFromparams();
  }


  ngOnInit(): void {
    this.getSystems();
    this.getDataFromparams();  // loads only if params or selected item exist
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
          this.makecpucoodereadonly = true;
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
          this.spinner.hide();
          return;
        }


        // Case 3: NO params and NO selected item → NEW FORM
        this.resetFormToInitialState();  // 👈 ADD THIS
        this.spinner.hide();

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

  resetFormToInitialState() {
    // UI flags
    this.displayassembledComputer = false;
    this.displaybrandedComputer = false;
    this.displayoldComputer = false;
    this.displayupdateButton = false;
    this.displayaddButton = true;
    this.makecpucoodereadonly = false;

    // Reset main form models
    this.newsystemFormData = {
      cpucode: '',
      username: null,
      processor: '',
      processorcode: null,
      ram1: '',
      ram1code: null,
      ram2: '',
      ram2code: null,
      ram3: '',
      ram3code: null,
      ram4: '',
      ram4code: null,
      hdd1: '',
      hdd1code: null,
      hdd2: '',
      hdd2code: null,
      graphiccard: '',
      graphiccardcode: null,
      smps: '',
      smpscode: null,
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
    };

    this.newsystemFormDataforupdate = {
      sid: 0,
      username: null,
      processor: '',
      ram1: '',
      ram1code: null,
      ram2: '',
      ram2code: null,
      ram3: '',
      ram3code: null,
      ram4: '',
      ram4code: null,
      hdd1: '',
      hdd1code: null,
      hdd2: '',
      hdd2code: null,
      graphiccard: '',
      graphiccardcode: null,
      smps: '',
      smpscode: null,
      cabinet: '',
      cmos: '',
      motherboard: '',
      system_type: '',
      description: '',
      system_status: 1,
    };

    this.backupoldItemsfromsysteminfo = {
      sid: 0,
      username: null,
      processor: '',
      ram1: '',
      ram1code: null,
      ram2: '',
      ram2code: null,
      ram3: '',
      ram3code: null,
      ram4: '',
      ram4code: null,
      hdd1: '',
      hdd1code: null,
      hdd2: '',
      hdd2code: null,
      graphiccard: '',
      graphiccardcode: null,
      smps: '',
      smpscode: null,
      cabinet: '',
      cmos: '',
      motherboard: '',
      system_type: '',
      description: '',
      system_status: 1
    };

    // Reset transfer stock object
    this.transferStockDataobj = {
      ram1: [{ item_id: 0, transfer_to_system: 0, location_id: 2, transfer_by: localStorage.getItem('login_id'), transfer_category: 1, transfer_to_user: null }],
      ram2: [{ item_id: 0, transfer_to_system: 0, location_id: 2, transfer_by: localStorage.getItem('login_id'), transfer_category: 1, transfer_to_user: null }],
      ram3: [{ item_id: 0, transfer_to_system: 0, location_id: 2, transfer_by: localStorage.getItem('login_id'), transfer_category: 1, transfer_to_user: null }],
      ram4: [{ item_id: 0, transfer_to_system: 0, location_id: 2, transfer_by: localStorage.getItem('login_id'), transfer_category: 1, transfer_to_user: null }],
      hdd1: [{ item_id: 0, transfer_to_system: 0, location_id: 2, transfer_by: localStorage.getItem('login_id'), transfer_category: 1, transfer_to_user: null }],
      hdd2: [{ item_id: 0, transfer_to_system: 0, location_id: 2, transfer_by: localStorage.getItem('login_id'), transfer_category: 1, transfer_to_user: null }],
      smps: [{ item_id: 0, transfer_to_system: 0, location_id: 2, transfer_by: localStorage.getItem('login_id'), transfer_category: 1, transfer_to_user: null }],
      graphiccard: [{ item_id: 0, transfer_to_system: 0, location_id: 2, transfer_by: localStorage.getItem('login_id'), transfer_category: 1, transfer_to_user: null }],
    };

    // Reset reactive forms if present
    this.newsystemForm?.reset();
    this.systemradioBtn?.reset({ systemType: 'Branded Computer' });

    // Clear selectedItem service state
    this.adminService.resetSelectedItem();
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
    const newType = event.target.value;
    this.newsystemFormData.system_type = newType;

    // If CPU already selected → re-run CPU selection logic
    const currentCpuCode = this.newsystemFormData.cpucode;
    // console.log(currentCpuCode, "currentCpuCode in selectSystemType");

    if (currentCpuCode) {
      // Find the CPU object from allsystems list
      const cpuObj = this.allsystems.find(
        (sys) => sys.item_code === currentCpuCode
      );

      // console.log(cpuObj, "cpuObj in selectSystemType");

      if (cpuObj) {
        // Call same function again to regenerate fields
        this.selectCPU(cpuObj);
      }
    }
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
          username: null,
        })

        this.newsystemFormData.cpucode = '';
        this.newsystemFormData.username = null;
        this.newsystemFormDataforupdate.username = null;
        this.newsystemFormData.processor = '';
        this.newsystemFormDataforupdate.processor = '';
        this.newsystemFormData.ram1 = '';
        this.newsystemFormData.ram1code = null;
        this.newsystemFormDataforupdate.ram1 = '';
        this.newsystemFormData.ram2code = null;
        this.newsystemFormData.ram2 = '';
        this.newsystemFormDataforupdate.ram2 = '';
        this.newsystemFormData.ram3 = '';
        this.newsystemFormData.ram3code = null;
        this.newsystemFormDataforupdate.ram3 = '';
        this.newsystemFormData.ram4 = '';
        this.newsystemFormData.ram4code = null;
        this.newsystemFormDataforupdate.ram4 = '';
        this.newsystemFormData.hdd1 = '';
        this.newsystemFormDataforupdate.hdd1 = '';
        this.newsystemFormData.hdd1code = null;
        this.newsystemFormDataforupdate.hdd1code = null;
        this.newsystemFormData.hdd2code = null;
        this.newsystemFormDataforupdate.hdd2code = null;
        this.newsystemFormData.hdd2 = '';
        this.newsystemFormDataforupdate.hdd2 = '';
        this.newsystemFormData.graphiccard = '';
        this.newsystemFormData.graphiccardcode = null;
        this.newsystemFormDataforupdate.graphiccard = '';
        this.newsystemFormData.smps = '';
        this.newsystemFormData.smpscode = null;
        this.newsystemFormDataforupdate.smps = '';
        this.newsystemFormDataforupdate.smpscode = null;
        this.newsystemFormData.cabinet = '';
        this.newsystemFormDataforupdate.cabinet = '';
        this.newsystemFormData.cmos = '';
        this.newsystemFormDataforupdate.cmos = '';
        this.newsystemFormData.motherboard = '';
        this.newsystemFormDataforupdate.motherboard = '';
        this.newsystemFormData.description = '';
        this.newsystemFormDataforupdate.description = '';
        this.ngOnInit();

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
            // this.newsystemFormData.username = null;
            // this.newsystemFormData.cpucode = '';
            // this.newsystemFormData.ram1code = null;
            // this.newsystemFormData.ram2code = null;
            // this.newsystemFormData.ram3code = null;
            // this.newsystemFormData.ram4code = null;
            // this.newsystemFormData.smpscode = null;
            // this.newsystemFormData.graphiccardcode = null;
            // this.newsystemFormDataforupdate.username = null;
            // this.newsystemForm.patchValue({
            //   cpucode: '',
            //   processor: '',
            //   ram1: '',
            //   ram2: '',
            //   ram3: '',
            //   ram4: '',
            //   hdd1: '',
            //   hdd2: '',
            //   graphiccard: '',
            //   smps: '',
            //   cabinet: '',
            //   cmos: '',
            //   motherboard: '',
            //   description: '',
            // })
            // this.ngOnInit();

            // this.adminService.sendSelectedItem(null);

            this.getDataFromparams();
            // this.router.navigateByUrl('user/system-information-list');
          
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
    try {
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
    await this.getsystemUserid(event?.item_id);

    if (!this.isCpuValid) {
      this.newsystemForm.get('cpucode')?.setValue(''); // ✅ add this
      this.makecpucoodereadonly = false;
      return; // ❌ STOP — do not assign CPU
    }

    // this.makecpucoodereadonly = false;

    this.transferStockDataobj.ram1[0].transfer_to_system = event?.item_id;
    this.transferStockDataobj.ram2[0].transfer_to_system = event?.item_id;
    this.transferStockDataobj.ram3[0].transfer_to_system = event?.item_id;
    this.transferStockDataobj.ram4[0].transfer_to_system = event?.item_id;
    this.transferStockDataobj.smps[0].transfer_to_system = event?.item_id;
    this.transferStockDataobj.graphiccard[0].transfer_to_system = event?.item_id;


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


      this.newsystemFormData.ram1code = null;
      this.newsystemFormData.ram2code = null;
      this.newsystemFormData.ram3code = null;
      this.newsystemFormData.ram4code = null;
      this.newsystemFormData.hdd1code = null;
      this.newsystemFormData.hdd2code = null;
      this.newsystemFormData.graphiccardcode = null;
      this.newsystemFormData.smpscode = null;
    }
    // once cpu is selected making cpu code readonly
    // this.makecpucoodereadonly = true;

  }



  async getsystemUserid(item_id: any): Promise<void> {
    const itemId = { item_id };
    this.userorNot = null;
    this.isCpuValid = true;
    try {
      const results: any = await firstValueFrom(this.sharedServices.getsystemDatabyitemId(itemId));
      // const lengthofresults =+ results.length-1 ;
      console.log(results, "this.systemTransferData");
      this.systemTransferData = results[0]?.transfer_to_user;

      if (results && results[0]) {
        // this.newsystemFormData.username = + results[0]?.transfer_to;
        await this.isuserornot(+results[0]?.transfer_to_user);

        if (this.userorNot) {
          // console.log('user allowed')
          this.newsystemFormData.username = + results[0]?.transfer_to_user;
          return;
        }

        // console.log(' not a user')
        await Swal.fire({
          icon: 'question',
          html: 'This system is not assigned to any user!<br>Please assigned first and then add to the system information.',
        });

        this.isCpuValid = false;
        return;

      }

      this.newsystemFormDataforupdate.username = null;
      this.newsystemFormData.username = null;

      await Swal.fire({
        icon: 'question',
        html: 'This system is not assigned to any user!<br>Please assigned first and then add to the system information.',
      });
      this.isCpuValid = false;
      return;

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
    if (!ram1code) return;
    await this.getItemidwithitemcode(ram1code);

    const item_id = this.itemdatafromts[0]?.item_id;
    if (!item_id) return;

    // 🔁 DUPLICATE CHECK
    if (
      this.newsystemFormData.ram2code === ram1code ||
      this.newsystemFormData.ram3code === ram1code ||
      this.newsystemFormData.ram4code === ram1code
    ) {
      await Swal.fire({
        title: 'warning',
        text: 'Sorry same RAMs are not assgined to any system!',
        icon: 'warning'
      });

      const oldValue = this.backupoldItemsfromsysteminfo.ram1code || null;
      this.newsystemFormData.ram1code = oldValue;
      this.newsystemFormDataforupdate.ram1code = oldValue;
      return;
    }

    const canProceed = await this.checkalreadyAssignorNot(item_id);
    if (canProceed === AssignCheckResult.CANCELLED) {
      const oldValue = this.backupoldItemsfromsysteminfo['ram1code'] ?? null;
      this.newsystemFormData.ram1code = oldValue;
      this.newsystemFormDataforupdate.ram1code = oldValue;
      return;
    }

    this.transferStockDataobj.ram1[0].item_id = item_id;


    // 🔁 TRANSFER ARRAY
    const idx = this.transferStockDataobj.ram1.findIndex(i => i?.item_id === item_id);
    if (idx !== -1) {
      this.transferStockDataobj.ram1[idx].item_id = item_id;
    } else {
      this.transferStockDataobj.ram1.push({
        item_id,
        transfer_to_system: 0,
        location_id: 2,
        transfer_by: localStorage.getItem('login_id'),
        transfer_category: 1,
        transfer_to_user: null
      });
    }

    const oldItem = this.backupoldItemsfromsysteminfo.ram1code;
    if (oldItem && oldItem !== ram1code) {
      await this.replacementLogic(ram1code, oldItem, this.selectram1forassembled);
      return;
    }
    this.newsystemFormData.ram1code = ram1code;
    this.newsystemFormDataforupdate.ram1code = ram1code;
  }


  async selectram1forbrandedsystem(ram1code: any) {
    console.log(ram1code, "ram1code");
    if (!ram1code) return;
    await this.getItemidwithitemcode(ram1code);

    const item_id = this.itemdatafromts[0]?.item_id;
    if (!item_id) return;

    if ((this.newsystemFormData.ram2code !== '' && this.newsystemFormData.ram2code === ram1code) || (this.newsystemFormData.ram3code !== '' && this.newsystemFormData.ram3code === ram1code) || (this.newsystemFormData.ram4code !== '' && this.newsystemFormData.ram4code === ram1code)) {

      await Swal.fire({
        title: "warning",
        text: "Sorry same RAMs are not assgined to any system!",
        icon: "warning"
      });

      // ✅ RESTORE BACKUP (THIS IS THE FIX)
      const oldValue = this.backupoldItemsfromsysteminfo.ram1code || null;
      this.newsystemFormData.ram1code = oldValue;
      this.newsystemFormDataforupdate.ram1code = oldValue;
      return; // ⛔ STOP HERE
    }


    const assignResult = await this.checkalreadyAssignorNot(item_id);

    if (assignResult === AssignCheckResult.CANCELLED) {
      const oldValue = this.backupoldItemsfromsysteminfo['ram1code'] ?? null;
      this.newsystemFormData.ram1code = oldValue;
      this.newsystemFormDataforupdate.ram1code = oldValue;
      return;
    }
    this.transferStockDataobj.ram1[0].item_id = item_id;

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


    console.log(this.backupoldItemsfromsysteminfo.ram1code, "this.backupoldItemsfromsysteminfo.ram1code");

    const hasOldItem = this.backupoldItemsfromsysteminfo.ram1code && this.backupoldItemsfromsysteminfo.ram1code !== ram1code;

    if (assignResult === AssignCheckResult.REMOVED_NEEDS_LOCATION || hasOldItem) {
      await this.replacementLogic(ram1code, this.backupoldItemsfromsysteminfo.ram1code, this.selectram1forbrandedsystem);
      // console.log('We have to update this ram1',this.backupoldItemsfromsysteminfo.ram1code)
      return;

    }
    else {
      this.newsystemFormData.ram1code = ram1code;
      this.newsystemFormDataforupdate.ram1code = ram1code;
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
    if (!ram2code) return;
    await this.getItemidwithitemcode(ram2code);

    const item_id = this.itemdatafromts[0]?.item_id;
    if (!item_id) return;

    if (
      this.newsystemFormData.ram1code === ram2code ||
      this.newsystemFormData.ram3code === ram2code ||
      this.newsystemFormData.ram4code === ram2code
    ) {
      await Swal.fire({
        title: 'warning',
        text: 'Sorry same RAMs are not assgined to any system!',
        icon: 'warning'
      });

      const oldValue = this.backupoldItemsfromsysteminfo.ram2code || null;
      this.newsystemFormData.ram2code = oldValue;
      this.newsystemFormDataforupdate.ram2code = oldValue;
      return;
    }

    const canProceed = await this.checkalreadyAssignorNot(item_id);
    if (canProceed === AssignCheckResult.CANCELLED) {
      const oldValue = this.backupoldItemsfromsysteminfo['ram2code'] ?? null;
      this.newsystemFormData.ram2code = oldValue;
      this.newsystemFormDataforupdate.ram2code = oldValue;
      return;
    };

    this.transferStockDataobj.ram2[0].item_id = item_id;

    const idx = this.transferStockDataobj.ram2.findIndex(i => i?.item_id === item_id);
    if (idx !== -1) {
      this.transferStockDataobj.ram2[idx].item_id = item_id;
    } else {
      this.transferStockDataobj.ram2.push({
        item_id,
        transfer_to_system: 0,
        location_id: 2,
        transfer_by: localStorage.getItem('login_id'),
        transfer_category: 1,
        transfer_to_user: null
      });
    }

    const oldItem = this.backupoldItemsfromsysteminfo.ram2code;
    if (oldItem && oldItem !== ram2code) {
      await this.replacementLogic(ram2code, oldItem, this.selectram2forassembled);
      return;
    }
    this.newsystemFormData.ram2code = ram2code;
    this.newsystemFormDataforupdate.ram2code = ram2code;
  }


  async selectram2forbrandedsystem(ram2code: any) {
    if (!ram2code) return;
    await this.getItemidwithitemcode(ram2code);

    const item_id = this.itemdatafromts[0]?.item_id;
    if (!item_id) return;

    if (
      this.newsystemFormData.ram1code === ram2code ||
      this.newsystemFormData.ram3code === ram2code ||
      this.newsystemFormData.ram4code === ram2code
    ) {
      await Swal.fire({
        title: 'warning',
        text: 'Sorry same RAMs are not assgined to any system!',
        icon: 'warning'
      });

      const oldValue = this.backupoldItemsfromsysteminfo.ram2code || null;
      this.newsystemFormData.ram2code = oldValue;
      this.newsystemFormDataforupdate.ram2code = oldValue;
      return;
    }

    const assignResult = await this.checkalreadyAssignorNot(item_id);

    if (assignResult === AssignCheckResult.CANCELLED) {
      const oldValue = this.backupoldItemsfromsysteminfo['ram2code'] ?? null;
      this.newsystemFormData.ram2code = oldValue;
      this.newsystemFormDataforupdate.ram2code = oldValue;
      return;
    }
    this.transferStockDataobj.ram2[0].item_id = item_id;

    const idx = this.transferStockDataobj.ram2.findIndex(i => i?.item_id === item_id);
    if (idx !== -1) {
      this.transferStockDataobj.ram2[idx].item_id = item_id;
    } else {
      this.transferStockDataobj.ram2.push({
        item_id,
        transfer_to_system: 0,
        location_id: 2,
        transfer_by: localStorage.getItem('login_id'),
        transfer_category: 1,
        transfer_to_user: null
      });
    }


    const hasOldItem = this.backupoldItemsfromsysteminfo.ram2code && this.backupoldItemsfromsysteminfo.ram2code !== ram2code;

    if (assignResult === AssignCheckResult.REMOVED_NEEDS_LOCATION || hasOldItem) {
      await this.replacementLogic(ram2code, this.backupoldItemsfromsysteminfo.ram2code, this.selectram2forbrandedsystem);
      // console.log('We have to update this ram1',this.backupoldItemsfromsysteminfo.ram1code)
      return;

    }
    else {
      this.newsystemFormData.ram2code = ram2code;
      this.newsystemFormDataforupdate.ram2code = ram2code;
    }
  }


  async selectram3forassembled(ram3code: any) {
    if (!ram3code) return;
    await this.getItemidwithitemcode(ram3code);

    const item_id = this.itemdatafromts[0]?.item_id;
    if (!item_id) return;

    if (
      this.newsystemFormData.ram1code === ram3code ||
      this.newsystemFormData.ram2code === ram3code ||
      this.newsystemFormData.ram4code === ram3code
    ) {
      await Swal.fire({
        title: 'warning',
        text: 'Sorry same RAMs are not assgined to any system!',
        icon: 'warning'
      });

      const oldValue = this.backupoldItemsfromsysteminfo.ram3code || null;
      this.newsystemFormData.ram3code = oldValue;
      this.newsystemFormDataforupdate.ram3code = oldValue;
      return;
    }

    const canProceed = await this.checkalreadyAssignorNot(item_id);
    if (canProceed === AssignCheckResult.CANCELLED) {
      const oldValue = this.backupoldItemsfromsysteminfo['ram3code'] ?? null;
      this.newsystemFormData.ram3code = oldValue;
      this.newsystemFormDataforupdate.ram3code = oldValue;
      return;
    }
    this.transferStockDataobj.ram3[0].item_id = item_id;

    const idx = this.transferStockDataobj.ram3.findIndex(i => i?.item_id === item_id);
    if (idx !== -1) {
      this.transferStockDataobj.ram3[idx].item_id = item_id;
    } else {
      this.transferStockDataobj.ram3.push({
        item_id,
        transfer_to_system: 0,
        location_id: 2,
        transfer_by: localStorage.getItem('login_id'),
        transfer_category: 1,
        transfer_to_user: null
      });
    }

    const oldItem = this.backupoldItemsfromsysteminfo.ram3code;
    if (oldItem && oldItem !== ram3code) {
      await this.replacementLogic(ram3code, oldItem, this.selectram3forassembled);
      return;
    }
    this.newsystemFormData.ram3code = ram3code;
    this.newsystemFormDataforupdate.ram3code = ram3code;
  }

  async selectram3forbrandedsystem(ram3code: any) {
    if (!ram3code) return;
    await this.getItemidwithitemcode(ram3code);

    const item_id = this.itemdatafromts[0]?.item_id;
    if (!item_id) return;

    if (
      this.newsystemFormData.ram1code === ram3code ||
      this.newsystemFormData.ram2code === ram3code ||
      this.newsystemFormData.ram4code === ram3code
    ) {
      await Swal.fire({
        title: 'warning',
        text: 'Sorry same RAMs are not assgined to any system!',
        icon: 'warning'
      });

      const oldValue = this.backupoldItemsfromsysteminfo.ram3code || null;
      this.newsystemFormData.ram3code = oldValue;
      this.newsystemFormDataforupdate.ram3code = oldValue;
      return;
    }

    const assignResult = await this.checkalreadyAssignorNot(item_id);
    if (assignResult === AssignCheckResult.CANCELLED) {
      const oldValue = this.backupoldItemsfromsysteminfo['ram3code'] ?? null;
      this.newsystemFormData.ram3code = oldValue;
      this.newsystemFormDataforupdate.ram3code = oldValue;
      return;
    }
    this.transferStockDataobj.ram3[0].item_id = item_id;
    const idx = this.transferStockDataobj.ram3.findIndex(i => i?.item_id === item_id);
    if (idx !== -1) {
      this.transferStockDataobj.ram3[idx].item_id = item_id;
    } else {
      this.transferStockDataobj.ram3.push({
        item_id,
        transfer_to_system: 0,
        location_id: 2,
        transfer_by: localStorage.getItem('login_id'),
        transfer_category: 1,
        transfer_to_user: null
      });
    }

    const hasOldItem = this.backupoldItemsfromsysteminfo.ram3code && this.backupoldItemsfromsysteminfo.ram3code !== ram3code;

    if (assignResult === AssignCheckResult.REMOVED_NEEDS_LOCATION || hasOldItem) {
      await this.replacementLogic(ram3code, this.backupoldItemsfromsysteminfo.ram3code, this.selectram3forbrandedsystem);
      // console.log('We have to update this ram1',this.backupoldItemsfromsysteminfo.ram1code)
      return;

    }
    else {
      this.newsystemFormData.ram3code = ram3code;
      this.newsystemFormDataforupdate.ram3code = ram3code;
    }
  }


  async selectram4forassembled(ram4code: any) {
    if (!ram4code) return;
    await this.getItemidwithitemcode(ram4code);

    const item_id = this.itemdatafromts[0]?.item_id;
    if (!item_id) return;

    if (
      this.newsystemFormData.ram1code === ram4code ||
      this.newsystemFormData.ram2code === ram4code ||
      this.newsystemFormData.ram3code === ram4code
    ) {
      await Swal.fire({
        title: 'warning',
        text: 'Sorry same RAMs are not assgined to any system!',
        icon: 'warning'
      });

      const oldValue = this.backupoldItemsfromsysteminfo.ram4code || null;
      this.newsystemFormData.ram4code = oldValue;
      this.newsystemFormDataforupdate.ram4code = oldValue;
      return;
    }

    const canProceed = await this.checkalreadyAssignorNot(item_id);
    if (canProceed === AssignCheckResult.CANCELLED) {
      const oldValue = this.backupoldItemsfromsysteminfo['ram4code'] ?? null;
      this.newsystemFormData.ram4code = oldValue;
      this.newsystemFormDataforupdate.ram4code = oldValue;
      return;
    }
    this.transferStockDataobj.ram4[0].item_id = item_id;

    const idx = this.transferStockDataobj.ram4.findIndex(i => i?.item_id === item_id);
    if (idx !== -1) {
      this.transferStockDataobj.ram4[idx].item_id = item_id;
    } else {
      this.transferStockDataobj.ram4.push({
        item_id,
        transfer_to_system: 0,
        location_id: 2,
        transfer_by: localStorage.getItem('login_id'),
        transfer_category: 1,
        transfer_to_user: null
      });
    }

    const oldItem = this.backupoldItemsfromsysteminfo.ram4code;
    if (oldItem && oldItem !== ram4code) {
      await this.replacementLogic(ram4code, oldItem, this.selectram4forassembled);
      return;
    }

    this.newsystemFormData.ram4code = ram4code;
    this.newsystemFormDataforupdate.ram4code = ram4code;
  }


  async selectram4forbrandedsystem(ram4code: any) {
    if (!ram4code) return;
    await this.getItemidwithitemcode(ram4code);

    const item_id = this.itemdatafromts[0]?.item_id;
    if (!item_id) return;

    if (
      this.newsystemFormData.ram1code === ram4code ||
      this.newsystemFormData.ram2code === ram4code ||
      this.newsystemFormData.ram3code === ram4code
    ) {
      await Swal.fire({
        title: 'warning',
        text: 'Sorry same RAMs are not assgined to any system!',
        icon: 'warning'
      });

      const oldValue = this.backupoldItemsfromsysteminfo.ram4code || null;
      this.newsystemFormData.ram4code = oldValue;
      this.newsystemFormDataforupdate.ram4code = oldValue;
      return;
    }

    const assignResult = await this.checkalreadyAssignorNot(item_id);
    if (assignResult === AssignCheckResult.CANCELLED) {
      const oldValue = this.backupoldItemsfromsysteminfo['ram4code'] ?? null;
      this.newsystemFormData.ram4code = oldValue;
      this.newsystemFormDataforupdate.ram4code = oldValue;
      return;
    }
    this.transferStockDataobj.ram4[0].item_id = item_id;

    const idx = this.transferStockDataobj.ram4.findIndex(i => i?.item_id === item_id);
    if (idx !== -1) {
      this.transferStockDataobj.ram4[idx].item_id = item_id;
    } else {
      this.transferStockDataobj.ram4.push({
        item_id,
        transfer_to_system: 0,
        location_id: 2,
        transfer_by: localStorage.getItem('login_id'),
        transfer_category: 1,
        transfer_to_user: null
      });
    }

    const hasOldItem = this.backupoldItemsfromsysteminfo.ram4code && this.backupoldItemsfromsysteminfo.ram4code !== ram4code;

    if (assignResult === AssignCheckResult.REMOVED_NEEDS_LOCATION || hasOldItem) {
      await this.replacementLogic(ram4code, this.backupoldItemsfromsysteminfo.ram4code, this.selectram4forbrandedsystem);
      // console.log('We have to update this ram1',this.backupoldItemsfromsysteminfo.ram1code)
      return;

    }
    else {
      this.newsystemFormData.ram4code = ram4code;
      this.newsystemFormDataforupdate.ram4code = ram4code;
    }
  }


  async selecthdd1forassembled(hdd1code: any) {
    if (!hdd1code) return;

    await this.getItemidwithitemcode(hdd1code);
    const item_id = this.itemdatafromts[0]?.item_id;
    if (!item_id) return;

    const canProceed = await this.checkalreadyAssignorNot(item_id);
    if (canProceed === AssignCheckResult.CANCELLED) {
      const oldValue = this.backupoldItemsfromsysteminfo['hdd1code'] ?? null;
      this.newsystemFormData.hdd1code = oldValue;
      this.newsystemFormDataforupdate.hdd1code = oldValue;
      return;
    }

    this.transferStockDataobj.hdd1[0].item_id = item_id;

    const existingIndex = this.transferStockDataobj.hdd1.findIndex(i => i?.item_id === item_id);
    if (existingIndex !== -1) {
      this.transferStockDataobj.hdd1[existingIndex].item_id = item_id;
    } else {
      this.transferStockDataobj.hdd1.push({
        item_id,
        transfer_to_system: this.itemdataforotheritems[0]?.item_id,
        location_id: 2,
        transfer_by: localStorage.getItem('login_id'),
        transfer_category: 1,
        transfer_to_user: null
      });
    }

    const oldItem = this.backupoldItemsfromsysteminfo.hdd1code;
    if (oldItem && oldItem !== hdd1code) {
      await this.replacementLogic(hdd1code, oldItem, this.selecthdd1forassembled);
      return;
    }

    this.newsystemFormData.hdd1code = hdd1code;
    this.newsystemFormDataforupdate.hdd1code = hdd1code;
  }

  async selecthdd1forbrandedsystem(hdd1code: any) {
    if (!hdd1code) return;

    await this.getItemidwithitemcode(hdd1code);
    const item_id = this.itemdatafromts[0]?.item_id;
    if (!item_id) return;


    const assignResult = await this.checkalreadyAssignorNot(item_id);
    if (assignResult === AssignCheckResult.CANCELLED) {
      const oldValue = this.backupoldItemsfromsysteminfo['hdd1code'] ?? null;
      this.newsystemFormData.hdd1code = oldValue;
      this.newsystemFormDataforupdate.hdd1code = oldValue;
      return;
    }
    this.transferStockDataobj.hdd1[0].item_id = item_id;

    const existingIndex = this.transferStockDataobj.hdd1.findIndex(i => i?.item_id === item_id);
    if (existingIndex !== -1) {
      this.transferStockDataobj.hdd1[existingIndex].item_id = item_id;
    } else {
      this.transferStockDataobj.hdd1.push({
        item_id,
        transfer_to_system: this.itemdataforotheritems[0]?.item_id,
        location_id: 2,
        transfer_by: localStorage.getItem('login_id'),
        transfer_category: 1,
        transfer_to_user: null
      });
    }

    const hasOldItem = this.backupoldItemsfromsysteminfo.hdd1code && this.backupoldItemsfromsysteminfo.hdd1code !== hdd1code;

    if (assignResult === AssignCheckResult.REMOVED_NEEDS_LOCATION || hasOldItem) {
      await this.replacementLogic(hdd1code, this.backupoldItemsfromsysteminfo.hdd1code, this.selecthdd1forbrandedsystem);
      // console.log('We have to update this ram1',this.backupoldItemsfromsysteminfo.ram1code)
      return;

    }
    else {
      this.newsystemFormData.hdd1code = hdd1code;
      this.newsystemFormDataforupdate.hdd1code = hdd1code;
    }
  }

  async selecthdd2forassembled(hdd2code: any) {
    if (!hdd2code) return;

    await this.getItemidwithitemcode(hdd2code);
    const item_id = this.itemdatafromts[0]?.item_id;
    if (!item_id) return;


    const canProceed = await this.checkalreadyAssignorNot(item_id);
    if (canProceed === AssignCheckResult.CANCELLED) {
      const oldValue = this.backupoldItemsfromsysteminfo['hdd2code'] ?? null;
      this.newsystemFormData.hdd2code = oldValue;
      this.newsystemFormDataforupdate.hdd2code = oldValue;
      return;
    }
    this.transferStockDataobj.hdd2[0].item_id = item_id;

    const existingIndex = this.transferStockDataobj.hdd2.findIndex(i => i?.item_id === item_id);
    if (existingIndex !== -1) {
      this.transferStockDataobj.hdd2[existingIndex].item_id = item_id;
    } else {
      this.transferStockDataobj.hdd2.push({
        item_id,
        transfer_to_system: this.itemdataforotheritems[0]?.item_id,
        location_id: 2,
        transfer_by: localStorage.getItem('login_id'),
        transfer_category: 1,
        transfer_to_user: null
      });
    }

    const oldItem = this.backupoldItemsfromsysteminfo.hdd2code;
    if (oldItem && oldItem !== hdd2code) {
      await this.replacementLogic(hdd2code, oldItem, this.selecthdd2forassembled);
      return;
    }

    this.newsystemFormData.hdd2code = hdd2code;
    this.newsystemFormDataforupdate.hdd2code = hdd2code;
  }

  async selecthdd2forbrandedsystem(hdd2code: any) {
    if (!hdd2code) return;

    await this.getItemidwithitemcode(hdd2code);
    const item_id = this.itemdatafromts[0]?.item_id;
    if (!item_id) return;


    const assignResult = await this.checkalreadyAssignorNot(item_id);
    if (assignResult === AssignCheckResult.CANCELLED) {
      const oldValue = this.backupoldItemsfromsysteminfo['hdd2code'] ?? null;
      this.newsystemFormData.hdd2code = oldValue;
      this.newsystemFormDataforupdate.hdd2code = oldValue;
      return;
    }
    this.transferStockDataobj.hdd2[0].item_id = item_id;

    const existingIndex = this.transferStockDataobj.hdd2.findIndex(i => i?.item_id === item_id);
    if (existingIndex !== -1) {
      this.transferStockDataobj.hdd2[existingIndex].item_id = item_id;
    } else {
      this.transferStockDataobj.hdd2.push({
        item_id,
        transfer_to_system: this.itemdataforotheritems[0]?.item_id,
        location_id: 2,
        transfer_by: localStorage.getItem('login_id'),
        transfer_category: 1,
        transfer_to_user: null
      });
    }

    const hasOldItem = this.backupoldItemsfromsysteminfo.hdd2code && this.backupoldItemsfromsysteminfo.hdd2code !== hdd2code;

    if (assignResult === AssignCheckResult.REMOVED_NEEDS_LOCATION || hasOldItem) {
      await this.replacementLogic(hdd2code, this.backupoldItemsfromsysteminfo.hdd2code, this.selecthdd2forbrandedsystem);
      // console.log('We have to update this ram1',this.backupoldItemsfromsysteminfo.ram1code)
      return;

    }
    else {
      this.newsystemFormData.hdd2code = hdd2code;
      this.newsystemFormDataforupdate.hdd2code = hdd2code;
    }
  }


  async selectsmpsforassembled(smpscode: any) {
    if (!smpscode) return;

    await this.getItemidwithitemcode(smpscode);
    const item_id = this.itemdatafromts[0]?.item_id;
    if (!item_id) return;


    const canProceed = await this.checkalreadyAssignorNot(item_id);
    if (canProceed === AssignCheckResult.CANCELLED) {
      const oldValue = this.backupoldItemsfromsysteminfo['smpscode'] ?? null;
      this.newsystemFormData.smpscode = oldValue;
      this.newsystemFormDataforupdate.smpscode = oldValue;
      return;
    }
    this.transferStockDataobj.smps[0].item_id = item_id;

    const existingIndex = this.transferStockDataobj.smps.findIndex(i => i?.item_id === item_id);
    if (existingIndex !== -1) {
      this.transferStockDataobj.smps[existingIndex].item_id = item_id;
    } else {
      const cpucode =
        this.newsystemFormDataforupdate.cpucode || this.newsystemFormData.cpucode;

      await this.getItemidwithitemcodeforotheritems(cpucode);

      this.transferStockDataobj.smps.push({
        item_id,
        transfer_to_system: this.itemdataforotheritems[0]?.item_id,
        location_id: 2,
        transfer_by: localStorage.getItem('login_id'),
        transfer_category: 1,
        transfer_to_user: null
      });
    }

    const oldItem = this.backupoldItemsfromsysteminfo.smpscode;
    if (oldItem && oldItem !== smpscode) {
      await this.replacementLogic(smpscode, oldItem, this.selectsmpsforassembled);
      return;
    }

    this.newsystemFormData.smpscode = smpscode;
    this.newsystemFormDataforupdate.smpscode = smpscode;
  }

  async selectsmpsforbrandedsystem(smpscode: any) {
    if (!smpscode) return;

    await this.getItemidwithitemcode(smpscode);
    const item_id = this.itemdatafromts[0]?.item_id;
    if (!item_id) return;


    const assignResult = await this.checkalreadyAssignorNot(item_id);
    if (assignResult === AssignCheckResult.CANCELLED) {
      const oldValue = this.backupoldItemsfromsysteminfo['smpscode'] ?? null;
      this.newsystemFormData.smpscode = oldValue;
      this.newsystemFormDataforupdate.smpscode = oldValue;
      return;
    }
    this.transferStockDataobj.smps[0].item_id = item_id;

    const existingIndex = this.transferStockDataobj.smps.findIndex(i => i?.item_id === item_id);
    if (existingIndex !== -1) {
      this.transferStockDataobj.smps[existingIndex].item_id = item_id;
    } else {
      const cpucode =
        this.newsystemFormDataforupdate.cpucode || this.newsystemFormData.cpucode;

      await this.getItemidwithitemcodeforotheritems(cpucode);

      this.transferStockDataobj.smps.push({
        item_id,
        transfer_to_system: this.itemdataforotheritems[0]?.item_id,
        location_id: 2,
        transfer_by: localStorage.getItem('login_id'),
        transfer_category: 1,
        transfer_to_user: null
      });
    }

    const hasOldItem = this.backupoldItemsfromsysteminfo.smpscode && this.backupoldItemsfromsysteminfo.smpscode !== smpscode;

    if (assignResult === AssignCheckResult.REMOVED_NEEDS_LOCATION || hasOldItem) {
      await this.replacementLogic(smpscode, this.backupoldItemsfromsysteminfo.smpscode, this.selectsmpsforbrandedsystem);
      // console.log('We have to update this ram1',this.backupoldItemsfromsysteminfo.ram1code)
      return;

    }
    else {
      this.newsystemFormData.smpscode = smpscode;
      this.newsystemFormDataforupdate.smpscode = smpscode;
    }
  }


  async selectgraphiccardcodeforassembled(graphiccardcode: any) {
    if (!graphiccardcode) return;

    await this.getItemidwithitemcode(graphiccardcode);
    const item_id = this.itemdatafromts[0]?.item_id;
    if (!item_id) return;


    const canProceed = await this.checkalreadyAssignorNot(item_id);
    if (canProceed === AssignCheckResult.CANCELLED) {
      const oldValue = this.backupoldItemsfromsysteminfo['graphiccardcode'] ?? null;
      this.newsystemFormData.graphiccardcode = oldValue;
      this.newsystemFormDataforupdate.graphiccardcode = oldValue;
      return;
    }
    this.transferStockDataobj.graphiccard[0].item_id = item_id;

    const existingIndex = this.transferStockDataobj.graphiccard.findIndex(i => i?.item_id === item_id);
    if (existingIndex !== -1) {
      this.transferStockDataobj.graphiccard[existingIndex].item_id = item_id;
    } else {
      const cpucode =
        this.newsystemFormDataforupdate.cpucode || this.newsystemFormData.cpucode;

      await this.getItemidwithitemcodeforotheritems(cpucode);

      this.transferStockDataobj.graphiccard.push({
        item_id,
        transfer_to_system: this.itemdataforotheritems[0]?.item_id,
        location_id: 2,
        transfer_by: localStorage.getItem('login_id'),
        transfer_category: 1,
        transfer_to_user: null
      });
    }

    const oldItem = this.backupoldItemsfromsysteminfo.graphiccardcode;
    if (oldItem && oldItem !== graphiccardcode) {
      await this.replacementLogic(
        graphiccardcode,
        oldItem,
        this.selectgraphiccardcodeforassembled
      );
      return;
    }

    this.newsystemFormData.graphiccardcode = graphiccardcode;
    this.newsystemFormDataforupdate.graphiccardcode = graphiccardcode;
  }

  async selectgraphiccardcodeforbrandedsystem(graphiccardcode: any) {
    if (!graphiccardcode) return;

    await this.getItemidwithitemcode(graphiccardcode);
    const item_id = this.itemdatafromts[0]?.item_id;
    if (!item_id) return;


    const assignResult = await this.checkalreadyAssignorNot(item_id);
    if (assignResult === AssignCheckResult.CANCELLED) {
      const oldValue = this.backupoldItemsfromsysteminfo['graphiccardcode'] ?? null;
      this.newsystemFormData.graphiccardcode = oldValue;
      this.newsystemFormDataforupdate.graphiccardcode = oldValue;
      return;
    }
    this.transferStockDataobj.graphiccard[0].item_id = item_id;

    const existingIndex = this.transferStockDataobj.graphiccard.findIndex(i => i?.item_id === item_id);
    if (existingIndex !== -1) {
      this.transferStockDataobj.graphiccard[existingIndex].item_id = item_id;
    } else {
      const cpucode =
        this.newsystemFormDataforupdate.cpucode || this.newsystemFormData.cpucode;

      await this.getItemidwithitemcodeforotheritems(cpucode);

      this.transferStockDataobj.graphiccard.push({
        item_id,
        transfer_to_system: this.itemdataforotheritems[0]?.item_id,
        location_id: 2,
        transfer_by: localStorage.getItem('login_id'),
        transfer_category: 1,
        transfer_to_user: null
      });
    }


    const hasOldItem = this.backupoldItemsfromsysteminfo.graphiccardcode && this.backupoldItemsfromsysteminfo.graphiccardcode !== graphiccardcode;

    if (assignResult === AssignCheckResult.REMOVED_NEEDS_LOCATION || hasOldItem) {
      await this.replacementLogic(graphiccardcode, this.backupoldItemsfromsysteminfo.graphiccardcode, this.selectgraphiccardcodeforbrandedsystem);
      // console.log('We have to update this ram1',this.backupoldItemsfromsysteminfo.ram1code)
      return;

    }
    else {
      this.newsystemFormData.graphiccardcode = graphiccardcode;
      this.newsystemFormDataforupdate.graphiccardcode = graphiccardcode;
    }
  }


  async getItemidwithitemcode(item_code: any) {
    this.itemdatafromts = await firstValueFrom(this.sharedServices.getitemdatafromitemcode({ item_code }));
  }


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


  //  refactor code at 29-12-2025
  async replacementLogic(newitem: any, replacement: any, calledfunction: Function) {
    if (this.isReplacementInProgress) {
      return;
    }
    if (!replacement || !newitem) {
      console.log('Replacement and newitem is not found');
      return;
    }

    this.isReplacementInProgress = true;

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
    this.isReplacementInProgress = true;
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
          1: "Main Warehouse: Stored at 3/311 Office",
          7: "Scrapped: Stored at 3/311 Office",
          8: "Scrapped: Stored at 5/506 Office",
        },
        inputValidator: (value: string) =>
          !value ? "You need to choose something!" : '',

        didOpen: () => {
          const radioContainer = Swal.getPopup()?.querySelector('.swal2-radio') as HTMLElement;

          if (radioContainer) {
            radioContainer.style.display = 'flex';
            radioContainer.style.flexDirection = 'column';
            radioContainer.style.alignItems = 'flex-start';

            const labels = radioContainer.querySelectorAll('label');
            labels.forEach((label: any) => {
              label.style.display = 'flex';
              label.style.alignItems = 'flex-start';
              label.style.gap = '10px';
              label.style.margin = '8px 0';
              label.style.whiteSpace = 'normal';
              label.style.textAlign = 'left';
              label.style.lineHeight = '1.4';
            });

            const inputs = radioContainer.querySelectorAll('input');
            inputs.forEach((input: any) => {
              input.style.marginTop = '3px';
            });
          }
        }
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

    finally {
      // ✅ THIS IS THE FIX
      this.isReplacementInProgress = false;
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

      this.newsystemFormDataforupdate[source] = null;

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
                  this.backupoldItemsfromsysteminfo[source] = null;

                  //if deleted then remove from source & control
                  this.newsystemFormDataforupdate[source] = null;

                }
                catch (err) {
                  console.error(err, "Error at deleteitemsfromItemsandSysteminfo");
                }
              }
              else {
                const columnName = source;
                this.isRestoringFromClear = true;

                setTimeout(() => {
                  this.newsystemFormData[columnName] = itemCode.item_code;
                  this.newsystemFormDataforupdate[columnName] = itemCode.item_code;

                  this.isRestoringFromClear = false;
                });


                // if (source) {
                //   this.newsystemFormData[columnName] = itemCode.item_code;
                // }
              }
            })
          }
          else {
            //not delete is purchased item
            const columnName = source;
            await Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Sorry, deletion is not possible!',
            });

            this.isRestoringFromClear = true;
            // restore AFTER ng-select finishes clearing
            setTimeout(() => {
              this.newsystemFormData[columnName] = itemCode.item_code;
              this.newsystemFormDataforupdate[columnName] = itemCode.item_code;

              this.isRestoringFromClear = false;
            });

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

  navigateBack() {
    let variable = localStorage.getItem('backUrl');
    this.router.navigateByUrl(`${variable}`);
    localStorage.removeItem('backUrl');
  }


  async checkalreadyAssignorNot(data: any): Promise<AssignCheckResult> {
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
      if (!result.isConfirmed) {
        // console.log("User cancelled the removal.");
        await this.previousDatafromsubjectBehaviour();
        return AssignCheckResult.CANCELLED;
      }

      // console.log("User confirmed removal of the item.");
      // ✅ USER CONFIRMED REMOVAL
      this.dataforsysteminfowhenscrapped.item_code = itemCode;
      await this.updatesysteminfoforsrapitem();

      return AssignCheckResult.REMOVED_NEEDS_LOCATION;

    }

    return AssignCheckResult.OK;
  }



  async updatesysteminfoforsrapitem() {
    console.log("updatesysteminfoforsrapitem()");
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
  }

  validationradiobtn() {
    this.systemradioBtn = new FormGroup({
      systemType: new FormControl('Branded Computer')
    })

    this.newsystemForm = new FormGroup({
      cpucode: new FormControl('', [Validators.required]),
      username: new FormControl(null),
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


}
