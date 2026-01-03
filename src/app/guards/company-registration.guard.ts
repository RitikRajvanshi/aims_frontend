import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from '../services/login.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyRegistrationGuard implements CanActivate {
  constructor(private router:Router, public loginService:LoginService){

  }

  companyRegistration:any;
  canActivate(): boolean  {
    this.companyRegisteration().then(()=>{
      console.log(this.companyRegistration, "companyRegistration");

      if (this.companyRegistration.register == 0) {

        // Navigate to the company registration page
        this.router.navigate(['/register-company']);
        return false;
      }
      this.router.navigate(['/login']);
      return true;
    })
    return true;
   
  }

  async companyRegisteration(){
    this.companyRegistration = await this.loginService.companyRegisteredorNot().toPromise();
    if(this.companyRegistration.register === 0){
      return 0;
    }
    else{
      return 1;
    }
  }
}
  

