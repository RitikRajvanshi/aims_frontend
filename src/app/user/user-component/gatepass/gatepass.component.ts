import { Component } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import * as moment from 'moment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gatepass',
  templateUrl: './gatepass.component.html',
  styleUrls: ['./gatepass.component.scss']
})
export class GatepassComponent {
  isReturnable: any;

  gatepassobj = {
    gatepass_id: 0,
    is_returnable: 1,
    issued_to: '',
    issued_by: localStorage.getItem('name'),
    in_date: '',
    out_date: '',
    received_by: '',

    item_code: '',
    item_name: '',
    description: '',
    quantity: 1,
    remarks: '',
    status: 1,
    party_name:'',
    gatepass_approval_date:''
  }

  lastdatafromgatepassid: any[] = [];
  current_date: any;
  gatepassForm: any;

  // Track validation status for each input field
  isIssuedToValid = true;
  isIssuedByValid = true;
  isOutDateValid = true;
  isInDateValid = true;
  isItemcodeValid = true;
  isItemnameValid = true;
  isdescriptionValid = true;
  isquantityValid = true;
  isremarkseValid = true;
  ispartynameValid = true;


  issuedToTouched: boolean = false;
  issuedByTouched: boolean = false;
  outDateTouched: boolean = false;
  inDateTouched: boolean = false;
  itemCodeTouched: boolean = false;
  itemnameTouched: boolean = false;
  partynameTouched: boolean = false;
  descriptionTouched: boolean = false;
  quantityTouched: boolean = false;
  remarksTouched: boolean = false;
  gatepassdata: any[] = [];
  displaygatepassdata: boolean = false;
  disableissuedtoandby: boolean = false;

  ngOnInit() {
    this.getlastitemfromgatepass();
    // this.validation();
  }


  constructor(private sharedServices: SharedService, private adminService: AdminService, private router: Router) {
    this.current_date = moment().format('YYYY-MM-DD');
    // this.gatepassobj.out_date = this.current_date;
    console.log(this.gatepassobj.out_date);
  }

  async getlastitemfromgatepass() {
    const results: any = await this.sharedServices.getlastrowfromgatepassid().toPromise();
    if (!results || results.length == 0) {
      console.log(results, "getlastrowfromgatepassid")
      this.gatepassobj.gatepass_id = 1;
    }
    else {
      this.lastdatafromgatepassid = results;
      const updatedgatepassid = +results[0]?.gatepass_id + 1;
      this.gatepassobj.gatepass_id = updatedgatepassid;
    }
  }

  onReturnableChange(data: any) {
       // Trigger validation
       this.issuedToTouched = false;
       this.issuedByTouched = false;
       this.outDateTouched = false;
       this.itemCodeTouched = false;
       this.itemnameTouched = false;
       this.descriptionTouched = false;
       this.quantityTouched = false;
       this.remarksTouched = false;
       this.partynameTouched = false;
    const isreturablevalue = data.target.value;
    this.gatepassobj.is_returnable = + isreturablevalue;
    this.gatepassobj.in_date = '';
  }

  validateForm() {
    // Implement custom validation logic
    // Example: Check if input fields are empty
    this.isIssuedToValid = !!this.gatepassobj.issued_to;
    this.isIssuedByValid = !!this.gatepassobj.issued_by;
    this.isOutDateValid = !!this.gatepassobj.out_date;
    this.isItemcodeValid = !!this.gatepassobj.item_code;
    this.isdescriptionValid = !!this.gatepassobj.description;
    this.isquantityValid = !!this.gatepassobj.quantity;
    this.isremarkseValid = !!this.gatepassobj.remarks;
    this.isItemnameValid = !!this.gatepassobj.item_name;
    this.ispartynameValid = !!this.gatepassobj.party_name;

    // Return overall form validity
    return (
      this.isIssuedToValid &&
      this.isIssuedByValid &&
      this.isOutDateValid &&
      this.isItemcodeValid &&
      this.isItemnameValid &&
      this.isdescriptionValid &&
      this.isquantityValid &&
      this.isremarkseValid &&
      this.ispartynameValid
    );
  }

  async onSave() {
    try {
      // Trigger validation
      this.issuedToTouched = true;
      this.issuedByTouched = true;
      this.outDateTouched = true;
      this.itemCodeTouched = true;
      this.itemnameTouched = true;
      this.descriptionTouched = true;
      this.quantityTouched = true;
      this.remarksTouched = true;
      this.partynameTouched = true;
      // Check if the form is valid
      if (this.validateForm()) {
        
        if(this.gatepassobj.in_date && (this.gatepassobj.out_date > this.gatepassobj.in_date)){
          Swal.fire({
            title: "warning!",
            text: "In date should be later than out date!",
            icon: "warning",
            color:'red',
        }).then(()=>{
          this.gatepassobj.in_date = '';
        })
        }
        else{
   // Form is valid, perform the save operation
        // For now, let's just log the form data
        console.log(this.gatepassobj, "gatepassobj");
        const results: any = await this.adminService.savegatepass(this.gatepassobj).toPromise();
        if (results?.length == 0) {
          console.log("No Results Found");
        }
        else {
          console.log('Form data:', this.gatepassobj);
          await Swal.fire({
            title: 'Success!',
            text: 'Gate Pass generated successfully!',
            icon: 'success',
          });
          this.disableissuedtoandby = true;
          this.gatepassobj.item_code = '';
          this.gatepassobj.item_name = '';
          this.gatepassobj.party_name = '';
          this.gatepassobj.in_date = '';
          this.gatepassobj.description = '';
          this.gatepassobj.quantity = 1;
          this.gatepassobj.remarks = '';
          this.displaygatepassdata = true;
          this.issuedToTouched = false;
          this.issuedByTouched = false;
          this.outDateTouched = false;
          this.itemCodeTouched = false;
          this.itemnameTouched = false;
          this.descriptionTouched = false;
          this.quantityTouched = false;
          this.remarksTouched = false;
          this.partynameTouched = false;

          this.getGatepassdata(this.gatepassobj.gatepass_id);
        }
        }
     
      } else {
        // Form is invalid, do something (e.g., show error messages)
        console.log('Form is invalid');
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

  }

  getGatepassdata(id: any) {
    const gatePassid = {
      gatepass_id: +id
    };

    this.sharedServices.getgatepassdatabyid(gatePassid).subscribe({
      next: (results: any) => {
        console.log(results);
        this.gatepassdata = results.map((e:any)=>{
             const filteredoutDate = e.out_date?moment(e.out_date).format('DD-MM-YYYY'):null;
             const filteredinDate = e.in_date?moment(e.in_date).format('DD-MM-YYYY'):null;
          return {
            ...e, in_date:filteredinDate, out_date:filteredoutDate
          };
        })
      },
      error: (error) => {
        console.error(error);
      }
    })

  }

  reload() {
    // location.reload()
    this.gatepassobj = {
      gatepass_id: 0,
      is_returnable: 1,
      issued_to: '',
      issued_by: localStorage.getItem('name'),
      in_date: '',
      out_date: '',
      received_by: '',

      item_code: '',
      item_name: '',
      description: '',
      quantity: 1,
      remarks: '',
      status: 1,
      party_name:'',
      gatepass_approval_date:''
    }

    this.getlastitemfromgatepass();
    this.issuedToTouched = false;
    this.issuedByTouched = false;
    this.outDateTouched = false;
    this.itemnameTouched = false;
    this.itemCodeTouched = false;
    this.descriptionTouched = false;
    this.quantityTouched = false;
    this.remarksTouched = false;
    this.displaygatepassdata = false;
    this.partynameTouched = false;
    this.disableissuedtoandby = false;
  }

  NoSpaceallowedatstart(event:any){
    if(event.target.selectionStart === 0 && event.code ==="Space")
    {
      event.preventDefault();
    }
  
  }


  // validation(){
  //   this.gatepassForm = new FormGroup({
  //     issued_to:new FormControl('',[Validators.required]),
  //     issued_by:new FormControl(localStorage.getItem('name'),[Validators.required]),
  //     in_date:new FormControl('',[Validators.required]),
  //     out_date:new FormControl(this.current_date,[Validators.required]),
  //     received_by:new FormControl('',[Validators.required]),
  //     item_code:new FormControl('',[Validators.required]),
  //     description:new FormControl('',[Validators.required]),
  //     quantity:new FormControl(0,[Validators.required]),
  //     remarks:new FormControl('',[Validators.required]),
  //   })
  // }
}
