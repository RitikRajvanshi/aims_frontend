import { Component, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { SharedService } from 'src/app/services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-update-vendor',
  templateUrl: './update-vendor.component.html',
  styleUrls: ['./update-vendor.component.scss']
})
export class UpdateVendorComponent {
  getsupplierdata:any;
  supplieridfromparams:any;
  updatesupplierForm:any;
  response: any;


  supplierdata:any = {
    'supplier_name': '',
    'contact_person':'',
    'rating': '',
    'address': '',
    'phone': '',
    'mobile': '',
    'email': '',
    'status': '1',
    'created_by': localStorage.getItem('login_id'),
    'category': '',
    'supplier_id':0,
    'gstn':'',
    'pan_no':null
  }

  supplierid = {
    supplier_id:0
  }
  searchTerm:any;
  tableSize:any;
  page:any;

  constructor(private adminservice: AdminService, private sharedService:SharedService, private route:ActivatedRoute, private router:Router, private el: ElementRef) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['searchTerm'] || '';
      this.page = +params['page'] || 1;
      this.tableSize = +params['tableSize']|| null ;
    });
    this.validation();
    
    Swal.fire({
      title: 'Loading...',
      didOpen: () => {
        Swal.showLoading();
        setTimeout(() => { 
          Swal.close()
        }, 500);
      }
    }).then(()=>{
      this.getVendorsdatafromParams();
    })
  }


  getVendorsdatafromParams(){
    this.route.params.subscribe({
      next:(params:any)=>{
      
      this.supplieridfromparams = +params['id'];
      },
    error:(error)=>{
      if (error.status == 403) {            
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Token expired.',
          footer: '<a href="../login">Please login again!</a>'
        }).then(()=>{
          this.router.navigate(['../login']);
        })
      }
      else {
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Internal server error.Please try after some time!',
          footer:'<a href="../login">Login</a>'
        }).then(()=>{
          location.reload();
        })
      }
    }})
  
      this.supplierid.supplier_id = this.supplieridfromparams
     this.getsupplierdatabyid(this.supplierid);
  }

  
  getsupplierdatabyid(id:any){
    console.log(id.supplier_id, "this.getsupplierdata");
    this.sharedService.getsupplierdatabyid(id).subscribe(
      {
        next:(results:any)=>{
      this.getsupplierdata = JSON.parse(JSON.stringify(results))[0];
      console.log(this.getsupplierdata, "this.getsupplierdata");
      this.supplierdata.supplier_name = this.getsupplierdata.supplier_name; 
      this.supplierdata.contact_person = this.getsupplierdata.contact_person;
      this.supplierdata.rating = this.getsupplierdata.rating;
      this.supplierdata.address = this.getsupplierdata.address;
      this.supplierdata.phone = this.getsupplierdata.phone;
      this.supplierdata.mobile = this.getsupplierdata.mobile;
      this.supplierdata.email = this.getsupplierdata.email;
      this.supplierdata.category = this.getsupplierdata.category;
      this.supplierdata.supplier_id = id.supplier_id;
      this.supplierdata.gstn = this.getsupplierdata.gstn;
      this.supplierdata.pan_no = this.getsupplierdata.pan_no;
      this.getsupplierdata.status != 1?this.updatesupplierForm.get('rating')?.disable():'';

    },
  error:(error)=>{
    if (error.status == 403) {            
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: 'Token expired.',
        footer: '<a href="../login">Please login again!</a>'
      }).then(()=>{
        this.router.navigate(['../login']);
      })
    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: 'Internal server error.Please try after some time!',
        footer:'<a href="../login">Login</a>'
      }).then(()=>{
        location.reload();
      })
    }
  }})

  }

  updateSupplier(){
    const currentDate = moment().format('YYYY-MM-DD');

    this.supplierdata.modified_date = currentDate;

    if(this.updatesupplierForm.invalid)
    {
      this.updatesupplierForm.controls['supplier_name'].markAsTouched();
      this.updatesupplierForm.controls['contact_person'].markAsTouched();
      this.updatesupplierForm.controls['address'].markAsTouched();
      this.updatesupplierForm.controls['mobile'].markAsTouched();
      this.updatesupplierForm.controls['phone'].markAsTouched();
      this.updatesupplierForm.controls['email'].markAsTouched();
      this.updatesupplierForm.controls['category'].markAsTouched();  
    }
    else
    {
     
    this.adminservice.updateSupplierservice(this.supplierdata).subscribe(
      {
      next:(results:any)=>{
      // console.log(results,"this.response");
      this.response = results?.update_supplier;

      if (this.response !== '1') {
        Swal.fire({
          title: 'Success!',
          html: 'Vendor updated successfully!<br><br> <p class="font-italic text-danger">Redirect to vendor list page ...<p>',
          icon: 'success',
        }).then(()=>{
            this.router.navigateByUrl('user/vendor-list');
      })
    }
    else{
        this.focusEmailInput();
        Swal.fire({
          icon: 'warning',
          title: 'Warning',
          text: 'This email id is already registered!',
        })

      }
        
    },
  error:(error)=>{
    if (error.status == 403) {            
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: 'Token expired.',
        footer: '<a href="../login">Please login again!</a>'
      }).then(()=>{
        this.router.navigate(['../login']);
      })
    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: 'Internal server error.Please try after some time!',
        footer:'<a href="../login">Login</a>'
      }).then(()=>{
        location.reload();
      })
    }
  }
  })
}
  }

  focusEmailInput() {
    const emailInput = this.el.nativeElement.querySelector('#email'); // Replace 'email' with the actual ID or selector of your email input
    emailInput.focus();

  }

  navigateBack() {
    let variable = localStorage.getItem('backUrl');
    localStorage.removeItem('backUrl');
    if(localStorage.getItem('backUrl')==null){
      this.router.navigateByUrl(`${variable}`);
    }
  }


  NoSpaceallowedatstart(event:any){
    if(event.target.selectionStart === 0 && event.code ==="Space")
    {
      event.preventDefault();
    }
  
  }

  tendigitnumber(event:any){
    const input = event.target;
    const maxLength = 13; // Set your desired max length here

    if (input.value.length >= maxLength) {
      event.preventDefault();
    }
  }
  
  validation() {
    const emailPattern = '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,64}';
    const CellphonePattern = "^[0-9-+]{10,}$";
    this.updatesupplierForm = new FormGroup(
      {
        supplier_name: new FormControl(null, [Validators.required]),
        contact_person: new FormControl(null, [Validators.required]),
        rating: new FormControl(null, [Validators.required]),
        address: new FormControl(null, [Validators.required]),
        phone: new FormControl(null,[Validators.pattern(CellphonePattern)]),
        mobile: new FormControl(null, [Validators.required, Validators.pattern(CellphonePattern)]),
        email: new FormControl(null, [Validators.required, Validators.email, Validators.pattern(emailPattern)]),
        category: new FormControl(null, [Validators.required]),
        gstn: new FormControl(null),
        pan_no: new FormControl(null)
      }
    
    )
  } 
}
