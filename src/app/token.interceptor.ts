import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  session_data:any;
  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.session_data = localStorage.getItem('Token');
    if(this.session_data != null){
      request = request.clone({
        setHeaders: {
          // authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJuYW1lIjowLCJlbWFpbCI6ImFkbWluQHBldHJvdGVsLmNvbSIsInJvbGUiOiJhIn0sImlhdCI6MTU5NDQ2NDI3MX0.nFc4Dn1nQUWcOrFsKuz85SoYQG9joJcqCW2vGl-GCdg`
         Authorization: `Bearer ${this.session_data}`
        }
    });
  }
    return next.handle(request);
  }
}
