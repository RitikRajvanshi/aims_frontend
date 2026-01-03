import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { FilesService } from 'src/app/services/files.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-company-registration',
  templateUrl: './company-registration.component.html',
  styleUrls: ['./company-registration.component.scss']
})
export class CompanyRegistrationComponent {
  companyregistrationForm: any;
  files: any;
  files2: any;
  uplaodfileandgetData: any;

  companyData = {
    'company_logo': '',
    'company_logo2': '',
    'company_name': '',
    'nick_name': '',
    'address': '',
    'telephone_no': null,
    'mobile1': null,
    'mobile2': null,
    'registered_email': '',
    'status': '1',
    'created_by': localStorage.getItem('login_id'),
    'gstin': ''
  }

  logoname: any = {
    company_logo: ''
  }

  logoname2: any = {
    company_logo2: ''
  }
  constructor(private adminserive: AdminService, public fileServie: FilesService, private router: Router) { }

  ngOnInit(): void {

    this.validation();

  }


  selectedLogo(event: any) {
    // console.log(event.target.files, "files")
    if (event.target.files.length > 0) {

      const file = event.target.files[0];
      const fileSizeInKB = file.size / 1024; // Get file size in KB
      
     if(fileSizeInKB <= 1600 && (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg')){
      console.log('correct type');
      this.files = file;

      this.companyData.company_logo = this.files.name;
     }
     else if(!(file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg')){
      this.companyregistrationForm.get('company_logo').markAsTouched();
        this.companyregistrationForm.controls["company_logo"].reset();
       Swal.fire({
         title: 'Warning!',
         text: 'Filetype is invalid.Only png, jpg and jpeg is allowed!',
         icon: 'warning',
       });
     }
     else{
       // File size exceeds the limit, show an error message
       this.companyregistrationForm.get('company_logo').markAsTouched();
        this.companyregistrationForm.controls["company_logo"].reset();
       Swal.fire({
        title: 'Error!',
        text: 'File size exceeds the allowed limit of 1600 KB.',
        icon: 'error',
      });
     }

    }

    // if (event.target.files.length > 0) {

    //   const file = event.target.files[0];

    // console.log(event.target.files, "files")

    //   if (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg') {

    //     this.files = file;

    //     this.companyData.company_logo = this.files.name;

    //     console.warn(this.companyData, "companyData");
    //   } else {
    //     this.companyregistrationForm.get('company_logo').markAsTouched();
    //     this.companyregistrationForm.controls["company_logo"].reset();
    //     // this.resetLogoField('company_logo1');
    //     Swal.fire({
    //       title: 'Warning!',
    //       text: 'The file type is invalid!',
    //       icon: 'warning',
    //     });
    //   }
    // }
  }

  selectedLogo2(event: any) {
    console.log(event.target.files, "files2")

    if (event.target.files.length > 0) {

      const file2 = event.target.files[0];
      const fileSizeInKB = file2.size / 1024; // Get file size in KB
      
     if(fileSizeInKB <= 1600 && (file2.type === 'image/png' || file2.type === 'image/jpg' || file2.type === 'image/jpeg')){
      console.log('correct type');
      this.files2 = file2;
      this.companyData.company_logo2 = this.files2.name;
      console.warn(this.companyData, "companyData");
     }
     else if(!(file2.type === 'image/png' || file2.type === 'image/jpg' || file2.type === 'image/jpeg')){
      this.companyregistrationForm.get('company_logo2').markAsTouched();
      this.companyregistrationForm.controls["company_logo2"].reset();
        Swal.fire({
          title: 'Warning!',
          text: 'Filetype is invalid.Only png, jpg and jpeg is allowed!',
          icon: 'warning',
        });
     }
     else{
       // File size exceeds the limit, show an error message
       this.companyregistrationForm.get('company_logo2').markAsTouched();
        this.companyregistrationForm.controls["company_logo2"].reset();
       Swal.fire({
        title: 'Error!',
        text: 'File size exceeds the allowed limit of 1600kb!',
        icon: 'error',
      });
     }

    }


    // if (event.target.files.length > 0) {
    //   const file2 = event.target.files[0];

    //   if (file2.type === 'image/png' || file2.type === 'image/jpg' || file2.type === 'image/jpeg') {
    //     this.files2 = file2;
    //     this.companyData.company_logo2 = this.files2.name;
    //     console.warn(this.companyData, "companyData");

    //   } else {
    //     // this.companyregistrationForm.get('company_logo2').markAsTouched();
    //     this.companyregistrationForm.controls["company_logo2"].reset();
    //     Swal.fire({
    //       title: 'Warning!',
    //       text: 'The file type is invalid!',
    //       icon: 'warning',
    //     });
    //   }
    // }
  }

  NoSpaceallowedatstart(event:any){
    if(event.target.selectionStart === 0 && event.code ==="Space")
    {
      event.preventDefault();
    }
  
  }


  submitRegistration() {
    if (this.companyregistrationForm.invalid) {
          this.companyregistrationForm.controls['company_logo'].markAsTouched();
          this.companyregistrationForm.controls['company_name'].markAsTouched();
          this.companyregistrationForm.controls['address'].markAsTouched();
          this.companyregistrationForm.controls['telephone_no'].markAsTouched();
          this.companyregistrationForm.controls['registered_email'].markAsTouched();    
        }
        else{
    const formData = new FormData();
    if (this.files) {
      formData.append('file', this.files);
    }

    if (this.files2) {
      formData.append('file2', this.files2);
    }

    this.fileServie.uploadlogoandgetData(formData).subscribe({
      next:(results: any) => {
        this.uplaodfileandgetData = results;
         // Check if filename and filename2 exist in the response
      if (this.uplaodfileandgetData.filename) {
           this.companyData.company_logo = this.uplaodfileandgetData.filename;
       }

          if (this.uplaodfileandgetData.filename2) {
          this.companyData.company_logo2 = this.uplaodfileandgetData.filename2;
        }
    
        this.adminserive.registerCompany(this.companyData).subscribe({
          next:(response: any) => {
            
            if (response.registercompany === 0) {
              Swal.fire({
                title: 'Success!',
                text: 'Company profile has been registered successfully!',
                icon: 'success',
              }).then(()=>{
                this.resetForm();
              })
            } else {
              Swal.fire({
                title: 'Success!',
                text: 'Company profile has been updated successfully!',
                icon: 'success',
              }).then(()=>{
                this.resetForm();
              })
            }
          },
          error:(error: any) => {
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
      });
      },
      error:(error: any) => {
        if (error.status == 403) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Token expired..',
           footer: '<a href="../login">Please Login..</a>'
          }).then(()=>{
            this.router.navigate(['../login']);
          })
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Internal Server Error...`,
            footer: '<a href="../login">Please Login..</a>'
          }).then(()=>{
            this.router.navigate(['../login']);
          })
        }
      }
    });
    }
  }

  resetForm() {
    this.companyregistrationForm.reset({
        company_logo: '',
        company_logo2: '',
        company_name: '',
        nick_name:'',
        address: '',
        telephone_no: null, 
        mobile1: null,
        mobile2: null, 
        registered_email: '',
        gstin: '',
    });
    this.files = '';
    this.files2 = '';
  }

  validlengthforphone(event:any){
    const maxLength = 11;

    if(event.target.value.length>=maxLength){
      event.preventDefault();
    }

  }

  validlengthformobile(event:any){
    const maxLength = 10;

    if(event.target.value.length>=maxLength){
      event.preventDefault();
    }

  }

  validation() {
    const emailPattern = '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,64}';
    const CellphonePattern = "^[0-9]{10}$";
    this.companyregistrationForm = new FormGroup(
      {
        company_logo: new FormControl('', [Validators.required]),
        company_logo2: new FormControl(''),
        company_name: new FormControl('', [Validators.required]),
        nick_name: new FormControl(''),
        address: new FormControl('', [Validators.required]),
        telephone_no: new FormControl(null,  [Validators.required]),
        mobile1: new FormControl(null),
        mobile2: new FormControl(null),
        registered_email: new FormControl('', [Validators.required, Validators.pattern(emailPattern)]),
        gstin: new FormControl(''),
      }

    )
  }
}
