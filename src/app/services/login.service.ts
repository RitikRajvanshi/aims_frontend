import { Injectable } from '@angular/core';
// import { environment } from '../environments/environment.dev';
import { environment } from '../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  token:any;

  constructor(private httpClient:HttpClient, private router:Router){}

  userLogin(data:any){
    let url = environment.LOGIN_URL + environment.LOGIN.LOGIN_CUSTOMER
    return this.httpClient.post(url, data)
  }


  

  //For authguard to not navigate without login checking islogged in or not

  get isloggedIn():boolean{
    let authToken = localStorage.getItem('Token');
    //  console.log('checking authtoken',authToken!== null);
    this.token = authToken;
    return authToken!== null? true:false;
  }

 logout(){
  let removeToken = localStorage.removeItem('Token');
  localStorage.removeItem('login_id');
  // localStorage.removeItem('privilege_id');
  localStorage.removeItem('name');
  localStorage.removeItem('level');
 
  if(removeToken == null){
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: 'You are successfully logout...',
      showConfirmButton: false,
      timer: 1500
    }).then(()=>{
      this.router.navigate(['/login']);
    })
  }
  else{
    localStorage.clear();
  }
 }


 companyRegisteredorNot(){
  
  let url = environment.LOGIN_URL + environment.LOGIN.COMPANY_REGISTERED_ORNOT;

  return this.httpClient.get(url);
 }

 
 addInitalData(data: any){

  let url = environment.LOGIN_URL + environment.LOGIN.ADD_INITIALDATA;

  return this.httpClient.post(url, data);
 }

 forgetPassword(data:any){
  let url = environment.LOGIN_URL + environment.LOGIN.FORGETPASSWORD;

  return this.httpClient.post(url, data);
 }

 changePassword(data:any){
  let url = environment.LOGIN_URL + environment.LOGIN.CHANGEPASSWORD;

  return this.httpClient.post(url, data);
 }

}
