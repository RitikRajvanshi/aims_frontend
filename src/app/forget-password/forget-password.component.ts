import { Component } from '@angular/core';
import { FormGroup, Validators, FormControl} from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LoginService } from '../services/login.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent {
  forgotPasswordForm:any;

  ngOnInit(): void {
    this.validation();
  }

  constructor(private router: Router, private login:LoginService) { }


  async forgotPassword(data:any){
    if (!data.user_email.includes('@apvtechnologies.com')) {
      // Append "@apvtechnologies.com" to the email if not present
      data.user_email = `${data.user_email}@apvtechnologies.com`;
    }

    console.log(data);
     const result:any = await firstValueFrom(this.login.forgetPassword(data));

     console.log(result);

      if(result && result.length!==0){
        await  Swal.fire({
          position: "center",
          icon: "success",
          title: "Password sent on your registered Email-id",
          showConfirmButton: false,
          timer: 1500
        })
        this.forgotPasswordForm.reset();
      }
    
    
  }

  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }

  validation() {
    this.forgotPasswordForm = new FormGroup({
      user_email: new FormControl('', [Validators.required]),
    })
  }

  get email_id(){
    return this.forgotPasswordForm.get('user_email');
  } 


}
