import { Component } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FilesService } from 'src/app/services/files.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { environment } from 'src/app/environments/environment.prod';
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { firstValueFrom, of } from 'rxjs';
import { CheckService } from 'src/app/services/check.service';

@Component({
  selector: 'app-upload-invoice',
  templateUrl: './upload-invoice.component.html',
  styleUrls: ['./upload-invoice.component.scss']
})
export class UploadInvoiceComponent {
  baseUrl: any;
  invoiceForm: any;
  searchTerm = '';

  purchaseData = {
    purchase_id: '',
    invoice_no: '',
    modified_date: '',
    modified_by: localStorage.getItem('login_id'),
    filename: '',
    filepath: '',
    mimetype: '',
    invoice_remark: '',
    invoice_date:'',
    invoice_amount:0,
  }

  vendorname: any;

  //have to upload only invoice
  purchaseData2 = {
    purchase_id: '',
    invoice_no: '',
    modified_date: '',
    modified_by: localStorage.getItem('login_id'),
    invoice_remark: '',
    invoice_date: '',
    invoice_amount: 0,
  }

  purchaseIdobj = {
    purchase_id: ''
  }

  purchasedata: any;                  //according to invoice
  purchasedataArray: any = [];
  selectedpurchaseData: any;
  searchText = '';                    //for seaching purchase Id
  // display: boolean = false;           //for show/hide list of purchase Id
  files: any;
  toggleListBtn = true;
  toggleAddbtn = false;
  displayuploadInvoice = true;                    //for displaying add button
  displayupdateInvoice = false;                   //for displaying update button
  displayInvoicecontainer = true;
  displayemptydatamsg = false;
  readonly = false;                   //property binding for purchase_id formcontrol
  getpurchaseDatafrompo: any;
  purchaseId: any;
  uploadFileandgetData: any;
  submitted = false;
  uploadProgress: any;
  // Add a class to the progress bar to apply the custom styles
  progressBarClass: string = 'mat-progress-bar-primary';
  isDataorNot: boolean = true;
  empltyDataList = [];
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];
  currentdate: any;
  itemsData: any[] = [];
  filteredinvoicedata: any;
  invoicebydate = {
    start_date: '',
    end_date: ''
  };
  totalItems: number = 0;
  isExpanded: boolean = false;
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  isRotating:boolean = false;
  sortingorder:any;
  itemsperPage:any = 20;
  sumofamount:any;
  getPurchaseData:any[]=[];
  currency:string='';

  constructor(public sharedService: SharedService, private filesService: FilesService, private router: Router, private spinner: NgxSpinnerService, private checkService:CheckService) {
    const today = moment();
    this.currentdate = today.format('YYYY-MM-DD');
  }

  ngOnInit(): void {
    this.validation();
    this.getCurrentDate();
    this.getPurchaseDataAcctoinvoice();
    this.getPurchaseDataFromPO();
    this.baseUrl = environment.BASE_URL;
  }

  getCurrentDate() {
    this.purchaseData.modified_date = this.currentdate;
    this.purchaseData2.modified_date = this.currentdate;
  }

  async getPurchaseDataAcctoinvoice() {
    try {
      const results: any = await this.sharedService.getpurchasedatafrompoacctoinvoice().pipe(
        retry(3), // Retry the request up to 3 times
        // catchError((error: HttpErrorResponse) => {
        //   console.error('Error fetching accepted requests:', error);
        //   return of([]); // Return an empty array if an error occurs
        // })
      ).toPromise();

      console.log(results, "getPurchaseDataAcctoinvoice");

      this.purchasedata = results.filter((e: any) => {
        return e.is_sent == 2;
      });
    }
    catch (error) {
      console.error(error, 'Internal Server Error!')
    }
  }

  async getPurchaseDataFromPO() {
    this.spinner.show();
    try {
      const results: any = await this.sharedService.getpurchasedataforInvoice().pipe(
        retry(3), // Retry the request up to 3 times
        // catchError((error: HttpErrorResponse) => {
        //   console.error('Error fetching accepted requests:', error);
        //   return of([]); // Return an empty array if an error occurs
        // })
      ).toPromise();

      console.log(results, "results");

      if (results?.length == 0) {
        this.isDataorNot = false;
      }
      else {
        this.isDataorNot = true;
        const filteredResults = results.map((item: any) => {
           const splitmodifieddate = item.modified_date?moment(item.modified_date).format('DD-MM-YYYY'):null;
            const splitcreateddate = item.created_date?moment(item.created_date).format('DD-MM-YYYY'):null;
            const splitinvoicedate = item.invoice_date?moment(item.invoice_date).format('DD-MM-YYYY'):null;
            return { ...item, created_date: splitcreateddate, modified_date: splitmodifieddate, invoice_date:splitinvoicedate };
        });

        console.log(filteredResults, "filteredResults");
        this.filteredinvoicedata = filteredResults;
        this.getSumofAmount(filteredResults);
        this.itemsData = filteredResults;
        this.count = filteredResults.length;
      }
    }
    catch (error: unknown) {
      if (error instanceof HttpErrorResponse && error.status === 403) {
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Token expired.',
          footer: '<a href="../login">Please login again!</a>'
        }).then(() => {
          this.router.navigate(['../login']);
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Internal server error. Please try again later!',
          footer: '<a href="../login">Login</a>'
        }).then(() => {
          location.reload();
        });
      }
    }
    finally{
      this.spinner.hide();
    }
  }

  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }

  get f() {
    return this.invoiceForm.controls;
  }

  async selectPurchaseid(id: any) {
    if (id) {
      this.purchaseData.purchase_id = id?.purchase_id;
      this.purchaseData2.purchase_id = id?.purchase_id;
      // this.display = false;
      this.vendorname = id?.supplier_name;
      this.currency = id?.currency;
    }
  }

  selectFile(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const fileSizeInKB = file.size / 1024; // Get file size in KB

      if (fileSizeInKB <= 2048 && file.type == 'application/pdf') {
        //this.file have the pdf file
        this.files = file;
      }
      else if (file.type !== 'application/pdf') {
        //call validation
        this.invoiceForm.get('filename').touched;
        this.invoiceForm.controls["filename"].reset();
        // alert('Filetype is not Valid.')
        Swal.fire({
          title: 'Warning!',
          text: 'Filetype is invalid!',
          icon: 'warning',
        });
      }
      else {
        // File size exceeds the limit, show an error message
        this.invoiceForm.get('filename').touched;
        this.invoiceForm.controls["filename"].reset();
        Swal.fire({
          title: 'Error!',
          text: 'File size exceeds the allowed limit of 2mb !',
          icon: 'error',
        });
      }
    }
  }


  uploadInvoice() {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.get('purchase_id').markAsTouched();
      this.invoiceForm.get('invoice_no').markAsTouched();
      this.invoiceForm.get('filename').markAsTouched();
      this.invoiceForm.get('invoice_date').markAsTouched();
      this.invoiceForm.get('invoice_amount').markAsTouched();
    }
    else {
      if (this.displayuploadInvoice) {

        const formdata = new FormData();
        formdata.append('file', this.files)

        this.filesService.uploadFileandgetData(formdata)
          .subscribe(
            {
              next: (event: HttpEvent<any>) => {

                if (event.type === HttpEventType.UploadProgress && event.total !== undefined) {
                  this.uploadProgress = Math.round((100 * event.loaded) / event.total);
                }
                else if (event.type === HttpEventType.Response) {
                  this.uploadProgress = 100; // Completed
                  const results = event.body;
                  this.uploadFileandgetData = results;
                  this.purchaseData.filename = results.filename;
                  console.log(this.purchaseData.filename, "this.purchaseData.filename");
                  this.purchaseData.filepath = this.uploadFileandgetData.filepath;
                  this.purchaseData.mimetype = this.uploadFileandgetData.mimetype;
                  console.log(this.purchaseData, "this.purchaseData");

                  this.filesService.uploadInvoiceinpo(this.purchaseData).subscribe(

                    {
                      next: (results: any) => {
                        console.log(results, "results");
                        Swal.fire({
                          title: 'Success!',
                          text: 'Invoice uploaded successfully!',
                          icon: 'success',
                        }).then(() => {
                          this.invoiceForm.reset({
                            purchase_id: '',
                            invoice_no: '',
                            filename: '',
                            invoice_remark: ''
                          })

                          this.vendorname = '';

                          this.ngOnInit();
                        })

                      }, error: (error) => {
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
                            // location.reload();
                          })
                        }
                      }
                    }

                  )
                }
              }, error: (error) => {
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
                    // location.reload();
                  })
                }
              }

            })
      }
      //----------------------upload-----------------------
      else {

        if (this.files == undefined || null || '') {

          this.purchaseData2.invoice_no = this.purchaseData.invoice_no;
          this.purchaseData2.invoice_remark = this.purchaseData.invoice_remark;
          this.purchaseData2.invoice_date = this.purchaseData.invoice_date?this.purchaseData.invoice_date:'';
          this.purchaseData2.invoice_amount = this.purchaseData.invoice_amount;

          this.filesService.updateInvoicenoinpo(this.purchaseData2).subscribe(

            {
              next: (results: any) => {
                Swal.fire({
                  title: 'Success!',
                  text: 'Invoice updated successfully!',
                  icon: 'success',
                }).then(() => {
                  this.invoiceForm.reset({
                    purchase_id: '',
                    invoice_no: '',
                    filename: '',
                    invoice_remark: ''
                  })
                  this.ngOnInit();
                })
              }, error: (error) => {
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
            }
          )


        }
        else {

          const formdata2 = new FormData();
          formdata2.append('file', this.files);
          this.filesService.uploadFileandgetData(formdata2).subscribe(
            {
              next: (event: HttpEvent<any>) => {
                if (event.type === HttpEventType.UploadProgress && event.total !== undefined) {
                  this.uploadProgress = Math.round((100 * event.loaded) / event.total);
                }
                else if (event.type === HttpEventType.Response) {
                  this.uploadProgress = 100; // Completed
                  const results = event.body;

                  this.purchaseData.filename = results.filename;
                  this.purchaseData.filepath = results.filepath;
                  this.purchaseData.mimetype = results.mimetype;

                  this.purchaseData.purchase_id = this.purchaseId;
                  // this.purchaseData.invoice_remark = results.mimetype;

                  this.filesService.uploadInvoiceinpo(this.purchaseData).subscribe(
                    {
                      next: (results: any) => {
                        Swal.fire({
                          title: 'Success!',
                          text: 'Invoice updated Successfully!',
                          icon: 'success',
                        }).then(() => {
                          this.invoiceForm.reset({
                            purchase_id: '',
                            invoice_no: '',
                            filename: '',
                            invoice_remark: ''
                          })
                          this.ngOnInit();
                        });
                      }, error: (error) => {
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
                    }

                  )
                }
              }

            })
        }
      }
    }
  }


  async filterData(): Promise<void> {
    // If the originalData is not set, initialize it with the current itemsData
    if (!this.itemsData) {
      this.itemsData = this.itemsData;
    }
    // Start with the original data or the previously filtered data
    let filteredData: any[] = this.itemsData;
    
    // // Filter by search term
    if (this.searchTerm) {
      filteredData = filteredData.filter((item: any) => {
        return Object.keys(item).some(key => {
          if (item[key] !== null && item[key] !== '' && key === 'modified_date') {
            return item[key]?.includes(this.searchTerm);
          } else if (item[key] !== null && item[key] !== '') {
            return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
          }
          return false;
        });
      });
    }

    // Filter by date range only if there is a valid date range
    if (this.invoicebydate?.start_date && this.invoicebydate?.end_date) {
      if (this.invoicebydate.start_date <= this.invoicebydate.end_date) {
        filteredData = filteredData.filter((item: any) => {
          const filteredmodifieddate = moment(item?.invoice_date, 'DD-MM-YYYY').format('YYYY-MM-DD');
          if (filteredmodifieddate) {
            return filteredmodifieddate >= this.invoicebydate.start_date &&
            filteredmodifieddate <= this.invoicebydate.end_date;
          }
          return false;
        });
      } else {
        Swal.fire({
          title: 'Warning',
          text: 'End date should be later than start date.',
          icon: 'warning'
        });
        // If there's a date range error, return an empty array to show no results
        filteredData = [];
      }
    }

    // Update filtered data and totalItems
    this.filteredinvoicedata = filteredData;
    this.getSumofAmount(filteredData);
    this.totalItems = this.filteredinvoicedata.length;
    this.count = this.totalItems;

    this.page = 1; // Reset to the first page when filtering occurs
  }

  refreshfilter() {
    this.isRotating = true;
    this.getPurchaseDataFromPO().then(() => {

      // Clear date filters
      if (this.invoicebydate?.start_date || this.invoicebydate?.end_date) {
        this.invoicebydate.start_date = '';
        this.invoicebydate.end_date = '';
      }

      if (!this.itemsData) {
        this.itemsData = this.itemsData;
      }

      // Start with the original data or the previously filtered data
      let filteredData: any[] = this.itemsData;

      // // Filter by search term
      if (this.searchTerm) {
        filteredData = filteredData.filter((item: any) => {
          return Object.keys(item).some(key => {
            if (item[key] !== null && item[key] !== '' && key === 'modified_date') {
              return item[key]?.includes(this.searchTerm);
            } else if (item[key] !== null && item[key] !== '') {
              return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
            }
            return false;
          });
        });
      }
      // Update filtered data and totalItems
      this.filteredinvoicedata = filteredData;
      this.totalItems = this.filteredinvoicedata.length;
      this.page = 1; // Reset to the first page when filtering occurs
      setTimeout(() => {
        this.isRotating = false
      }, 500);
    });
  }

  updateInvoicebtn(data: any) {

    //this is used to clear the validation of particular control
    this.invoiceForm.controls['filename'].clearValidators();

    this.displayemptydatamsg = false;
    this.displayInvoicecontainer = true;
    this.toggleListBtn = true;
    this.toggleAddbtn = false;

    this.displayuploadInvoice = false;
    this.displayupdateInvoice = true;
    // this.display = false;
    this.readonly = true;

    // this.purchaseData2.purchase_id = data;
    this.purchaseIdobj.purchase_id = data;

    this.sharedService.getPurchaseJoinDatabyPid(this.purchaseIdobj).subscribe({
      next: (results: any) => {
        console.log(results, "results");
        const {purchase_id, invoice_remark, invoice_no, invoice_amount, invoice_date, currency} = results[0] || {};

        this.purchaseId = purchase_id;
        this.currency = currency;
        
        const invoicedate = invoice_date? moment(invoice_date).format('YYYY-MM-DD'):'';
        this.purchaseData2 = {...this.purchaseData2, purchase_id, invoice_remark, invoice_amount,invoice_date};

        this.purchaseData2.invoice_date = invoicedate;
        console.log(this.purchaseData2.invoice_date, "invoice_date");

        this.invoiceForm.get('purchase_id').patchValue(results[0]?.purchase_id);

        this.purchaseData = {...this.purchaseData, invoice_no, invoice_remark, invoice_amount}

        this.purchaseData.invoice_date = results[0]?.invoice_date?moment(results[0]?.invoice_date).format('YYYY-MM-DD'):'';

        this.vendorname = results[0].supplier_name;
      },
      error: (error) => {
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

  toggleActionAdd() {
    this.displayuploadInvoice = true;
    this.displayuploadInvoice = false;

    this.toggleListBtn = false;
    this.toggleAddbtn = true;
    this.displayInvoicecontainer = false;
    this.displayemptydatamsg = true;
    this.invoiceForm.reset({
      purchase_id: '',
      invoice_no: '',
      filename: '',
      invoice_remark: '',
      invoice_amount:0,
      invoice_date: ''
    })
    this.vendorname = '';
    this.displayupdateInvoice = false;
    this.displayuploadInvoice = true;

  }

  toggleActionUpdate() {
    this.toggleListBtn = true;
    this.toggleAddbtn = false;
    this.displayInvoicecontainer = true;
    this.displayemptydatamsg = false;
    this.invoiceForm.reset({
      purchase_id: '',
      invoice_no: '',
      filename: '',
      invoice_date:'',
      invoice_amount:0,
      invoice_remark: ''
    })
  }

  checkAndOpenFile(filePath: string) {
    if(filePath){
      const fullPath = this.baseUrl + filePath;
      this.checkService.checkFileExistence(this.baseUrl + filePath).subscribe(exists => {
        console.log(exists);
        if (exists) {
          window.open(fullPath, '_blank');
        } else {
          this.documentnotexists();
        }
      });
    }
    else{
      this.documentnotuploaded();
    }
  
  }

  documentnotuploaded(){
    Swal.fire({
      icon: 'warning',
      title: 'Warning!',
      text: 'File not uploaded yet!'
    })
  }

  documentnotexists(){
    Swal.fire({
      icon: 'warning',
      title: 'Warning!',
      text: 'File does not exists!'
    })
  }


  invoicenotuploaded() {
    Swal.fire({
      icon: 'warning',
      title: 'Warning!',
      text: 'Invoice not uploaded yet!'
    }).then(() => {
      this.ngOnInit();
    })
  }


  ontableDatachange(event: any) {
    this.page = event;
    // this.getSystemData();

  }

   ontableSizechange(event: any): void {
    const Value = event.target.value
    // this.tableSize = ;
    if(Value == "All"){
      this.tableSize = +this.count;
    }
    else {
      // Otherwise, set the table size to the selected value
      this.tableSize = +Value;
    }

    this.page = 1;
    this.itemsperPage = Value;
  }


  sort(columnName: string) {
    console.log(columnName, "columnName");
    if (this.currentSortColumn === columnName) {
      this.isAscending = !this.isAscending; // Toggle sorting order
    }
    else {
      this.currentSortColumn = columnName; // Update current sort column
      this.isAscending = this.isAscending ? this.isAscending : false; // Set sorting order to ascending for the new column
    }

    // Update sortingorder with the new column and sorting order
    this.sortingorder = `${columnName}-${this.isAscending ? 'asc' : 'desc'}`;

    this.filteredinvoicedata.sort((a: any, b: any) => {
      let comparison = 0;
      const valueA = a[columnName];
      const valueB = b[columnName];

      // Handle null or undefined values
      if (valueA === null || valueA === undefined) {
        comparison = valueB === null || valueB === undefined ? 0 : -1;
      } else if (valueB === null || valueB === undefined) {
        comparison = 1;
      } else {
        // console.log(valueA, valueB, "sorting")
        if (this.isDate(valueA) && this.isDate(valueB)) {
        // Parse dates using moment.js with strict parsing
        const dateA = moment(valueA, 'DD-MM-YYYY', true); 
        const dateB = moment(valueB, 'DD-MM-YYYY', true);
        comparison = dateA.diff(dateB); 
          
        } else if (this.isNumber(valueA) && this.isNumber(valueB)) {
          comparison = valueA - valueB;
        } else {
          comparison = valueA.toString().localeCompare(valueB.toString());
        }
      }

      return this.isAscending ? comparison : -comparison;
    });
  }

  isDate(dateString:any): boolean {
    const isValidDate = moment(dateString, 'DD-MM-YYYY', true).isValid();
    return isValidDate;
  }

  isNumber(value: any): boolean {
    return !isNaN(value);
  }

  // exportToExcel() {
  //   const randomDate = new Date().valueOf();
  //   const uri = 'data:application/vnd.ms-excel;base64,';
  //   const template = `
  //     <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  //     <head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
  //     <body>{table}</body>
  //     </html>
  //   `;
  //   const base64 = function (s: any) { return window.btoa(unescape(encodeURIComponent(s))) };
  //   const format = function (s: any, c: any) { return s.replace(/{(\w+)}/g, function (m: any, p: any) { return c[p]; }) };

  //   // Define your column names
  //   const columnNames = ['S.No.', 'Purchase Id', 'Vendor Name', 'Invoice No.','Invoice Amount', 'Date', 'Remark', 'Modified Date'];

  //   const tableHtml = `<table style="border-collapse: collapse; width: 80%; background-color: #f2f2f2;">
  //   <thead>
  //     <tr style="background-color: #00008B; color:#fff;">
  //       ${columnNames.map((name) => `<th style="border: 1px solid #dddddd; text-align: left; padding: 1px;">${name}</th>`).join('')}
  //     </tr>
  //   </thead>
  //   <tbody>
  //     ${this.filteredinvoicedata.map((item: any, index: number) => {
  //     return `
  //         <tr style="border: 1px solid #dddddd; text-align: left; padding: 1px;">
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${index + 1}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.purchase_id}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.supplier_name ? item.supplier_name : 'NA'}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.invoice_no ? item.invoice_no : 'NA'}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.invoice_amount ? item.invoice_amount : 'NA'}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.invoice_date ? item.invoice_date : 'NA'}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.invoice_remark ? item.invoice_remark : 'NA'}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item?.modified_date ? item?.modified_date : 'NA'}</strong></td>
  //         </tr>`;
  //   }).join('')}
  //   </tbody>
  // </table>`;

  //   const ctx = { worksheet: 'Worksheet', table: tableHtml };
  //   const link = document.createElement('a');
  //   link.download = `report_inovoice_data.xls`;
  //   link.href = uri + base64(format(template, ctx));
  //   link.click();
  // }

  exportToexcelfromnode(): any {
    const modifiedItemsDataList = this.filteredinvoicedata.map((item: any, index: any) => {
      return {
        ...item,  // Spread the original object properties
        "S.No.": index + 1  // Add the S.No. field with the appropriate value
      };
    });

    const reportRequest = {
      reportTitle: "Invoice List",
      columns: [
        { header: 'S.No.', key: 'S.No.', width: 10, filterButton: false },
        { header: 'Purchase Id', key: 'purchase_id',width: 25, filterButton: true },
        { header: 'Vendor Name', key: 'supplier_name',width: 45, filterButton: true },
        { header: 'Invoice No.', key: 'invoice_no', width: 30, filterButton: true },
        { header: 'Amount (₹)', key: 'invoice_amount', width: 25, format: 'currency', totalsRowFunction: "sum", filterButton: false },
        { header: 'Upload Date', key: 'invoice_date', width: 30, format: 'date', filterButton: false },
        { header: 'Remark', key: 'invoice_remark',width: 55, filterButton: false },
        { header: 'Modified Date', key: 'modified_date', width: 30, format: 'date', filterButton: false },
      ],

      totalsrow:true,
      data: modifiedItemsDataList , // Data to populate the report

      filters:[
        { filterBy:(this.invoicebydate.start_date && this.invoicebydate.end_date)?'Invoice Date':'' , startDate:this.invoicebydate.start_date||'', endDate:this.invoicebydate.end_date||''}
      ]
    };

    this.filesService.exportToExcel(reportRequest).subscribe(
      (response: Blob) => {
        // Call downloadBlob to trigger the download with the response
        this.filesService.downloadBlob(response, 'report_inovoice_data.xlsx');
      },
      (error) => {
        console.error('Error exporting to Excel', error);
      }
    );
  }

  toggleExpand(item: any) {
    item.isExpanded = !item.isExpanded;
  }

  getSumofAmount(filteredResults:any[]){
    const sumofTotals = filteredResults.reduce((sum: number, item: any) => {
      const total = typeof item.invoice_amount === 'number' ? parseFloat(item.invoice_amount.toFixed(2)) : 0;
      return sum + total;
    }, 0);
    this.sumofamount = sumofTotals?sumofTotals.toFixed(2):0;
    console.log(this.sumofamount, "this.sumofamount");  
  }

  allowInvoiceCharacters(event: KeyboardEvent) {
  const allowedKeys = [
    ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    '  ', 'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete','_','-'
  ];

  if (!allowedKeys.includes(event.key)) {
    event.preventDefault();
  }
}


  validation() {
    this.invoiceForm = new FormGroup({
      purchase_id: new FormControl('', [Validators.required]),
      invoice_no: new FormControl('', [Validators.required]),
      invoice_date: new FormControl('', [Validators.required]),
      invoice_amount: new FormControl('', [Validators.required]),
      filename: new FormControl('', [Validators.required]),
      invoice_remark: new FormControl(''),
    })
  }

}
