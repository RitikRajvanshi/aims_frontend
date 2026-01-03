import { Component } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { FilesService } from 'src/app/services/files.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent {
  companyDataList: any;
  companyregistrationForm: any;
  files: any;
  files2: any;
  uplaodfileandgetData: any;

  companyData = {
    'company_logo': '',
    'company_logo2':'',
    'company_name': '',
    'nick_name':'',
    'address': '',
    'telephone_no': null,
    'mobile1': null,
    'mobile2': null,
    'registered_email': '',
    'status': '1',
    'created_by': localStorage.getItem('login_id'),
    'gstin':''
  }

  logoname: any = {
    company_logo: ''
  }

  constructor(private sharedService: SharedService, private adminServie: AdminService, public fileServie: FilesService, private router: Router) { }

  ngOnInit(): void {
    this.validation();
    this.getCompanyData();
  }

  selectedLogo(event: any) {
    // console.log(event.target.files, "files")
    if (event.target.files.length > 0) {

      const file = event.target.files[0];
      const fileSizeInKB = file.size / 1024; // Get file size in KB
      
     if(fileSizeInKB <= 1600 && (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg')){
      this.files = file;
      this.logoname.company_logo = this.files.name;

     }
     else if(!(file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg')){
      this.companyregistrationForm.get('company_logo').touched;
      this.companyregistrationForm.controls["company_logo"].reset();
       Swal.fire({
         title: 'Warning!',
         text: 'Filetype is invalid.Only png, jpg and jpeg is allowed!',
         icon: 'warning',
       });
     }
     else{
       // File size exceeds the limit, show an error message
       this.companyregistrationForm.get('company_logo').touched;
       this.companyregistrationForm.controls["company_logo"].reset();
       Swal.fire({
        title: 'Error!',
        text: 'File size exceeds the allowed limit of 1600kb!',
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
      this.files2 = file2;
      this.companyData.company_logo2 = this.files2.name;

     }
     else if(!(file2.type === 'image/png' || file2.type === 'image/jpg' || file2.type === 'image/jpeg')){
      this.companyregistrationForm.get('company_logo2').markAsTouched();
      this.companyregistrationForm.controls["company_logo2"].reset();
        Swal.fire({
          title: 'Warning!',
          text: 'File type is invalid.Only png, jpg and jpeg is allowed!',
          icon: 'warning',
        });
     }
     else{
       // File size exceeds the limit, show an error message
       this.companyregistrationForm.get('company_logo2').markAsTouched();
        this.companyregistrationForm.controls["company_logo2"].reset();
       Swal.fire({
        title: 'Error!',
        text: 'File size exceeds the allowed limit of 1600 kb!',
        icon: 'error',
      });
     }

    }
  }

  onPaste(event: any) {
    event.preventDefault(); // Prevent default paste behavior

    const clipboardData = event.clipboardData.getData('text');
    if (clipboardData) {
      const currentContent = this.companyData.address || ''; // Existing content or an empty string
      const newContent = currentContent + clipboardData; // Concatenate existing content with newly pasted content
      this.companyData.address = newContent;
    }
    console.log(this.companyData.address);
  }

  typeintextarea(data: any) {
    // console.log(data);
    this.companyData.address = data || '' ;
  }

  submitRegistraion() {
    if (this.companyregistrationForm.invalid) {
      this.companyregistrationForm.controls['selected_company'].markAsTouched();
      this.companyregistrationForm.controls['company_logo'].markAsTouched();
      this.companyregistrationForm.controls['company_name'].markAsTouched();
      this.companyregistrationForm.controls['address'].markAsTouched();
      this.companyregistrationForm.controls['telephone_no'].markAsTouched();
      this.companyregistrationForm.controls['registered_email'].markAsTouched();

    }
    else {
      // // console.log(this.companyData);
      if (this.files == undefined || null || '') {
      if(this.files || this.files2){
      const formdata = new FormData();
      // formdata.append('file', this.files);

      if (this.files) {
        formdata.append('file', this.files);
      }
  
      if (this.files2) {
        formdata.append('file2', this.files2);
      }

      this.fileServie.uploadlogoandgetData(formdata).subscribe(
        {
          next: (results: any) => {
            this.uplaodfileandgetData = results;
            // this.companyData.company_logo = this.uplaodfileandgetData.filename;

            if (this.uplaodfileandgetData.filename) {
              this.companyData.company_logo = this.uplaodfileandgetData.filename;
          }
   
             if (this.uplaodfileandgetData.filename2) {
             this.companyData.company_logo2 = this.uplaodfileandgetData.filename2;
           }

            this.adminServie.registerCompany(this.companyData).subscribe(
              {
                next: (results: any) => {
                  // // console.log(results);
                  if (results[0].registercompany == 0) {
                    Swal.fire({
                      title: 'Success!',
                      text: 'Company profile has been registered successfully!',
                      icon: 'success',
                    }).then(()=>{
                      this.resetForm();
                    // location.reload();
                    })
                    

                  }
                  else {
                    Swal.fire({
                      title: 'Success!',
                      text: 'Company profile has been updated successfully!',
                      icon: 'success',
                    }).then(()=>{
                  this.resetForm();
                  // this.ngOnInit();
                    })
                   
                  }
                }, error: (error) => {
                  // // console.log('error')
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
          }, error: (error) => {
            // // console.log('error')
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
    else{
      this.adminServie.registerCompany(this.companyData).subscribe(
        {
          next: (results: any) => {
            // // console.log(results);
            if (results[0].registercompany == 0) {
              Swal.fire({
                title: 'Success!',
                text: 'Company has been registered successfully!',
                icon: 'success',
              }).then(()=>{
                this.resetForm();
                // this.ngOnInit();
              })
              
            }
            else {
              Swal.fire({
                title: 'Success!',
                text: 'Company profile has been successfully updated!',
                icon: 'success',
              }).then(()=>{
                this.resetForm();
                // this.ngOnInit();
              })
             
            }
          }, error: (error) => {
            // // console.log('error')
            if (error.status == 403) {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Token expired. Please login..',
                footer: '<a href="../login">Login..</a>'
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
  }
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
    this.companyData.company_name = '';
  }

  selectCompany(name: any) {
    // // console.log(name);
    let companyName = {
      company_name: name
    }
    this.sharedService.getCompanydatabycompanyName(companyName).subscribe({
      next:(results: any) => {

      this.companyData.company_name = results[0]?.company_name;
      this.companyData.company_logo = results[0]?.company_logo;
      this.companyData.company_logo2 = results[0]?.company_logo2 ;
      this.companyData.nick_name = results[0]?.nick_name;
      this.companyData.address = results[0]?.address;
      this.companyData.telephone_no = results[0]?.telephone_no;
      this.companyData.mobile1 = results[0]?.mobile1;
      this.companyData.mobile2 = results[0]?.mobile2;
      this.companyData.registered_email = results[0]?.registered_email;
      this.companyData.gstin = results[0]?.gstin;
    },
  error:(error)=>{
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
  }})

  }

  getCompanyData() {
    this.sharedService.getCompanydata().subscribe({
      next:(results: any) => {
      this.companyDataList = results;
    },
  error:(error)=>{
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
  }})

  }

  NoSpaceallowedatstart(event:any){
    if(event.target.selectionStart === 0 && event.code ==="Space")
    {
      event.preventDefault();
    }
  
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
        selected_company: new FormControl('', [Validators.required]),
        nick_name: new FormControl(''),
        company_logo: new FormControl('', [Validators.required]),
        company_logo2: new FormControl(''),
        company_name: new FormControl('', [Validators.required]),
        address: new FormControl('', [Validators.required]),
        telephone_no: new FormControl(0, [Validators.required]),
        mobile1: new FormControl(0),
        mobile2: new FormControl(0),
        registered_email: new FormControl('', [Validators.required]),
        gstin:new FormControl('')
      }

    )
  }
}


