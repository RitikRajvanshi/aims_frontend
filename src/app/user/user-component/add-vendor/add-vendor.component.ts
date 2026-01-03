import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-vendor',
  templateUrl: './add-vendor.component.html',
  styleUrls: ['./add-vendor.component.scss']
})
export class AddVendorComponent {

  addSupplierForm: any;
  response: any;
  categoryValue: any;

  supplierdata = {
    'supplier_name': '',
    'contact_person': '',
    'rating': '',
    'address': '',
    'phone': '',
    'mobile': '',
    'email': '',
    'status': '1',
    'created_by': localStorage.getItem('login_id'),
    'category': '',
    'gstn': '',
    'pan_no': null
  }


  constructor(private adminserive: AdminService, private router: Router, private renderer: Renderer2, private el: ElementRef) { }


  ngOnInit(): void {

    this.validation();
  }


  addnewSupplier() {
    this.addSupplierForm.get('supplier_name').value;
    if (this.addSupplierForm.invalid) {
      this.addSupplierForm.controls['supplier_name'].markAsTouched();
      this.addSupplierForm.controls['contact_person'].markAsTouched();
      this.addSupplierForm.controls['rating'].markAsTouched();
      this.addSupplierForm.controls['address'].markAsTouched();
      this.addSupplierForm.controls['mobile'].markAsTouched();
      this.addSupplierForm.controls['phone'].markAsTouched();
      this.addSupplierForm.controls['email'].markAsTouched();
      this.addSupplierForm.controls['category'].markAsTouched();
    }
    else {
      this.adminserive.addSupplierservice(this.supplierdata).subscribe(
        {
          next: (results: any) => {

            this.response = JSON.parse(JSON.stringify(results));
            console.log(results, "Add Supplier");

            //firstcheck email is registered or not according to it, addsupplier.

            if (this.response && this.response.length > 0) {
              Swal.fire({
                title: 'Success!',
                text: 'Vendor has been initiated successfully!',
                icon: 'success',
              }).then(() => {
                this.supplierdata.rating = 'null';
                this.supplierdata.category = 'null';
                this.ngOnInit();
              })

            }

            else {
              this.focusEmailInput();
              Swal.fire({
                icon: 'warning',
                title: 'Warning',
                text: 'This email id is already registered!',
              })

            }
          },
          error: (error) => {
            console.log(error, "error");
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
            else if (error.status == 400) {
              Swal.fire({
                icon: 'warning',
                title: 'Warning',
                text: 'This email id is already registered!',
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

  focusEmailInput() {
    const emailInput = this.el.nativeElement.querySelector('#email'); // Replace 'email' with the actual ID or selector of your email input
    emailInput.focus();
  }

  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }

  }

  tendigitnumber(event: any) {
    const input = event.target;
    const maxLength = 13; // Set your desired max length here

    if (input.value.length >= maxLength) {
      event.preventDefault();
    }
  }

  // tendigitnumber(event: any) {
  //   const input = event.target;
  //   const maxLength = 10; // Set your desired max length here

  //   // Define the regular expression pattern for validation
  //   const customPattern = /\A(?=\d+-?\d+\z)([\d-]{11}|\d{10})(?<!\d{11})\z/;

  //   // Remove all characters except digits and hyphen
  //   // const cleanedValue = input.value.replace(/[^\d-]/g, '');

  //   // Check if the cleaned value matches the custom pattern
  //   if (!customPattern.test(input.value)) {
  //     event.preventDefault();
  //     return;
  //   }

  //   if (input.value.length >= maxLength) {
  //     event.preventDefault();
  //   }
  // }


  validation() {
    const emailPattern = '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,64}';
    const CellphonePattern = "^[0-9-+]{10,}$";
    this.addSupplierForm = new FormGroup(
      {

        supplier_name: new FormControl(null, [Validators.required]),
        contact_person: new FormControl(null, [Validators.required]),
        rating: new FormControl(null, [Validators.required]),
        address: new FormControl(null, [Validators.required]),
        phone: new FormControl(null, [Validators.pattern(CellphonePattern)]),
        mobile: new FormControl(null, [Validators.required, Validators.pattern(CellphonePattern)]),
        email: new FormControl(null, [Validators.required, Validators.email, Validators.pattern(emailPattern)]),
        category: new FormControl(null, [Validators.required]),
        gstn: new FormControl(null),
        pan_no: new FormControl(null)
      }

    )
  }
}
