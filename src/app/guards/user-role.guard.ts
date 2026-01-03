import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class UserRoleGuard implements CanActivate {

  constructor(private loginService:LoginService, private router:Router){
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot):  boolean {
      const privilegeLevel = localStorage.getItem('level');
        if(privilegeLevel == '1' || privilegeLevel == '2'){
          return true; 
        }
        else{
          Swal.fire({
            icon:'error',
            title:'Warning!!',
            text: 'Access not allowed...',
          }).then(()=>{
            this.router.navigate(['/login'])
          })      
          return false;
        }
       
     
      }
   
}
