'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">imsappp documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AppModule-0ddf92f92277a3626ef9e7632d37332b9258a495277601f03726995798ace7273dba5bc040ba12c830358664188554a3b134a1f3a5fd00d783905137d4b20055"' : 'data-bs-target="#xs-components-links-module-AppModule-0ddf92f92277a3626ef9e7632d37332b9258a495277601f03726995798ace7273dba5bc040ba12c830358664188554a3b134a1f3a5fd00d783905137d4b20055"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-0ddf92f92277a3626ef9e7632d37332b9258a495277601f03726995798ace7273dba5bc040ba12c830358664188554a3b134a1f3a5fd00d783905137d4b20055"' :
                                            'id="xs-components-links-module-AppModule-0ddf92f92277a3626ef9e7632d37332b9258a495277601f03726995798ace7273dba5bc040ba12c830358664188554a3b134a1f3a5fd00d783905137d4b20055"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ChangePasswordComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChangePasswordComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CompanyRegistrationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CompanyRegistrationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ForgetPasswordComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ForgetPasswordComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoginComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LoginComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link" >AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/UserModule.html" data-type="entity-link" >UserModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-UserModule-d04fe6029bf85d38309f560161fc6db23a305b16ab0e4800d60d91d6169f58cbe6205604abbd7f50c1ea19e1d454bf498e4c0ae3dc6a79d509933a0eca10a6f8"' : 'data-bs-target="#xs-components-links-module-UserModule-d04fe6029bf85d38309f560161fc6db23a305b16ab0e4800d60d91d6169f58cbe6205604abbd7f50c1ea19e1d454bf498e4c0ae3dc6a79d509933a0eca10a6f8"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-UserModule-d04fe6029bf85d38309f560161fc6db23a305b16ab0e4800d60d91d6169f58cbe6205604abbd7f50c1ea19e1d454bf498e4c0ae3dc6a79d509933a0eca10a6f8"' :
                                            'id="xs-components-links-module-UserModule-d04fe6029bf85d38309f560161fc6db23a305b16ab0e4800d60d91d6169f58cbe6205604abbd7f50c1ea19e1d454bf498e4c0ae3dc6a79d509933a0eca10a6f8"' }>
                                            <li class="link">
                                                <a href="components/AcceptedRequestComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AcceptedRequestComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AddItemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AddItemComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AddUserComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AddUserComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AddVendorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AddVendorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AssetsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AssetsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CategoryComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategoryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CompanyRegistrationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CompanyRegistrationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DesignationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DesignationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditProfileComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditProfileComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GatepassComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GatepassComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GatepassListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GatepassListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GatepassViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GatepassViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GatepassidListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GatepassidListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GenarateRequestComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GenarateRequestComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GroupComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GroupComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/IncomingItemDetailsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >IncomingItemDetailsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ItemWithPoInvoiceMovetoinventoryForAPeriodComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ItemWithPoInvoiceMovetoinventoryForAPeriodComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LocationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LocationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MakeDirectpurchaseOrderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MakeDirectpurchaseOrderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MakePurchaseOrderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MakePurchaseOrderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MovetoItsmComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MovetoItsmComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NewsystemInformationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NewsystemInformationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PendingRequestComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PendingRequestComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PoApprovalMailComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PoApprovalMailComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PoRejectionMailComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PoRejectionMailComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProductComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PurchaseInfoComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PurchaseInfoComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PurchaseOrderListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PurchaseOrderListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PurchaseOrderViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PurchaseOrderViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReceivedPurchaseOrderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReceivedPurchaseOrderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReceivedRequestComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReceivedRequestComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReceivedRequestModalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReceivedRequestModalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RejectedRequestComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RejectedRequestComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReportActiveSupplierComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportActiveSupplierComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReportCompleteAssetComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportCompleteAssetComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReportGoodsAndServicesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportGoodsAndServicesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReportItemWithLocationanduserComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportItemWithLocationanduserComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReportItemWithPriceComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportItemWithPriceComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReportItemsListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportItemsListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReportLicenseManagementComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportLicenseManagementComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReportLifeCycleComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportLifeCycleComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReportPendingStockComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportPendingStockComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReportPurchaseOrderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportPurchaseOrderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReportScrapedItemsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportScrapedItemsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReportStockInHandComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportStockInHandComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReportUploadDocumentComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportUploadDocumentComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReportVendorEvaluationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportVendorEvaluationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReportWarrantyItemsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportWarrantyItemsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SupplierEvaluationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SupplierEvaluationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SystemDetailComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SystemDetailComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SystemInformationListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SystemInformationListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TransferStockComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TransferStockComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UpdateItemsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UpdateItemsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UpdateUserComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UpdateUserComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UpdateVendorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UpdateVendorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UploadInspectionFormComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UploadInspectionFormComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UploadInvoiceComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UploadInvoiceComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UploadScanDocumentComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UploadScanDocumentComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UploadScanQuotationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UploadScanQuotationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UserComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UserDashboardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserDashboardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UserListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UserPrivilegeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserPrivilegeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/VendorApprovalMailComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >VendorApprovalMailComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/VendorEvaluationModalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >VendorEvaluationModalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/VendorListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >VendorListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/VendorRejectionMailComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >VendorRejectionMailComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#directives-links-module-UserModule-d04fe6029bf85d38309f560161fc6db23a305b16ab0e4800d60d91d6169f58cbe6205604abbd7f50c1ea19e1d454bf498e4c0ae3dc6a79d509933a0eca10a6f8"' : 'data-bs-target="#xs-directives-links-module-UserModule-d04fe6029bf85d38309f560161fc6db23a305b16ab0e4800d60d91d6169f58cbe6205604abbd7f50c1ea19e1d454bf498e4c0ae3dc6a79d509933a0eca10a6f8"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UserModule-d04fe6029bf85d38309f560161fc6db23a305b16ab0e4800d60d91d6169f58cbe6205604abbd7f50c1ea19e1d454bf498e4c0ae3dc6a79d509933a0eca10a6f8"' :
                                        'id="xs-directives-links-module-UserModule-d04fe6029bf85d38309f560161fc6db23a305b16ab0e4800d60d91d6169f58cbe6205604abbd7f50c1ea19e1d454bf498e4c0ae3dc6a79d509933a0eca10a6f8"' }>
                                        <li class="link">
                                            <a href="directives/PositiveNumberDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PositiveNumberDirective</a>
                                        </li>
                                    </ul>
                                </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UserModule-d04fe6029bf85d38309f560161fc6db23a305b16ab0e4800d60d91d6169f58cbe6205604abbd7f50c1ea19e1d454bf498e4c0ae3dc6a79d509933a0eca10a6f8"' : 'data-bs-target="#xs-injectables-links-module-UserModule-d04fe6029bf85d38309f560161fc6db23a305b16ab0e4800d60d91d6169f58cbe6205604abbd7f50c1ea19e1d454bf498e4c0ae3dc6a79d509933a0eca10a6f8"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UserModule-d04fe6029bf85d38309f560161fc6db23a305b16ab0e4800d60d91d6169f58cbe6205604abbd7f50c1ea19e1d454bf498e4c0ae3dc6a79d509933a0eca10a6f8"' :
                                        'id="xs-injectables-links-module-UserModule-d04fe6029bf85d38309f560161fc6db23a305b16ab0e4800d60d91d6169f58cbe6205604abbd7f50c1ea19e1d454bf498e4c0ae3dc6a79d509933a0eca10a6f8"' }>
                                        <li class="link">
                                            <a href="injectables/IdleService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >IdleService</a>
                                        </li>
                                    </ul>
                                </li>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#pipes-links-module-UserModule-d04fe6029bf85d38309f560161fc6db23a305b16ab0e4800d60d91d6169f58cbe6205604abbd7f50c1ea19e1d454bf498e4c0ae3dc6a79d509933a0eca10a6f8"' : 'data-bs-target="#xs-pipes-links-module-UserModule-d04fe6029bf85d38309f560161fc6db23a305b16ab0e4800d60d91d6169f58cbe6205604abbd7f50c1ea19e1d454bf498e4c0ae3dc6a79d509933a0eca10a6f8"' }>
                                            <span class="icon ion-md-add"></span>
                                            <span>Pipes</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="pipes-links-module-UserModule-d04fe6029bf85d38309f560161fc6db23a305b16ab0e4800d60d91d6169f58cbe6205604abbd7f50c1ea19e1d454bf498e4c0ae3dc6a79d509933a0eca10a6f8"' :
                                            'id="xs-pipes-links-module-UserModule-d04fe6029bf85d38309f560161fc6db23a305b16ab0e4800d60d91d6169f58cbe6205604abbd7f50c1ea19e1d454bf498e4c0ae3dc6a79d509933a0eca10a6f8"' }>
                                            <li class="link">
                                                <a href="pipes/SearchFilterPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SearchFilterPipe</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/UserRoutingModule.html" data-type="entity-link" >UserRoutingModule</a>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/CompanyRegistrationComponent-1.html" data-type="entity-link" >CompanyRegistrationComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AdminService.html" data-type="entity-link" >AdminService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthGuard.html" data-type="entity-link" >AuthGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CheckService.html" data-type="entity-link" >CheckService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ErrorHandlingService.html" data-type="entity-link" >ErrorHandlingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FilesService.html" data-type="entity-link" >FilesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/IdleService.html" data-type="entity-link" >IdleService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LoginService.html" data-type="entity-link" >LoginService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SharedService.html" data-type="entity-link" >SharedService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UsersService.html" data-type="entity-link" >UsersService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interceptors-links"' :
                            'data-bs-target="#xs-interceptors-links"' }>
                            <span class="icon ion-ios-swap"></span>
                            <span>Interceptors</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="interceptors-links"' : 'id="xs-interceptors-links"' }>
                            <li class="link">
                                <a href="interceptors/TokenInterceptor.html" data-type="entity-link" >TokenInterceptor</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/CompanyRegistrationGuard.html" data-type="entity-link" >CompanyRegistrationGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/SuperAdminGuard.html" data-type="entity-link" >SuperAdminGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/UserRoleGuard.html" data-type="entity-link" >UserRoleGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Item.html" data-type="entity-link" >Item</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Item-1.html" data-type="entity-link" >Item</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/itemsDatatypes.html" data-type="entity-link" >itemsDatatypes</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TransferStockData.html" data-type="entity-link" >TransferStockData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TransferStockData-1.html" data-type="entity-link" >TransferStockData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TransferStockItem.html" data-type="entity-link" >TransferStockItem</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});