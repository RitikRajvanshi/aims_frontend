import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard  {

privilegeId=localStorage.getItem('privilege_id');


constructor(private loginService:LoginService, private router:Router){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      if(this.loginService.isloggedIn !== true){
        Swal.fire({
          icon:'error',
          title:'Warning!!',
          text: 'Access not allowed...',
        }).then(()=>{
          this.router.navigate(['/login'])
        })    
        return false;  
      }
        return true;
      }
      
    
  }
  

