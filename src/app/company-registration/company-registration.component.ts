import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { FilesService } from 'src/app/services/files.service';
import { LoginService } from '../services/login.service';
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
    'created_by': '1',
    'gstin':''
  }

  logoname: any = {
    company_logo: ''
  }

  logoname2: any = {
    company_logo2: ''
  }

  initialData = {
    user_name: '',
    user_email: ''
  }

  constructor(private adminserive: AdminService, public fileServie: FilesService, private router: Router, private loginService: LoginService) { }

  ngOnInit(): void {

    Swal.fire({
      title: 'Warning!',
      text: 'You are not registered yet. Please register your company!',
      icon: 'warning',
    });

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
        text: 'File size exceeds the allowed limit of 1600kb !',
        icon: 'error',
      });
     }

    }
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
       this.companyregistrationForm.get('company_logo').markAsTouched();
        this.companyregistrationForm.controls["company_logo"].reset();
       Swal.fire({
        title: 'Error!',
        text: 'File size exceeds the allowed limit of 1600kb !',
        icon: 'error',
      });
     }

    }
  }

  async initialdataInstallationindb() {
    const insertData = await this.loginService.addInitalData(this.initialData).toPromise();
    let insertData2 = JSON.parse(JSON.stringify(insertData));
    if(insertData2?.message && insertData2?.message === 'User Created Successfully'){
      Swal.fire({
        title: 'Success!',
        text: 'Company registered successfully with a guest user!',
        icon: 'success',
        footer: '<p class="text-info">User details are send to your official mail</p>'
      }).then(() => {
        // this.resetForm();
        this.router.navigate(['/login']);
      })
    }
    return insertData;
  }



  submitRegistration() {
    if (this.companyregistrationForm.invalid) {

      this.companyregistrationForm.controls['company_logo'].markAsTouched();
      this.companyregistrationForm.controls['company_name'].markAsTouched();
      this.companyregistrationForm.controls['address'].markAsTouched();
      this.companyregistrationForm.controls['telephone_no'].markAsTouched();
      this.companyregistrationForm.controls['registered_email'].markAsTouched();

    }
    else {

      this.initialData.user_name = this.companyData.company_name;
      this.initialData.user_email = this.companyData.registered_email;

      const formData = new FormData();

      if (this.files) {
        formData.append('file', this.files);
      }

      if (this.files2) {
        formData.append('file2', this.files2);
      }

      // console.log(formData, "formdata");

      this.fileServie.uploadlogoandgetData(formData).subscribe({
        next:(results: any) => {

          this.uplaodfileandgetData = results;
          // console.log(this.uplaodfileandgetData, "filename");
          // this.companyData.company_logo = this.uplaodfileandgetData.filename;
          // this.companyData.company_logo2 = this.uplaodfileandgetData.filename;

          // Check if filename and filename2 exist in the response
          if (this.uplaodfileandgetData.filename) {
            this.companyData.company_logo = this.uplaodfileandgetData.filename;
          }

          if (this.uplaodfileandgetData.filename2) {
            this.companyData.company_logo2 = this.uplaodfileandgetData.filename2;
          }

          this.adminserive.registerCompany(this.companyData).subscribe({
            next:(response: any) => {
              this.initialdataInstallationindb();
            },
          error:(error: any) => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              color:'red',
              text: 'Session expired!. Please login again',
              footer: '<a href="../login">Login.</a>'
            }).then(() => {
              this.router.navigate(['../login']);
            })
            }
        });
        },
        error:(error: any) => {
          Swal.fire({
            icon: 'error',
            title: 'Oops',
            color:'red',
            text: 'Token expired.',
            footer: 'Please try after some time'
          }).then(() => {
            this.router.navigate(['../login']);
          })
        }
    });
    }
  };

  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.keyCode === 32) {
      event.preventDefault();
    }
  }

  resetForm() {
    this.companyregistrationForm.reset();
    this.files = '';
    this.files2 = '';
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
        telephone_no: new FormControl(null, [Validators.required]),
        mobile1: new FormControl(null, [Validators.pattern(CellphonePattern)]),
        mobile2: new FormControl(null, [Validators.pattern(CellphonePattern)]),
        registered_email: new FormControl('', [Validators.required, Validators.email, Validators.pattern(emailPattern)]),
        gstin: new FormControl('')

      }

    )
  }

}
