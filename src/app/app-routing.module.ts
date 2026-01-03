import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { CompanyRegistrationGuard } from './guards/company-registration.guard';
import { CompanyRegistrationComponent } from './company-registration/company-registration.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { UserRoleGuard } from './guards/user-role.guard';



const routes: Routes = [
  {path:'',redirectTo: '/login', pathMatch: 'full'},
  {path:'login', component:LoginComponent,  canActivate: [CompanyRegistrationGuard]},
  {path: 'register-company',component: CompanyRegistrationComponent, canActivate:[CompanyRegistrationGuard]},
  {path:'forgot-password', component:ForgetPasswordComponent},
  {path:'change-password', component:ChangePasswordComponent, canActivate:[UserRoleGuard]},
  { path: 'user',loadChildren:()=> import('./user/user.module').then(m=>m.UserModule)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
