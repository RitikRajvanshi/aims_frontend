import { Injectable, Renderer2, RendererFactory2, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, fromEvent } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';

// export enum IdleUserTimes{
//   IdleTime = 60000,      // 1 minutes
//   CountdownTime = 1800000 // 30 minutes (1800000 milliseconds)
// }

// export enum IdleUserTimes{
//   IdleTime = 1000,      // 30 seconds
//   CountdownTime = 1000000 // 30 minutes (1800000 milliseconds)
// }

export enum IdleUserTimes {
  IdleTime = 30000,         // 30 seconds
  CountdownTime = 1800000   // 30 minutes
}

@Injectable({
  providedIn: 'root'
})
export class IdleService {

  private timeoutId:any;
  private countdownId:any;
  private countdownValue:number=0;

  userInactive: Subject<boolean>= new Subject();
  
  private renderer: Renderer2;
  private platform: string;
  private currentRoute: string='';
  constructor(
    private route: Router,
    rendererFactory: RendererFactory2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.platform = isPlatformBrowser(platformId) ? 'browser' : 'server';
    
    if (this.platform === 'browser') {
      this.route.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.currentRoute = event.urlAfterRedirects;
          if (this.currentRoute !== '/login' && this.currentRoute !== '') {
            this.initListener();
          }
        }
      });
    }
  }

  // initListener(){
  //   window.addEventListener('mousemove',()=> this.reset());
  //   window.addEventListener('click',()=> this.reset());
  //   window.addEventListener('keypress',()=> this.reset());
  //   window.addEventListener('DOMMouseScroll',()=> this.reset());
  //   window.addEventListener('mousewheel',()=> this.reset());
  //   window.addEventListener('touchmove',()=> this.reset());
  //   window.addEventListener('MSpointerMove',()=> this.reset());
  // }

  initListener() {
    const events = ['mousemove', 'click', 'keypress', 'scroll', 'touchmove','DOMMouseScroll','mousewheel', 'touchmove','MSpointerMove'];
    events.forEach(event => {
      fromEvent(window, event).subscribe(() => this.reset());
    });
  }


  reset(){
    clearInterval(this.timeoutId);
    clearInterval(this.countdownId);
    this.startIdleTimer();
    
  }

  startIdleTimer(){
    this.timeoutId = setTimeout(()=>{
      console.log('Inactive Detection');
      this.startCountdown();
    }, IdleUserTimes.IdleTime)
  }

  startCountdown(){
    this.countdownValue = IdleUserTimes.CountdownTime/1000;
    this.countdownId = setInterval(()=>{
      // console.log('You will logout in;' ,this.countdownValue,'seconds');

      this.countdownValue --;
      if (this.countdownValue <= 0) {

        clearInterval(this.countdownId);
        console.log('User Idle');
        // this.handleIdleState();
        this.showLogoutAlert();
      } 

    }, 1000)
  }

  private handleIdleState() {
    this.userInactive.next(true);
    localStorage.removeItem('Token');
    localStorage.removeItem('login_id');
    // localStorage.removeItem('privilege_id');
    localStorage.removeItem('name');
    localStorage.removeItem('level');
    this.route.navigateByUrl('');
  }

  private showLogoutAlert() {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Session out!",
      showConfirmButton: true, 
      timer: 4000,
      footer:'Please Login Again!'
    })
    .then(()=>{
      this.handleIdleState();
    })
  }
}
