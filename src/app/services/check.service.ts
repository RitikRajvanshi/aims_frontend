import { Injectable } from '@angular/core';
// import { environment } from '../environments/environment.dev';
import { environment } from '../environments/environment.prod';

import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, pipe, map, catchError, of, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckService {

  constructor(private httpClient:HttpClient) { }

  getCategorydatabystatus(){
    let url = environment.CHECK_URL + environment.CHECK.GETCATEGORYBYSTATUS

    return this.httpClient.get(url);
  }

  deactivateCategoryStatuscheck(id:any){
    let url = environment.CHECK_URL + environment.CHECK.DEACTIVATECATEGORYSTATUSCHECK

    return this.httpClient.post(url, id);
  }

  getGroupdatabystatus(){
    let url = environment.CHECK_URL + environment.CHECK.GETGROUPDATABYSTATUS

    return this.httpClient.get(url);
  }
  
  deactivateGroupStatuscheck(id:any){
    let url = environment.CHECK_URL + environment.CHECK.DEACTIVATEGROUPSTATUSBYCHECK

    return this.httpClient.post(url, id);
  }

  getDesingationdatabystatus(){
    let url = environment.CHECK_URL + environment.CHECK.GETDESIGNATIONBYSTATUS

    return this.httpClient.get(url);
  }

  deactivateDesiginationStatuscheck(id:any){
    let url = environment.CHECK_URL + environment.CHECK.DEACTIVATEDESIGNATIONSTATUSBYCHECK

    return this.httpClient.post(url, id);
  }
  
  getPrivilegedatabystatus(){
    let url = environment.CHECK_URL + environment.CHECK.GETPRIVILEGEBYSTATUS

    return this.httpClient.get(url);
  }

  deactivatePrivilegeStatuscheck(id:any){
    let url = environment.CHECK_URL + environment.CHECK.DEACTIVATEPRIVILEGESTATSUCHECK

    return this.httpClient.post(url, id);
  }

  
  getLocationdatabystatus(){
    let url = environment.CHECK_URL + environment.CHECK.GETLOCATIONDATABYSTATUS

    return this.httpClient.get(url);
  }

  deactivateLocationStatusbyid(id:any){
    let url = environment.CHECK_URL + environment.CHECK.DEACTIVATELOCATIONDATABYID

    return this.httpClient.post(url, id);
  }

  getProductdatabystatus(){
    let url = environment.CHECK_URL + environment.CHECK.GETPRODUCTBYSTATUS

    return this.httpClient.get(url);
  }

  // getProductjoindatabystatus(){
  //   let url = environment.CHECK_URL + environment.CHECK.GETPRODUCTJOINDATABYSTATUS

  //   return this.httpClient.get(url);
  // }

  deactivateProductStatuscheck(id:any){
    let url = environment.CHECK_URL + environment.CHECK.DEACTIVATEPRODUCTSTATUSCHECK

    return this.httpClient.post(url, id);
  }

  verificationofpIdinsupplierEvaluation(pid:any){
    let url = environment.CHECK_URL+ environment.CHECK.VERIFICATIONOFPIDINSUPPLIEREVALUATION
    
    return this.httpClient.post(url, pid);
  }

  onacceptrequest(id:any){
    let url = environment.CHECK_URL + environment.CHECK.CHANGESTATUSONACCEPTREQ

    return this.httpClient.post(url, id);
  }


  onrejectrequest(id:any){
    let url = environment.CHECK_URL + environment.CHECK.CHANGESTATUSONREJECTREQ

    return this.httpClient.post(url, id);
  }

  verificationofItems(p_id:any){
    let url = environment.CHECK_URL + environment.CHECK.VERIFICATIONOFITEMS

    return this.httpClient.post(url, p_id);
  }

  // checkFileExistence(filePath: string): Observable<boolean> {
  //   return this.httpClient.head(filePath, { observe: 'response' }).pipe(
  //     map(response => response.status === 200),
  //     catchError(() => of(false))
  //   );
  // }

  checkFileExistence(filePath: string): Observable<boolean> {
    return this.httpClient.head(filePath, { observe: 'response' }).pipe(
      timeout(5000), // Timeout after 5 seconds (adjust as needed)
      map(response => response.status === 200),
      catchError(() => of(false))
    );
  }



}
