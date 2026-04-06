import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserDashboardComponent } from './user-component/user-dashboard/user-dashboard.component';
import { UserComponent } from './user.component';
import { CategoryComponent } from './user-component/category/category.component';
import { ProductComponent } from './user-component/product/product.component';
import { GroupComponent } from './user-component/group/group.component';
import { DesignationComponent } from './user-component/designation/designation.component';
import { UserPrivilegeComponent } from './user-component/user-privilege/user-privilege.component';
import { LocationComponent } from './user-component/location/location.component';
import { AddUserComponent } from './user-component/add-user/add-user.component';
import { UserListComponent } from './user-component/user-list/user-list.component';
import { AddVendorComponent } from './user-component/add-vendor/add-vendor.component';
import { VendorListComponent } from './user-component/vendor-list/vendor-list.component';
import { MakePurchaseOrderComponent } from './user-component/make-purchase-order/make-purchase-order.component';
import { PurchaseOrderListComponent } from './user-component/purchase-order-list/purchase-order-list.component';
import { GenarateRequestComponent } from './user-component/genarate-request/genarate-request.component';
import { AcceptedRequestComponent } from './user-component/accepted-request/accepted-request.component';
import { PendingRequestComponent } from './user-component/pending-request/pending-request.component';
import { RejectedRequestComponent } from './user-component/rejected-request/rejected-request.component';
import { UploadInvoiceComponent } from './user-component/upload-invoice/upload-invoice.component';
import { UploadInspectionFormComponent } from './user-component/upload-inspection-form/upload-inspection-form.component';
import { UpdateItemsComponent } from './user-component/update-items/update-items.component';
import { UploadScanDocumentComponent } from './user-component/upload-scan-document/upload-scan-document.component';
import { UploadScanQuotationComponent } from './user-component/upload-scan-quotation/upload-scan-quotation.component';
import { IncomingItemDetailsComponent } from './user-component/incoming-item-details/incoming-item-details.component';

import { CompanyRegistrationComponent } from './user-component/company-registration/company-registration.component';
import { MovetoItsmComponent } from './user-component/moveto-itsm/moveto-itsm.component';
import { NewsystemInformationComponent } from './user-component/newsystem-information/newsystem-information.component';
import { SystemInformationListComponent } from './user-component/system-information-list/system-information-list.component';
import { AssetsComponent } from './user-component/assets/assets.component';
import { TransferStockComponent } from './user-component/transfer-stock/transfer-stock.component';
import { UpdateVendorComponent } from './user-component/update-vendor/update-vendor.component';
import { ReportActiveSupplierComponent } from './user-component/report-active-supplier/report-active-supplier.component';
import { UpdateUserComponent } from './user-component/update-user/update-user.component';
import { PurchaseOrderViewComponent } from './user-component/purchase-order-view/purchase-order-view.component';
import { SupplierEvaluationComponent } from './user-component/supplier-evaluation/supplier-evaluation.component';
import { ReportPurchaseOrderComponent } from './user-component/report-purchase-order/report-purchase-order.component';
import { ReportVendorEvaluationComponent } from './user-component/report-vendor-evaluation/report-vendor-evaluation.component';
import { ReportUploadDocumentComponent } from './user-component/report-upload-document/report-upload-document.component';
import { ReportItemsListComponent } from './user-component/report-items-list/report-items-list.component';
import { ReceivedRequestComponent } from './user-component/received-request/received-request.component';
import { ReceivedPurchaseOrderComponent } from './user-component/received-purchase-order/received-purchase-order.component';
import { AuthGuard } from '../guards/auth.guard';
import { ReportPendingStockComponent } from './user-component/report-pending-stock/report-pending-stock.component';
import { ReportStockInHandComponent } from './user-component/report-stock-in-hand/report-stock-in-hand.component';
import { ReportCompleteAssetComponent } from './user-component/report-complete-asset/report-complete-asset.component';
import { EditProfileComponent } from './user-component/edit-profile/edit-profile.component';
import { SystemDetailComponent } from './user-component/system-detail/system-detail.component';
import { UserRoleGuard } from '../guards/user-role.guard';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { ReportItemWithPriceComponent } from './user-component/report-item-with-price/report-item-with-price.component';
import { ReportItemWithLocationanduserComponent } from './user-component/report-item-with-locationanduser/report-item-with-locationanduser.component';
import { PurchaseInfoComponent } from './user-component/purchase-info/purchase-info.component';
import { ReportWarrantyItemsComponent } from './user-component/report-warranty-items/report-warranty-items.component';
import { ReportScrapedItemsComponent } from './user-component/report-scraped-items/report-scraped-items.component';
import { AddItemComponent } from './user-component/add-item/add-item.component';
import { GatepassComponent } from './user-component/gatepass/gatepass.component';
import { GatepassViewComponent } from './user-component/gatepass-view/gatepass-view.component';
import { GatepassListComponent } from './user-component/gatepass-list/gatepass-list.component';
import { GatepassidListComponent } from './user-component/gatepassid-list/gatepassid-list.component';
import { ReportLicenseManagementComponent } from './user-component/report-license-management/report-license-management.component';
import { ReportLifeCycleComponent } from './user-component/report-life-cycle/report-life-cycle.component';
import { ReportGoodsAndServicesComponent } from './user-component/report-goods-and-services/report-goods-and-services.component';
import { ItemWithPoInvoiceMovetoinventoryForAPeriodComponent } from './user-component/item-with-po-invoice-movetoinventory-for-a-period/item-with-po-invoice-movetoinventory-for-a-period.component';
import { PoApprovalMailComponent } from './user-component/po-approval-mail/po-approval-mail.component';
import { PoRejectionMailComponent } from './user-component/po-rejection-mail/po-rejection-mail.component';
import { MakeDirectpurchaseOrderComponent } from './user-component/make-directpurchase-order/make-directpurchase-order.component';
import { VendorApprovalMailComponent } from './user-component/vendor-approval-mail/vendor-approval-mail.component';
import { VendorRejectionMailComponent } from './user-component/vendor-rejection-mail/vendor-rejection-mail.component';
import { ReportServiceManagementComponent } from './user-component/report-service-management/report-service-management.component';
import { PaymentApprovalMailComponent } from './user-component/payment-approval-mail/payment-approval-mail.component';
import { PaymentRejectionMailComponent } from './user-component/payment-rejection-mail/payment-rejection-mail.component';
import { ReportAmcManagementComponent } from './user-component/report-amc-management/report-amc-management.component';

export const routes: Routes = [

  {
    path: '', component: UserComponent, canActivate: [AuthGuard],

    children: [
      { path: '', component: UserDashboardComponent },
      { path: 'user-dashboard', component: UserDashboardComponent },
      { path: 'assets', component: AssetsComponent },
      { path: 'category', component: CategoryComponent },
      { path: 'item', component: ProductComponent },
      { path: 'department', component: GroupComponent },
      { path: 'designation', component: DesignationComponent },
      { path: 'user-privilege', component: UserPrivilegeComponent },
      { path: 'location', component: LocationComponent },
      { path: 'add-user', component: AddUserComponent, canActivate: [UserRoleGuard] },
      { path: 'user-list', component: UserListComponent },
      { path: 'update-user/:id', component: UpdateUserComponent },
      { path: 'add-vendor', component: AddVendorComponent },
      { path: 'vendor-list', component: VendorListComponent },
      { path: 'make-purchase-order', component: MakePurchaseOrderComponent },
      { path: 'purchase-order-list', component: PurchaseOrderListComponent },
      { path: 'genarate-request', component: GenarateRequestComponent },
      { path: 'accepted-request', component: AcceptedRequestComponent },
      { path: 'pending-request', component: PendingRequestComponent },
      { path: 'rejected-request', component: RejectedRequestComponent },
      { path: 'upload-invoice', component: UploadInvoiceComponent },
      { path: 'upload-inspection-form', component: UploadInspectionFormComponent },
      { path: 'update-items', component: UpdateItemsComponent },
      { path: 'upload-scan-document', component: UploadScanDocumentComponent },
      { path: 'upload-scan-quotation', component: UploadScanQuotationComponent },
      { path: 'incoming-item-details', component: IncomingItemDetailsComponent },
      { path: 'company-registration', component: CompanyRegistrationComponent, canActivate: [SuperAdminGuard] },
      { path: 'moveto-itsm', component: MovetoItsmComponent },
      { path: 'newsystem-information', component: NewsystemInformationComponent, canActivate: [UserRoleGuard] },
      { path: 'system-information-list', component: SystemInformationListComponent },
      { path: 'transfer-stock', component: TransferStockComponent, canActivate: [UserRoleGuard] },
      { path: 'update-vendor/:id', component: UpdateVendorComponent },
      { path: 'report-active-vendor', component: ReportActiveSupplierComponent },
      { path: 'purchase-order-view/:pid', component: PurchaseOrderViewComponent },
      { path: 'vendor-evaluation/:pid', component: SupplierEvaluationComponent },
      { path: 'report-purchase-order', component: ReportPurchaseOrderComponent },
      { path: 'report-vendor-evaluation', component: ReportVendorEvaluationComponent },
      { path: 'report-direct-purchases', component: ReportUploadDocumentComponent },
      { path: 'report-items-list', component: ReportItemsListComponent },
      { path: 'received-request', component: ReceivedRequestComponent, canActivate: [SuperAdminGuard] },
      { path: 'received-purhchase-order', component: ReceivedPurchaseOrderComponent, canActivate: [SuperAdminGuard] },
      { path: 'report-pending-stock', component: ReportPendingStockComponent },
      { path: 'report-stock-in-hand', component: ReportStockInHandComponent },
      { path: 'report-total-assets', component: ReportCompleteAssetComponent },
      { path: 'edit-profile', component: EditProfileComponent },
      { path: 'system-detail/:transferto/:itemid', component: SystemDetailComponent },
      { path: 'report-item-with-price', component: ReportItemWithPriceComponent },
      { path: 'report-item-with-location', component: ReportItemWithLocationanduserComponent },
      { path: 'purchase-info/:pid', component: PurchaseInfoComponent },
      { path: 'report-item-with-warranty', component: ReportWarrantyItemsComponent },
      { path: 'report-scraped-item', component: ReportScrapedItemsComponent },
      { path: 'add-items', component: AddItemComponent, canActivate: [UserRoleGuard] },
      { path: 'gate-pass', component: GatepassComponent, canActivate: [UserRoleGuard] },
      { path: 'gate-pass-list/:id', component: GatepassListComponent },
      { path: 'gatepass-view', component: GatepassViewComponent },
      { path: 'gatepassid-list', component: GatepassidListComponent },
      { path: 'report-license-management', component: ReportLicenseManagementComponent },
      { path: 'report-service-management', component: ReportServiceManagementComponent },
      { path: 'report-service-management', component: ReportServiceManagementComponent },
      { path: 'report-amc-management', component: ReportAmcManagementComponent },
      { path: 'report-item-life-cycle', component: ReportLifeCycleComponent },
      { path: 'report-goods-and-services', component: ReportGoodsAndServicesComponent },
      { path: 'report-item-with-po-invoice-movetoinventory-for-a-period', component: ItemWithPoInvoiceMovetoinventoryForAPeriodComponent },
      //  {path:'make-directpurchase-order', component:MakeDirectpurchaseOrderComponent},
    ]
  },

  {
    path: 'po-approval-mail/:pid', component: PoApprovalMailComponent
  },

  {
    path: 'po-rejection-mail/:pid', component: PoRejectionMailComponent
  },
  {
    path: 'vendor-approval-mail/:vid', component: VendorApprovalMailComponent
  },

  {
    path: 'vendor-rejection-mail/:vid', component: VendorRejectionMailComponent
  },
  {
    path: 'payment-approval-mail/:pid', component: PaymentApprovalMailComponent
  },
  {
    path: 'payment-rejection-mail/:pid', component: PaymentRejectionMailComponent
  }



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
