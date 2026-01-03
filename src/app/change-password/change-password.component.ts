import { Component } from '@angular/core';
import { FormGroup, Validators, FormControl} from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LoginService } from '../services/login.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  changePasswordForm:any;
  userNotFound:boolean =false;
  wrongPassword:boolean =false;
  samePassword:boolean = false;

  constructor(private router: Router, private login:LoginService) { }

  ngOnInit(){
    this.validation();
  }


  validation() {
    this.changePasswordForm = new FormGroup({
      user_email: new FormControl('', [Validators.required]),
      old_password: new FormControl('', [Validators.required]),
      new_password: new FormControl('', [Validators.required]),
    })
  }

  get email_id(){
    return this.changePasswordForm.get('user_email');
  } 

  get oldPassword(){
    return this.changePasswordForm.get('old_password');
  } 

  get newPassword(){
    return this.changePasswordForm.get('new_password');
  } 

  async forgotPassword(data:any){
    if(this.changePasswordForm.invalid){
      this.changePasswordForm.get('user_email').markAsTouched();
      this.changePasswordForm.get('old_password').markAsTouched();
      this.changePasswordForm.get('new_password').markAsTouched();
    }
    else{
      try{
        console.log(data, "formdata");
        if (!data.user_email.includes('@apvtechnologies.com')) {
          // Append "@apvtechnologies.com" to the email if not present
          data.user_email = `${data.user_email}@apvtechnologies.com`;
        }
    
         const result:any = await firstValueFrom(this.login.changePassword(data));
    
          if(result && result.success==true){
    
            await  Swal.fire({
              position: "center",
              icon: "success",
              title: "Password changed successfully!",
              showConfirmButton: false,
              timer: 1500,
              footer:'Please login again!'
            });
            this.wrongPassword = false;
            this.userNotFound = false;
            this.samePassword = false;

            setTimeout(()=>{
              this.router.navigate(['login']);
            },500)
            // this.changePasswordForm.reset();
          }
          else if(result && result.success==false){
            if(result.message==="Old password is incorrect"){
              this.wrongPassword = true;
              this.userNotFound = false;
              this.samePassword = false;
            }
            else if(result.message==="New password can\'t same as old password!"){
              this.wrongPassword = false;
              this.userNotFound = false;
              this.samePassword = true
            }
            else{
              this.wrongPassword = false;
              this.userNotFound = true;
              this.samePassword = false;

            }
            // location.reload(); 
          }
      }
    catch(err){
      console.error(err);
    }
    }
  }

  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }

  clearAll(){
    localStorage.clear();
  }


}
