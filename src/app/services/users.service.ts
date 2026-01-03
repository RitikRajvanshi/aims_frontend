import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

private reloadSubject = new BehaviorSubject<boolean>(false);

private requestGeneratedSource = new Subject<void>();

requestGenerated$ = this.requestGeneratedSource.asObservable();

emitRequestGenerated(): void {
  this.requestGeneratedSource.next();
}
  

sendSignal(){
  this.reloadSubject.next(true);
}

getReloadSignal(){
  return this.reloadSubject.asObservable();
}
}
