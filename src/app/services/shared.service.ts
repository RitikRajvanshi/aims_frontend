import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { environment } from '../environments/environment.dev';
import { environment } from '../environments/environment.prod';
import { BehaviorSubject, Observable  } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SharedService {
  getCountofreceiveorders:any;
  getrequestCounts:any;
  totalCount:any;

  constructor(private httpClient: HttpClient) { }

  getsupplierdata() {
    let url = environment.SHARED_URL + environment.SHARED.GET_SUPPLIER_DATA;

    return this.httpClient.get(url);
  }

  getsupplierdatabyid(id: any) {
    let url = environment.SHARED_URL + environment.SHARED.GET_SUPPLIER_DATA_BYID;

    return this.httpClient.post(url, id);

  }



  getUsersdatabystatus() {
    let url = environment.SHARED_URL + environment.SHARED.GETUSERSDATABYSTATUS;

    return this.httpClient.get(url);
  }

  getUsersdatabyid(id: any) {
    let url = environment.SHARED_URL + environment.SHARED.GETUSERSDATABYID;

    return this.httpClient.post(url, id);
  }

  getProductdata() {
    let url = environment.SHARED_URL + environment.SHARED.GETPRODUCTDATA

    return this.httpClient.get(url);
  }

  //request

  getpendingRequest() {
    let url = environment.SHARED_URL + environment.SHARED.GETPENDINGREQUEST;

    return this.httpClient.get(url);
  }

  getpendingRequestByid(id: any) {
    let url = environment.SHARED_URL + environment.SHARED.GETPENDINGIREQUESTBYID;

    return this.httpClient.post(url, id);
  }

  getrejectedRequest() {
    let url = environment.SHARED_URL + environment.SHARED.GETREJECTEDREQUEST;

    return this.httpClient.get(url);
  }

  getacceptedRequest() {
    let url = environment.SHARED_URL + environment.SHARED.GETACCEPTEDREQUEST;

    return this.httpClient.get(url);
  }

  getPurchaseJoinData() {
    let url = environment.SHARED_URL + environment.SHARED.GETPURCHASEJOINDATA

    return this.httpClient.get(url);

  }

  getPurchaseJoinDatabyIdorpurchaseid(data: any) {
    let url = environment.SHARED_URL + environment.SHARED.GETPURCHASEJOINDATABYIDORPURCHASEID
    

    return this.httpClient.post(url, data);
  }

  getpurchasedatafromPurchaseOrder() {
    let url = environment.SHARED_URL + environment.SHARED.GETPURCHASEDATAFROMPURCHASEORDER

    return this.httpClient.get(url);

  }

  //admin ---> shared
  getsupplierdatabyname(name: any) {
    let url = environment.SHARED_URL + environment.SHARED.GET_SUPPLIERDATABY_NAME;

    return this.httpClient.post(url, name);

  }

  getlastPurchaseid() {
    let url = environment.SHARED_URL + environment.SHARED.GETLASTPURCHASEID

    return this.httpClient.get(url);

  }

  getpurchaseOrderdatabyPid(p_id: any) {
    let url = environment.SHARED_URL + environment.SHARED.GETPURCHASEORDERDATABYPID;

    return this.httpClient.post(url, p_id);
  }

  getpurchasedatafrompoacctoinvoice() {
    let url = environment.SHARED_URL + environment.SHARED.GETPURCHASEDATAFROMPOACCTOINVOICE

    return this.httpClient.get(url);
  }

  getpurchasedataforInvoice() {
    let url = environment.SHARED_URL + environment.SHARED.GETPURCHASEDATAFORINVOICE

    return this.httpClient.get(url);
  }


  getpurchasedatabyid(id: any) {
    let url = environment.SHARED_URL + environment.SHARED.GETPURCHASEJOINDATABYID

    return this.httpClient.post(url, id);
  }

  ////received date, inspection date, other column from invoice table(depreceated/dropped) table into purchase order
  getPurchaseJoinDatabyPid(id: any) {
    let url = environment.SHARED_URL + environment.SHARED.GETPURCHASEJOINDATABYPID

    return this.httpClient.post(url, id);
  }

  getinspectionDatafromarrayofpid(pid: any) {
    let url = environment.SHARED_URL + environment.SHARED.GETINPECTIONINFOFROMARRAYOFPID

    return this.httpClient.post(url, pid);
  }

  getPurchaseJoinDataby_id(id: any) {
    let url = environment.SHARED_URL + environment.SHARED.GETPURCHASEJOINDATABYID

    return this.httpClient.post(url, id);
  }

  getlastItemcode(data: any) {
    let url = environment.SHARED_URL + environment.SHARED.GETLASTITEMCODEFROMITEM

    return this.httpClient.post(url, data);
  }

  //supplier_evaluation
  getsupplierjoindatafrompo(pid: any) {
    let url = environment.SHARED_URL + environment.SHARED.GETSUPPLIERJOINDATAFROMPO

    return this.httpClient.post(url, pid);
  }

  getsupplierEvaluationdatabypid(pid: any) {
    let url = environment.SHARED_URL + environment.SHARED.GETSUPPLIEREVALUATIONDATABYPID

    return this.httpClient.post(url, pid);
  }

  getsupplierEvaluationdatabysupplierId(supplierid: any) {
    let url = environment.SHARED_URL + environment.SHARED.GETSUPPLIEREVALUATIONBYSUPPLIERID

    return this.httpClient.post(url, supplierid);
  }

  getvendorEvaluationjoindata() {
    let url = environment.SHARED_URL + environment.SHARED.GETVENDOREVALUATIONJOINDATA

    return this.httpClient.get(url);
  }


  getitemsData() {
    let url = environment.SHARED_URL + environment.SHARED.GETITEMSDATA

    return this.httpClient.get(url);
  }

  getitemsDatawithuserandlocation() {
    let url = environment.SHARED_URL + environment.SHARED.GETITEMDATAWITHUSERANDLOCATION

    return this.httpClient.get(url);
  }

  getCategorydata() {
    let url = environment.SHARED_URL + environment.SHARED.GETCATEGORYDATA

    return this.httpClient.get(url);
  }

  getDocumentdata() {
    let url = environment.SHARED_URL + environment.SHARED.GETDOCUMENTDATA

    return this.httpClient.get(url);
  }

  getDocumentdatabydocId(id: any) {
    let url = environment.SHARED_URL + environment.SHARED.GETDOCUMENTDATABYDOCUMENTID

    return this.httpClient.post(url, id);
  }

  //quotation 

  getQuotationdata() {
    let url = environment.SHARED_URL + environment.SHARED.GETQUOTATIONDATA

    return this.httpClient.get(url);
  }

  getQuotationdatabyId(id: any) {
    let url = environment.SHARED_URL + environment.SHARED.GETQUOTATIONDATABYID

    return this.httpClient.post(url, id);
  }

  getpurchaseorderdata() {
    let url = environment.SHARED_URL + environment.SHARED.GETPURCHASEORDERDATA

    return this.httpClient.get(url);
  }

  getpurchaseorderdata_acctoinvoiceupload() {
    let url = environment.SHARED_URL + environment.SHARED.GETPURCHASEORDERDATAACCTOINVOICEUPLOAD

    return this.httpClient.get(url);
  }
  //SEARCH AND FILTERS

  getsupplierdatabyDatefilter(data: any) {
    let url = environment.SHARED_URL + environment.SHARED.GET_SUPPLIERDATA_BYDATEFILTER;

    return this.httpClient.post(url, data);

  }

  getpurchasejoinDatabydate(data: any) {
    let url = environment.SHARED_URL + environment.SHARED.GETPURCHASEJOINDATABYDATE;

    return this.httpClient.post(url, data);

  }

  getpurchaseorderDatabydate(data: any) {
    let url = environment.SHARED_URL + environment.SHARED.GETPURCHASEORDERDATABYDATE;

    return this.httpClient.post(url, data);

  }

  getreportpurchaseorderDatabydate(data: any) {
    let url = environment.SHARED_URL + environment.SHARED.GETREPORTPURCHASEORDERDATABYDATE;

    return this.httpClient.post(url, data);

  }

  getreportpurchaseorderData() {
    let url = environment.SHARED_URL + environment.SHARED.GETREPORTPURCHASEORDERDATA;

    return this.httpClient.get(url);

  }

  getpurchaseorderDatabydateforasset(data: any) {
    let url = environment.SHARED_URL + environment.SHARED.GETPURCHASEORDERDATABYDATEFORASSET;

    return this.httpClient.post(url, data);

  }

  getsendpurchaseorderdata() {
    let url = environment.SHARED_URL + environment.SHARED.GETSENDPURCHASEORDERDATA

    return this.httpClient.get(url);
  }

  getCountofreceiveorder() {
    let url = environment.SHARED_URL + environment.SHARED.GETCOUNTOFRECEIVEDORDER

    return this.httpClient.get(url);
  }

  getCountofreceiverequest() {
    let url = environment.SHARED_URL + environment.SHARED.GETCOUNTOFRECEIVEDREQUEST

    return this.httpClient.get(url);
  }

  getCountofPruchaseOrder(dates:object) {
    let url = environment.SHARED_URL + environment.SHARED.GETCOUNTOFPURCHASEORDERS

    return this.httpClient.post(url, dates);
  }

  getpurchasedatathatareacceptorreject() {
    let url = environment.SHARED_URL + environment.SHARED.GETPURCHASEDATACCEPTORREJECT

    return this.httpClient.get(url);
  }

  getSumofpurchaseOrderbyDate(data: any) {
    let url = environment.SHARED_URL + environment.SHARED.GETSUMOFPURCHASEORDERSBYDATE

    return this.httpClient.post(url, data);
  }

  getCountofItemsbyDate(data: any) {
    let url = environment.SHARED_URL + environment.SHARED.GETCOUNTOFITEMSBYDATE

    return this.httpClient.post(url, data);
  }


  getreportItemwithPrice() {
    let url = environment.SHARED_URL + environment.SHARED.GETREPORTITEMWITHPRICE

    return this.httpClient.get(url);
  }

  // getreportItemwithPriceTwo() {
  //   let url = environment.SHARED_URL + environment.SHARED.GETREPORTITEMWITHPRICETWO

  //   return this.httpClient.get(url);
  // }

  getreportitemwithpoinvoicemovetoinvenotryforaperiod() {
    let url = environment.SHARED_URL + environment.SHARED.GETREPORTITEMWITHPOINVOICEMOVETOINVENTORYFORAPERIOD

    return this.httpClient.get(url);
  }

  getreportpendingStock() {
    let url = environment.SHARED_URL + environment.SHARED.GETREPORTPENDINGSTOCK

    return this.httpClient.get(url);
  }


  getreportStockinhand() {
    let url = environment.SHARED_URL + environment.SHARED.GETREPORTSTOCKINHAND

    return this.httpClient.get(url);
  }

  getfullassetbyDate(data: any) {
    let url = environment.SHARED_URL + environment.SHARED.GETFULLASSETBYDATE

    return this.httpClient.post(url, data);
  }

  gettotalPriceandItemsfrompi() {
    let url = environment.SHARED_URL + environment.SHARED.GETTOTALPRICEANDITEMSFROMPI

    return this.httpClient.get(url);
  }


  getCompanydata() {
    let url = environment.SHARED_URL + environment.SHARED.GETCOMPANYDATA

    return this.httpClient.get(url);
  }


  getCompanydatabycompanyName(name: any) {
    let url = environment.SHARED_URL + environment.SHARED.GETCOMPANYDATABYCOMPANYNAME

    return this.httpClient.post(url, name);
  }

  getproductdatajoinbystatus() {
    let url = environment.SHARED_URL + environment.SHARED.GETPRODUCTDATAJOINBYSTATUS;

    return this.httpClient.get(url);
  }

  getProductnamebyid(id:any) {
    let url = environment.SHARED_URL + environment.SHARED.GETPRODUCTNAMEBYID
    
    return this.httpClient.post(url, id);
  }

  getSystemsDatafromitems() {
    let url = environment.SHARED_URL + environment.SHARED.GETSYSTEMDATAFROMITEMS;

    return this.httpClient.get(url);
  }

  getRamDatafromitems() {
    let url = environment.SHARED_URL + environment.SHARED.GETRAMDATAFROMITEMS;

    return this.httpClient.get(url);
  }

  getSMPSfromitems(){
    let url = environment.SHARED_URL + environment.SHARED.GETSMPSDATAFROMITEMS;

    return this.httpClient.get(url);
  }

  getHDDfromitems(){
    let url = environment.SHARED_URL + environment.SHARED.GETHDDDATAFROMITEMS;

    return this.httpClient.get(url);
  }

  getgraphiccarddatafromitems(){
    let url = environment.SHARED_URL + environment.SHARED.GETGRAPHICCARDDATAFROMITEMS;

    return this.httpClient.get(url);
  }

  getitemsoptherthanCPU() {
    let url = environment.SHARED_URL + environment.SHARED.GETITEMSOTHERTHANCPU;

    return this.httpClient.get(url);
  }

  getitemsoptherthanCPUwithalllocation() {
    let url = environment.SHARED_URL + environment.SHARED.GETITEMSOTHERTHANCPUWITHALLLOCATION;

    return this.httpClient.get(url);
  }

  getitemsdatabyitemid(id:any) {
    // SAME AS below but NO NEED TO TOUCH IT

    let url = environment.SHARED_URL + environment.SHARED.GETSYSTEMDATABYITEMID;

    return this.httpClient.post(url, id);
  }
  
  getsystemDatabyitemId(id:any) {
    let url = environment.SHARED_URL + environment.SHARED.GETSYSTEMDATABYITEMID;

    return this.httpClient.post(url, id);
  }

  getitemsdatafromitemid(id:any){
    let url = environment.SHARED_URL + environment.SHARED.GETITEMSDATAFROMITEMID;

    return this.httpClient.post(url, id);
  }


  getsystemDataotherThanCPU(transferto:any) {
    let url = environment.SHARED_URL + environment.SHARED.GETSYSTEMDATAOTHERTHANCPU;

    return this.httpClient.post(url, transferto);
  }

  getSystemConfiguration(transferto:any) {
    let url = environment.SHARED_URL + environment.SHARED.GETSYSTEMCONFIG;

    return this.httpClient.post(url, transferto);
  }

    getTransferHistory(itemId:any) {
    let url = environment.SHARED_URL + environment.SHARED.GETTRANSFERHISTORY;

    return this.httpClient.post(url, itemId);
  }

  getSystemDatafromtransferstock() {
    let url = environment.SHARED_URL + environment.SHARED.GETSYSTEMDATAFROMTRANSFERSTOCK;

    return this.httpClient.get(url);
  }

  getCountofassetItems(){
    let url = environment.SHARED_URL + environment.SHARED.GETCOUNTASSETITEMS;

    return this.httpClient.get(url);
  }

  //new for asset count
   getCountofassetItemswithcurrrency(){
    let url = environment.SHARED_URL + environment.SHARED.GETCOUNTASSETITEMSWITHCURRENCY;

    return this.httpClient.get(url);
  }

  getLocationbyitemid(itemid:any){
    let url = environment.SHARED_URL + environment.SHARED.GETLOCATIONBYITEMID;

    return this.httpClient.post(url, itemid);
  }

  getactivevendorbydate(date:any){
    let url = environment.SHARED_URL + environment.SHARED.GETACTIVEVENDORSBYDATE;

    return this.httpClient.post(url, date);
  }

  getitemswithwarranty(){
    let url = environment.SHARED_URL + environment.SHARED.GETITEMSWITHWARRANTY;

    return this.httpClient.get(url);
  }

  getSysteminformationList(){
    let url = environment.SHARED_URL + environment.SHARED.GETSYSTEMINFORMATIONLIST;

    return this.httpClient.get(url);
  }

  //systeminfo tables

  getAssigneditemsfromts(){
    let url = environment.SHARED_URL + environment.SHARED.GETASSIGNEDITEMSFROMTS;

    return this.httpClient.get(url);
  }

  getAssigneditemsfromsysteminfo(){
    let url = environment.SHARED_URL + environment.SHARED.GETASSINGEDITEMFROMSYSTEMINFO;

    return this.httpClient.get(url);
  }

  getitemdatafromitemcode(item_code:any) {
    let url = environment.SHARED_URL + environment.SHARED.GETITEMDATAFROMITEMCODE;

    return this.httpClient.post(url, item_code);
  }

  getallusershavingsystem() {
    let url = environment.SHARED_URL + environment.SHARED.GETALLUSERHAVINGSYSTEM;

    return this.httpClient.get(url);
  }

  
  gettransferstockdata() {
    let url = environment.SHARED_URL + environment.SHARED.GETTRANSFERSTOCKDATA;

    return this.httpClient.get(url);
  }

  getscrapedgiftedsoldoutdatafromitems() {
    let url = environment.SHARED_URL + environment.SHARED.GETSCRAPEDGIFTEDSOLDOUTDATAFROMITEMS;

    return this.httpClient.get(url);
  }

  generateNextItemCode(data:any) {
    let url = environment.SHARED_URL + environment.SHARED.GENERATENEXTITEMCODE;

    return this.httpClient.post(url, data);
  }

  getgeneratedNextItemCode(data:any) {
    let url = environment.SHARED_URL + environment.SHARED.GETGENERATEDNEXTITEMCODE;

    return this.httpClient.post(url, data);
  }

  getlastrowfromgatepassid() {
    let url = environment.SHARED_URL + environment.SHARED.GETLASTROWFROMPASSID;

    return this.httpClient.get(url);
  }
  
  getgatepassdatabyid(data:any) {
    let url = environment.SHARED_URL + environment.SHARED.GETGATEPASSDATABYID;

    return this.httpClient.post(url,data);
  }

  getgatepassdatafromtblgatepassid() {
    let url = environment.SHARED_URL + environment.SHARED.GETGATEPASSDATAFROMTBLGATEPASSID;

    return this.httpClient.get(url);
  }

  getcountsendgatepasses() {
    let url = environment.SHARED_URL + environment.SHARED.COUNTSENDGATEPASSES;

    return this.httpClient.get(url);
  }

  //CREATED ON 07/04/2024
  getitemsforusers(data:any) {
    let url = environment.SHARED_URL + environment.SHARED.GETITEMSFORUSERS;

    return this.httpClient.post(url,data);
  }

  getassigneditemstouserfromts() {
    let url = environment.SHARED_URL + environment.SHARED.GETASSIGNEDITEMSTOUSERFROMTS;

    return this.httpClient.get(url);
  }

  getLicenseReport() {
    let url = environment.SHARED_URL + environment.SHARED.GETLICENSEREPORT;

    return this.httpClient.get(url);
  }

  getLifecycleReport() {
    let url = environment.SHARED_URL + environment.SHARED.GETLIFECYCLEREPORT;

    return this.httpClient.get(url);
  }

  
  getGoodsandServices() {
    let url = environment.SHARED_URL + environment.SHARED.GETGOODSANDSERVICES;

    return this.httpClient.get(url);
  }

  getLastdirectpurchaseId() {
    let url = environment.SHARED_URL + environment.SHARED.GETLASTDIRECTPURCHASEID;

    return this.httpClient.get(url);
  }

  getCurrency() {
    let url = environment.SHARED_URL + environment.SHARED.GETALLCURRENCY;

    return this.httpClient.get(url);
  }

  getpurchaseidsnotinitems(){
    let url = environment.SHARED_URL + environment.SHARED.GETPURCHASEIDNOTINITEMS;

    return this.httpClient.get(url);
  }


//   limitToTwoDecimals(event: any) {
//   const input = event.target.value;
//   const key = event.key;

//   // Allow control keys (backspace, delete, arrows, etc.)
//   if (key === 'Backspace' || key === 'Delete' || key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Tab') {
//     return;
//   }

//   // Allow only digits and decimal point
//   if (!/[0-9.]/.test(key)) {
//     event.preventDefault();
//     return;
//   }

//   // Prevent more than one decimal point
//   if (key === '.' && input.includes('.')) {
//     event.preventDefault();
//     return;
//   }

//   // Prevent more than two digits after decimal
//   const decimalIndex = input.indexOf('.');
//   if (decimalIndex !== -1) {
//     const decimalPart = input.substring(decimalIndex + 1);
//     if (decimalPart.length >= 2) {
//       event.preventDefault();
//     }
//   }
// }

// limitToTwoDecimals(event: ClipboardEvent | KeyboardEvent) {
//   const input = event.target as HTMLInputElement;

//   // Handle paste event
//   if (event.type === 'paste') {
//     const clipboardData = (event as ClipboardEvent).clipboardData || (window as any).clipboardData;
//     const pastedText = clipboardData?.getData('text') || '';
//     let newValue = pastedText.trim();

//     // If not a valid number, stop it
//     if (!/^\d*\.?\d*$/.test(newValue)) {
//       event.preventDefault();
//       return;
//     }

//     // If it has more than two decimals, trim it
//     if (newValue.includes('.')) {
//       const [intPart, decPart] = newValue.split('.');
//       newValue = `${intPart}.${decPart.substring(0, 2)}`;
//     }

//     // Prevent default paste and manually insert corrected value
//     event.preventDefault();
//     input.value = newValue;

//     // Manually trigger input event so Angular formControl updates
//     const inputEvent = new Event('input', { bubbles: true });
//     input.dispatchEvent(inputEvent);

//     return;
//   }

//   const key = (event as KeyboardEvent).key;

//   // Allow control keys
//   if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
//     return;
//   }

//   // Allow only digits and decimal point
//   if (!/[0-9.]/.test(key)) {
//     event.preventDefault();
//     return;
//   }

//   // Prevent multiple decimal points
//   if (key === '.' && input.value.includes('.')) {
//     event.preventDefault();
//     return;
//   }

//   // Prevent more than 2 digits after decimal
//   const decimalIndex = input.value.indexOf('.');
//   if (decimalIndex !== -1) {
//     const decimalPart = input.value.substring(decimalIndex + 1);
//     if (decimalPart.length >= 2) {
//       event.preventDefault();
//     }
//   }
// }


onDecimalInput(event: Event) {
  const input = event.target as HTMLInputElement;
  let value = input.value;

  // Allow only digits and at most one dot
  value = value.replace(/[^0-9.]/g, '');

  // If more than one dot, keep only first
  const parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }

  // Limit to 2 decimal places
  if (parts.length === 2 && parts[1].length > 2) {
    parts[1] = parts[1].slice(0, 2);
    value = parts.join('.');
  }

  // Update input if sanitized value differs
  if (value !== input.value) {
    const caret = value.length;
    input.value = value;
    input.setSelectionRange(caret, caret);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

onDecimalPaste(event: ClipboardEvent) {
  event.preventDefault();
  const input = event.target as HTMLInputElement;
  const text = (event.clipboardData || (window as any).clipboardData).getData('text');
  let value = text.replace(/[^0-9.]/g, '');

  // Same cleanup logic
  const parts = value.split('.');
  if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
  if (parts.length === 2 && parts[1].length > 2) {
    parts[1] = parts[1].slice(0, 2);
    value = parts.join('.');
  }

  // Insert paste text
  const start = input.selectionStart || 0;
  const end = input.selectionEnd || 0;
  const newValue = input.value.slice(0, start) + value + input.value.slice(end);
  input.value = newValue;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}







}
