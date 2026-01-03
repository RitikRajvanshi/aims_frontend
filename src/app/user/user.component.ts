import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SharedService } from '../services/shared.service';
import { LoginService } from '../services/login.service';
declare var $: any;
import { environment } from '../environments/environment.prod';
import Swal from 'sweetalert2';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { filter } from 'rxjs/operators';
import { IdleService } from '../services/idle.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  animations: [
    trigger('rotateArrow', [
      state('right', style({ transform: 'rotate(0deg)' })),
      state('down', style({ transform: 'rotate(90deg)' })),
      transition('right <=> down', animate('300ms ease-in')),
      transition('right <=> left', animate('300ms ease-in')),
    ]),
  ],
})
export class UserComponent implements OnInit {
  @ViewChild('logoutbtn') logoutButton!: ElementRef;


  arrowState: { [key: string]: 'left' | 'down' } = {
    BasicFormsbtn: 'left',
    userarrow: 'left',
    vendorarrow: 'left',
    Requestarrow: 'left',
    Purchasearrow: 'left',
    Inspectionarrow: 'left',
    Inventoryarrow: 'left',
    Reportsarrow: 'left',
    SystemInfoarrow: 'left',
    Registrationarrow: 'left',
    Gatepassbtn: 'left'

  };

  companyData: any;
  companyLogo = '';
  companyName = '';
  icontoggle = true;


  userRole = localStorage.getItem('level');
  userName = localStorage.getItem('name');

  screenSizes = {
    xs: 480,
    sm: 768,
    md: 992,
    lg: 1200
  }

  // isTransferStock:boolean = false;
  sidebarCollapsed: boolean = false;
  isUserIdle: boolean = false;


  constructor(public router: Router, public loginService: LoginService, public sharedService: SharedService, private elementRef: ElementRef, private idleService: IdleService) { }


  ngOnInit() {
    this.getCompanyData();

    this.idleService.userInactive.subscribe((isIdle: any) => {
      this.isUserIdle = isIdle;

      if (isIdle) {
        console.log('User is idle');
      }
    });
    // Optionally, you can call reset to start tracking immediately
    this.idleService.reset();
  }

  toggleArrow(buttonId: string) {

    this.arrowState[buttonId] = this.arrowState[buttonId] === 'down' ? 'left' : 'down';
  }

  logout() {
    this.loginService.logout();
  }

  getCompanyData() {
    this.sharedService.getCompanydata().subscribe(
      {
        next: (results: any) => {
          this.companyData = results;
          this.companyLogo = `${environment.BASE_URL}companyData/` + results[0].company_logo;
          // console.log(this.companyLogo, "this.companyLogo")
          this.companyName = results[0].company_name;
        },
        error: (error) => {
          // console.log('error')
          if (error.status == 403) {
            Swal.fire({
              icon: 'error',
              title: 'Oops!',
              text: 'Token expired.',
              footer: '<a href="../login">Please login again!</a>'
            }).then(() => {
              this.router.navigate(['../login']);
            })
          }
          else {
            Swal.fire({
              icon: 'error',
              title: 'Oops!',
              text: 'Internal server error.Please try after some time!',
              footer: '<a href="../login">Login</a>'
            }).then(() => {
              location.reload();
            })
          }
        }
      })
  }

  //the below function is used is depreciated due to direct click on the li 
  // this function is generated to handle click button of logout for whole of the div
  handleDivClick(): void {
    // Trigger the button click event
    this.logoutButton.nativeElement.click();
  }


  SidebarToggle() {
    var screenSizes = this.screenSizes;
    //Enable sidebar push menu
    if ($(window).width() > (screenSizes.sm - 1)) {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      if ($("body").hasClass('sidebar-collapse')) {
        $("body").removeClass('sidebar-collapse')
      } else {
        $("body").addClass('sidebar-collapse')
      }
    }
    //Handle sidebar push menu for small screens
    else {
      if ($("body").hasClass('sidebar-open')) {
        $("body").removeClass('sidebar-open').removeClass('sidebar-collapse')
      } else {
        $("body").addClass('sidebar-open')
      }
      this.sidebarCollapsed = false;

    }
  }


  //  SidebarToggleaftercollapse(){
  //   // var screenSizes = this.screenSizes;
  //    //Enable sidebar push menu
  //     // Add event listener to sidebar menu items
  //     $('.sidebar-menu').find('li').on('click', (event:any) => {
  //      // Get the current router state
  //      this.router.events.pipe(
  //       filter(event => event instanceof NavigationEnd)
  //     ).subscribe((event: any) => {
  //       // Get the current route URL
  //       const currentRoute = event.url;
  //       console.log(currentRoute, "currentRoute");
  //       // Check if the current route is the "transfer-stock" route
  //       if (currentRoute.includes('/user/transfer-stock')) {
  //         return; // Do nothing if it's the "transfer-stock" route
  //       }
  //       // Check if sidebar is collapsed
  //       if ($("body").hasClass('sidebar-collapse')) {
  //           // Remove collapsed class to expand the sidebar
  //           $("body").removeClass('sidebar-collapse');
  //             // Collapse the treeview menu
  //       }
  //   });
  // });
  //  }

  SidebarToggleaftercollapse() {
    // Subscribe to router events
    // this.router.events.pipe(
    //   filter(event => event instanceof NavigationEnd)
    // ).subscribe((event: any) => {
    //   // Get the current route URL
    //   const currentRoute = event.url;
    //   console.log(currentRoute, "currentRoute");
    //   console.log(currentRoute.includes('/user/transfer-stock'), "currentRoutetrue");
    //   // Check if the current route is the "transfer-stock" route
    //   if (currentRoute.includes('/user/transfer-stock')) {
    //     this.isTransferStock = true;
    //     return; // Do nothing if it's the "transfer-stock" route
    //   }
    //   else{
    //     if ($("body").hasClass('sidebar-open')) {
    //       $("body").removeClass('sidebar-open').removeClass('sidebar-collapse')
    //   } else {
    //       $("body").addClass('sidebar-open')
    //   }
    //   }
    // Add event listener to sidebar menu items

    $('.sidebar-menu').find('li').on('click', () => {
      // Check if sidebar is collapsed
      if ($("body").hasClass('sidebar-collapse')) {
        // Remove collapsed class to expand the sidebar
        $("body").removeClass('sidebar-collapse');
        this.sidebarCollapsed = false;

        // Collapse the treeview menu
      }

    });

    //   if(!this.isTransferStock){
    //     $('.sidebar-menu').find('li').on('click', () => {
    //       // Check if sidebar is collapsed
    //       if ($("body").hasClass('sidebar-collapse')) {
    //         // Remove collapsed class to expand the sidebar
    //         $("body").removeClass('sidebar-collapse');
    //         // Collapse the treeview menu
    //       }
    //     });
    //   }
    //   else{
    //     var screenSizes = this.screenSizes;
    //     //Enable sidebar push menu
    //     if ($(window).width() > (screenSizes.sm - 1)) {
    //      if ($("body").hasClass('sidebar-collapse')) {
    //          $("body").removeClass('sidebar-collapse')
    //      } else {
    //          $("body").addClass('sidebar-collapse')
    //      }
    //  }
    //   }


  }

  // showSubMenu(event: MouseEvent, menuId: string) {
  //   const submenu:any = document.getElementById(menuId);
  //   submenu.style.display = 'block';
  //   submenu.style.position = 'absolute';
  //   submenu.style.top = event.clientY + 'px';
  //   submenu.style.left = event.clientX + 'px';
  // }

  // hideSubMenu(event: MouseEvent, menuId: string) {
  //   const submenu:any = document.getElementById(menuId);
  //   submenu.style.display = 'none';
  // }




}








