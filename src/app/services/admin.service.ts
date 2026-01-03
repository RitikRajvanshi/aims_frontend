import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment.prod';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  // the below is behaviorsubject for sending data from one component to another
  private selectedItemSubject = new BehaviorSubject<any>(null);

  private searchTermSource = new BehaviorSubject<string>('');

  selectedItem$ = this.selectedItemSubject.asObservable();

  private emitNewValue = true;
  currentSearchTerm = this.searchTermSource.asObservable();

  constructor(private httpClient: HttpClient) { }

  addCategoryservice(data: any) {

    let url = environment.ADMIN_URL + environment.ADMIN.ADD_CATEGORY;

    return this.httpClient.post(url, data);

  }

  updatecategoryservice(data: any) {

    let url = environment.ADMIN_URL + environment.ADMIN.UPDATE_CATEGORY;

    return this.httpClient.put(url, data);

  }

  addGroupService(data: any) {

    let url = environment.ADMIN_URL + environment.ADMIN.ADD_GROUP;

    return this.httpClient.post(url, data);

  }

  updategroupData(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.UPDATEGRP

    return this.httpClient.post(url, data);

  }

  addDesignationService(data: any) {

    let url = environment.ADMIN_URL + environment.ADMIN.ADD_DESIGNATION;

    return this.httpClient.post(url, data);

  }

  updateDesingationData(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.UPDATEDESIGNATION

    return this.httpClient.post(url, data);
  }

  addPrvilegeService(data: any) {

    let url = environment.ADMIN_URL + environment.ADMIN.ADD_PRIVILEGE;

    return this.httpClient.post(url, data);

  }

  updateprivilegeData(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.UPDATEPRIVILEGE

    return this.httpClient.post(url, data);

  }

  addLocationservice(data: any) {

    let url = environment.ADMIN_URL + environment.ADMIN.ADD_LOCATION;

    return this.httpClient.post(url, data);

  }


  updatelocationservice(data: any) {

    let url = environment.ADMIN_URL + environment.ADMIN.UPDATE_LOCATION;

    return this.httpClient.put(url, data);

  }

  addProductService(data: any) {

    let url = environment.ADMIN_URL + environment.ADMIN.ADD_PRODUCT;

    return this.httpClient.post(url, data);

  }

  updateProductservice(data: any) {

    let url = environment.ADMIN_URL + environment.ADMIN.UPDATE_PRODUCT;

    return this.httpClient.put(url, data);
  }



  addSupplierservice(data: any) {

    let url = environment.ADMIN_URL + environment.ADMIN.ADD_SUPPLIER;

    return this.httpClient.post(url, data);

  }

  updateSupplierservice(data: any) {

    let url = environment.ADMIN_URL + environment.ADMIN.UPDATE_SUPPLIER;

    return this.httpClient.put(url, data);

  }

  deletesupplierdata(id: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.DELETE_SUPPLIER_DATA

    return this.httpClient.post(url, id);
  }

  addUser(data: any) {

    let url = environment.ADMIN_URL + environment.ADMIN.ADD_USER

    return this.httpClient.post(url, data);

  }

  deactivateUserStatusbyid(id: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.DEACTIVATEUSERSTATUSBYID

    return this.httpClient.post(url, id);
  }

  updateUser(data: any) {

    let url = environment.ADMIN_URL + environment.ADMIN.UPDATEUSER

    return this.httpClient.post(url, data)
  }

  generateReq(data: any) {

    let url = environment.ADMIN_URL + environment.ADMIN.GENERATEREQUEST

    return this.httpClient.post(url, data);

  }

  makePurchaseOrder(data: any) {

    let url = environment.ADMIN_URL + environment.ADMIN.MAKEPRUCHASEORDER;

    return this.httpClient.post(url, data);

  }

  makenewPurchaseOrder(data: any) {

    let url = environment.ADMIN_URL + environment.ADMIN.MAKENEWPRUCHASEORDER;

    return this.httpClient.post(url, data);

  }


  updatePurchaseItemforholdingstock(data: any) {

    let url = environment.ADMIN_URL + environment.ADMIN.UPDATEPURCHASEITEMFORHOLDINGSTOCK;

    return this.httpClient.post(url, data);

  }


  updateSentinpurchaseOrder(data: any) {

    let url = environment.ADMIN_URL + environment.ADMIN.UPDATESENTINPURCHASEORDER;

    return this.httpClient.post(url, data);

  }

  updatesentaApprovedinpurchaseOrder(data: any) {

    let url = environment.ADMIN_URL + environment.ADMIN.UPDATESENTAPPROVEDPURCHASEORDER;

    return this.httpClient.post(url, data);

  }

  updatesentaRejectinpurchaseOrder(data: any) {

    let url = environment.ADMIN_URL + environment.ADMIN.UPDATESENTREJECTPURCHASEORDER;

    return this.httpClient.post(url, data);

  }

  addinspectioninPI(data: any) {

    let url = environment.ADMIN_URL + environment.ADMIN.ADDINSPECTIONINPI;

    return this.httpClient.post(url, data);

  }

  addmultipleinspectioninPI(data: any) {

    let url = environment.ADMIN_URL + environment.ADMIN.ADDMULTIPLEINSPECTIONINPI;

    return this.httpClient.post(url, data);

  }

  //add items after inspection automatically....
  addItem(jsonbdata: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.ADDITEM;

    return this.httpClient.post(url, jsonbdata);

  }

  addsupplierEvaluation(data: any) {

    let url = environment.ADMIN_URL + environment.ADMIN.ADDSUPPLIEREVALUATION;

    return this.httpClient.post(url, data);

  }

  updateItem(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.UPDATEITEM;

    return this.httpClient.post(url, data);

  }

  updateRequestGrantedQuntity(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.UPDATEREQUESTGRANTEDQUANTITY

    return this.httpClient.post(url, data);

  }

  registerCompany(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.COMPANYREGISTRATION

    return this.httpClient.post(url, data);

  }

  transferStock(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.TRANSFERSTOCK;

    return this.httpClient.post(url, data);
  }

  transferStockformultipledata(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.TRANSFERSTOCKFORMULTIPLEDATA;

    return this.httpClient.post(url, data);
  }

  updatelocationinitemandtransferstock(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.UPDATELOCATIONINITEMANDTRANSFERSTOCK;

    return this.httpClient.post(url, data);
  }

  updateisactiveinpiforitems(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.UPDATEISACTIVEINPIFORITEMS;

    return this.httpClient.post(url, data);
  }

  deleteSysteminfo(sid: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.DELETESYSTEMINFORMATION;

    return this.httpClient.post(url, sid);
  }


  addSysteminfo(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.ADDSYSTEMINFO;

    return this.httpClient.post(url, data);
  }

  updateSysteminfo(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.UPDATESYSTEMINFO;

    return this.httpClient.post(url, data);
  }

  updateuserinSysteminfo(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.UPDATEUSERINSYSTEMINFO;

    return this.httpClient.post(url, data);
  }

  updatescrappediteminSysteminfo(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.UPDATESCRAPPEDITEMINSYSTEMINFO;

    return this.httpClient.post(url, data);
  }

  insertmultipleitemsinitemstable(itemsdata: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.INSERTMULTIPLEITEMSINITEMSTABLE;

    return this.httpClient.post(url, itemsdata);
  }

  updatePO(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.UPDATEPO;

    return this.httpClient.post(url, data);
  }

  deletePO(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.DELETE_PO;

    return this.httpClient.post(url, data);
  }

  updatelastitemcode(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.UPDATELASTITEMCODE;

    return this.httpClient.post(url, data);
  }


  savegatepass(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.SAVEGATEPASS;

    return this.httpClient.post(url, data);
  }

  receiveditemfromuserforgp(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.RECEIVEDITEMFROMUSERFORGP;

    return this.httpClient.post(url, data);
  }

  sendgatepassforapproval(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.SENDGATEPASSFORAPPROVAL;

    return this.httpClient.post(url, data);
  }

  gatepassapproval(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.GATEPASSAPPROVAL;

    return this.httpClient.post(url, data);
  }

  gatepassrejection(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.GATEPASSREJECTION;

    return this.httpClient.post(url, data);
  }


  deleteitemsfromItemsandSysteminfo(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.DELETEITEMSFROMITEMSANDSYSTEMINFO;

    return this.httpClient.post(url, data);
  }

  poapprovalmail(purchase_id: any) {
    const purchaseid = encodeURIComponent(purchase_id);
    let url = environment.ADMIN_URL + environment.ADMIN.POAPPROVALMAIL + '/' + purchaseid;

    return this.httpClient.get(url);
  }

  porejectionmail(purchase_id: string, rejection_reason: string) {
    const rejectionReason = {
      purchase_id: purchase_id,
      rejection_reason: rejection_reason
    };

    let url = environment.ADMIN_URL + environment.ADMIN.POREJECTIONMAIL;

    return this.httpClient.post(url, rejectionReason);
  }

  updateItemStatus(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.UPDATEITEMSTATUS;

    return this.httpClient.post(url, data);
  }

  sentMailforverification(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.SENTMAILFORVERIFICATION;

    return this.httpClient.post(url, data);
  }

  approveorrejectVendor(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.APPROVEORREJECTVENDOR;

    return this.httpClient.post(url, data);
  }

  sendvendorApprovalmail(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.SENDVENDORAPPROVALMAIL;

    return this.httpClient.post(url, data);
  }

  

 extendLifecycle(data: any) {
    let url = environment.ADMIN_URL + environment.ADMIN.EXTENDLIFECYCLE;

    return this.httpClient.post(url, data);
  }



  // the below code is used to send data of system data from system information list to new system information for updation.
  // sendSelectedItem(item: any) {
  //   console.log(item, "valueofsubjectbehavior");
  //   this.selectedItemSubject.next(item); // Emit selected item
  // }

  sendSelectedItem(item: any) {
    if (this.emitNewValue) {
      this.selectedItemSubject.next(item);
      this.emitNewValue = false;
    }
  }

  // resetSelectedItem() {
  //   this.emitNewValue = true;
  // }

  resetSelectedItem(): void {
    this.emitNewValue = true;

    this.selectedItemSubject.next(null);
  }

  changeSearchTerm(searchTerm: string): void {
    this.searchTermSource.next(searchTerm);
  }

  getSelectedItemValue() {
    return this.selectedItemSubject.getValue(); // This is safe!
  }
}
