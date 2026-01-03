import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { FilesService } from 'src/app/services/files.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
declare var require: any
const FileSaver = require('file-saver');
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from 'src/app/environments/environment.prod';
import { NgxSpinnerService } from "ngx-spinner";
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';
import { CheckService } from 'src/app/services/check.service';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';


@Component({
  selector: 'app-upload-scan-quotation',
  templateUrl: './upload-scan-quotation.component.html',
  styleUrls: ['./upload-scan-quotation.component.scss']
})
export class UploadScanQuotationComponent {
  baseUrl:any;
  searchItem = '';
  uploadquotationForm: any
  requestData: any;
  files: any;
  uploadfileandgetData: any;
  uploadProgress:any;

  display1: boolean = true;      // for add button
  display2: boolean = false;     // for update button

  toggleListBtn = true;
  toggleAddbtn = false;
  displayQuotationcontainer = true;
  displayemptydatamsg = false;

  getquotationData: any;
  isDataorNot:boolean = true;

  //for inserting quotation
  uploadquotationData = {
    quotation_name: '',
    quotation_path: '',
    mimetype: '',
    request_id: 0,
    description: '',
    created_by: localStorage.getItem('login_id')
  }

  //for updating quotation
  uploadquotationData2: any = {
    quotation_id: 0,
    quotation_name: '',
    quotation_path: '',
    mimetype: '',
    request_id: 0,
    description: ''
  }

  updatequotationDataotherthanfile: any = {
    quotation_id: 0,
    request_id: 0,
    description: '',
  }

  created_by = localStorage.getItem('name');

  fileName = {
    file_name: ''
  }

  quotationId = {
    quotation_id: 0
  }
  userRole = localStorage.getItem('level');
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];
  itemsData: any[] = [];
  filteredQuotationData:any;
  empltyDataList=[];
  currentdate:any;
  Quotationbydate={
    start_date:'',
    end_date:''
  };
  searchTerm:any;
  totalItems: number=0;
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  isRotating: boolean = false;
  sortingorder:any;
  itemsPerpage:any = 20;

  constructor(private sharedService: SharedService, private filesServices: FilesService, private router: Router, private spinner: NgxSpinnerService, private checkService:CheckService) { 
    const today = moment();
    this.currentdate = today.format('YYYY-MM-DD');
  }

  ngOnInit(): void {
    this.validation();
    this.getAlldata();
    this.baseUrl = environment.BASE_URL;
  }

  async getAlldata(){
    try{
      this.spinner.show();
      const sortByProperty = (arr: any[], propertyName: string) => {
        return arr.sort((a, b) => {
          const itemA = a[propertyName].toUpperCase();
          const itemB = b[propertyName].toUpperCase();
          return itemA.localeCompare(itemB);
        });
      };
      const [requestData, getquotationData]:any = await  forkJoin([
        this.sharedService.getacceptedRequest().pipe(
          retry(3), // Retry the request up to 3 times
          // catchError((error: HttpErrorResponse) => {
          //   console.error('Error fetching accepted requests:', error);
          //   return of([]); // Return an empty array if an error occurs
          // })
        ),
        this.sharedService.getQuotationdata().pipe(
          retry(3), // Retry the request up to 3 times
          // catchError((error: HttpErrorResponse) => {
          //   console.error('Error fetching accepted requests:', error);
          //   return of([]); // Return an empty array if an error occurs
          // })
        ),
      ]).toPromise();
      this.requestData = sortByProperty(JSON.parse(JSON.stringify(requestData)), 'request_item');
      this.getquotationData = getquotationData;
      if(this.getquotationData?.length == 0){
        this.isDataorNot = false;
      }
      else{
        this.isDataorNot = true;  
        const filteredResults = getquotationData.map((item: any) => {
          if (item.created_date) {
          
            const splitcreateddate = moment(item.created_date).format('DD-MM-YYYY');
            return { ...item, created_date: splitcreateddate};
                   
          }
          return item;
        });
          console.log(filteredResults, "filteredResults");
          this.filteredQuotationData = filteredResults;
          this.itemsData = filteredResults;
          this.count = filteredResults.length;
          // this.spinner.hide(); 
      }
    }
    catch(error:unknown){
      // this.spinner.hide();
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
  finally {
    this.spinner.hide();
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
            if (item[key] !== null && item[key] !== '' &&  key === 'modified_date') {
              return item[key]?.includes(this.searchTerm);
            } else if (item[key] !== null && item[key] !== '') {
              return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
            }
            return false;
          });
        });
      }   
 
    // Filter by date range only if there is a valid date range
    if (this.Quotationbydate?.start_date && this.Quotationbydate?.end_date) {
      if (this.Quotationbydate.start_date <= this.Quotationbydate.end_date) {
        filteredData = filteredData.filter((item: any) => {
          const filteredcreateddate = moment(item?.created_date, 'DD-MM-YYYY').format('YYYY-MM-DD');
          if (filteredcreateddate) {
            return filteredcreateddate >= this.Quotationbydate.start_date &&
            filteredcreateddate <= this.Quotationbydate.end_date;
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
    this.filteredQuotationData = filteredData;
    this.totalItems = this.filteredQuotationData.length;
    this.count = this.totalItems;
    this.page = 1; // Reset to the first page when filtering occurs
  }

  refreshfilter() {
    this.isRotating = true;
    this.getAlldata().then(() => {
      // Clear date filters
      if (this.Quotationbydate?.start_date || this.Quotationbydate?.end_date) {
        this.Quotationbydate.start_date = '';
        this.Quotationbydate.end_date = '';
      }
  
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
            if (item[key] !== null && item[key] !== '' &&  key === 'modified_date') {
              return item[key]?.includes(this.searchTerm);
            } else if (item[key] !== null && item[key] !== '') {
              return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
            }
            return false;
          });
        });
      }   
   // Update filtered data and totalItems
   this.filteredQuotationData = filteredData;
   this.totalItems = this.filteredQuotationData.length;
   this.page = 1; // Reset to the first page when filtering occurs
   setTimeout(() => {
    this.isRotating = false;
   }, 500);
    });
  }

  NoSpaceallowedatstart(event:any){
    if(event.target.selectionStart === 0 && event.code ==="Space")
    {
      event.preventDefault();
    }
  }

  selectedrequest(id: any) {
    this.uploadquotationData.request_id = + id?.request_id;
  }

  getquotationname(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const fileSizeInKB = file.size / 1024; // Get file size in KB
      
     if(fileSizeInKB <= 2048 && file.type == 'application/pdf'){
      this.files = file;
      this.fileName.file_name = this.files.name;
     }
     else if(file.type !== 'application/pdf'){
      this.uploadquotationForm.get('quotation_name').touched;
        this.uploadquotationForm.controls["quotation_name"].reset();
       Swal.fire({
         title: 'Warning!',
         text: 'Filetype is invalid!',
         icon: 'warning',
       });
     }
     else{
       // File size exceeds the limit, show an error message
       this.uploadquotationForm.get('quotation_name').touched;
       this.uploadquotationForm.controls["quotation_name"].reset();
       Swal.fire({
        title: 'Error!',
        text: 'File size exceeds the allowed limit of 2mb !',
        icon: 'error',
      });
     }
    }
  }

  uploadquotation() {
    if (this.uploadquotationForm.invalid) {
      this.uploadquotationForm.get('quotation_name').markAsTouched();
      this.uploadquotationForm.get('request_id').markAsTouched();
      this.uploadquotationForm.get('description').markAsTouched();
    }
    else {

      if (this.display1) {
        const formdata = new FormData();
        formdata.append('file', this.files);
        //uploading quotation in backend folder name 'file' and gets its information
        this.filesServices.uploadQuotationandgetData(formdata).subscribe(
          {
            next:(event: HttpEvent<any>) => {

              if (event.type === HttpEventType.UploadProgress && event.total!== undefined) {
           this.uploadProgress = Math.round((100 * event.loaded) / event.total);
         }
          else if (event.type === HttpEventType.Response) {
           this.uploadProgress = 100; // Completed
           const results = event.body;
              this.uploadfileandgetData = results;
              this.uploadquotationData.quotation_name = this.uploadfileandgetData.filename;
              this.uploadquotationData.quotation_path = this.uploadfileandgetData.filepath;
              this.uploadquotationData.mimetype = this.uploadfileandgetData.mimetype;
              this.filesServices.uploadQuotation(this.uploadquotationData).subscribe(
                {
                  next: (results: any) => {
                    // alert(results.message);
                    Swal.fire({
                      title: 'Success!',
                      text: 'Quotation uploaded successfully!',
                      icon: 'success',
                    }).then(()=>{
                      this.uploadquotationForm.reset({
                        quotation_name:'',
                        request_id:0,
                        file_name:'',
                        description:''
                      })
                      this.ngOnInit();
                    })
                  
                  }, error: (error) => {
                    // console.log('error')
                    if (error.status == 403) {            
                      Swal.fire({
                        icon: 'error',
                        title: 'Oops!',
                        text: 'Token expired.',
                        footer: '<a href="../login">Please login again!</a>'
                      }).then(()=>{
                        this.router.navigate(['../login']);
                      })
                    }
                    else {
                      Swal.fire({
                        icon: 'error',
                        title: 'Oops!',
                        text: 'Internal server error.Please try after some time!',
                        footer:'<a href="../login">Login</a>'
                      }).then(()=>{
                        location.reload();
                      })
                    }
                  }
                })
            }
          },
        error:(error)=>{
          if (error.status == 403) {            
            Swal.fire({
              icon: 'error',
              title: 'Oops!',
              text: 'Token expired.',
              footer: '<a href="../login">Please login again!</a>'
            }).then(()=>{
              this.router.navigate(['../login']);
            })
          }
          else {
            Swal.fire({
              icon: 'error',
              title: 'Oops!',
              text: 'Internal server error.Please try after some time!',
              footer:'<a href="../login">Login</a>'
            }).then(()=>{
              location.reload();
            })
          }
        }})
      }

      else {

        if (this.files == undefined || null || "") {
          this.updatequotationDataotherthanfile.description = this.uploadquotationData.description;
          this.updatequotationDataotherthanfile.request_id = this.uploadquotationData.request_id;
          this.filesServices.updateQuatationotherthanFile(this.updatequotationDataotherthanfile).subscribe(
            {
              next: (results: any) => {
                Swal.fire({
                  title: 'Success!',
                  text: 'Quotation updated successfully!',
                  icon: 'success',
                }).then(() => {
                  location.reload();
                });
             
              }, error: (error) => {
                
                if (error.status == 403) {            
                  Swal.fire({
                    icon: 'error',
                    title: 'Oops!',
                    text: 'Token expired.',
                    footer: '<a href="../login">Please login again!</a>'
                  }).then(()=>{
                    this.router.navigate(['../login']);
                  })
                }
                else {
                  Swal.fire({
                    icon: 'error',
                    title: 'Oops!',
                    text: 'Internal server error.Please try after some time!',
                    footer:'<a href="../login">Login</a>'
                  }).then(()=>{
                    location.reload();
                  })
                }
              }
            })


        }
        else {

          const formdata2 = new FormData();
          formdata2.append('file', this.files);

          this.filesServices.uploadQuotationandgetData(formdata2).subscribe(
            {
              next:(event: HttpEvent<any>) => {
                if (event.type === HttpEventType.UploadProgress && event.total!== undefined) {
             this.uploadProgress = Math.round((100 * event.loaded) / event.total);
           }
            else if (event.type === HttpEventType.Response) {
             this.uploadProgress = 100; // Completed
             const results = event.body;
                this.uploadfileandgetData = results;
                this.uploadquotationData2.quotation_name = this.uploadfileandgetData.filename;
                this.uploadquotationData2.quotation_path = this.uploadfileandgetData.filepath;
                this.uploadquotationData2.mimetype = this.uploadfileandgetData.mimetype;
                this.uploadquotationData2.request_id = this.uploadquotationData.request_id;
                this.uploadquotationData2.description = this.uploadquotationData.description;
                this.filesServices.updatefullQuotation(this.uploadquotationData2).subscribe(
                  {
                    next: (results: any) => {
                      Swal.fire({
                        title: 'Success!',
                        text: 'Quotation updated successfully!',
                        icon: 'success',
                      }).then(() => {
                        this.uploadquotationForm.reset({
                          quotation_name:'',
                          request_id:0,
                          file_name:'',
                          description:''
                        })
                        this.ngOnInit();
                      });
                    }, error: (error) => {
                      // console.log('error')
                      if (error.status == 403) {            
                        Swal.fire({
                          icon: 'error',
                          title: 'Oops!',
                          text: 'Token expired.',
                          footer: '<a href="../login">Please login again!</a>'
                        }).then(()=>{
                          this.router.navigate(['../login']);
                        })
                      }
                      else {
                        Swal.fire({
                          icon: 'error',
                          title: 'Oops!',
                          text: 'Internal server error.Please try after some time!',
                          footer:'<a href="../login">Login</a>'
                        }).then(()=>{
                          location.reload();
                        })
                      }
                    }
                  })
              }
            },
          error:(error)=>{
            if (error.status == 403) {            
              Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: 'Token expired.',
                footer: '<a href="../login">Please login again!</a>'
              }).then(()=>{
                this.router.navigate(['../login']);
              })
            }
            else {
              Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: 'Internal server error.Please try after some time!',
                footer:'<a href="../login">Login</a>'
              }).then(()=>{
                location.reload();
              })
            }
          }})
        }
      }
    }
  }

  updatequotation(id: any) {
    this.uploadquotationForm.controls['quotation_name'].clearValidators();
    this.display1 = false;
    this.display2 = true;
    this.displayemptydatamsg = false;
    this.displayQuotationcontainer = true;
    this.toggleListBtn = true;
    this.toggleAddbtn = false;
    this.quotationId.quotation_id = id;

    this.sharedService.getQuotationdatabyId(this.quotationId).subscribe(
      {
        next: (results: any) => {
          this.updatequotationDataotherthanfile.quotation_id = this.quotationId.quotation_id;
          this.uploadquotationData2.quotation_id = this.quotationId.quotation_id;

          this.fileName.file_name = results[0].quotation_name;
          this.uploadquotationData.request_id = results[0].request_id;
          this.updatequotationDataotherthanfile.request_id = this.uploadquotationData.request_id;

          this.uploadquotationData.description = results[0].description;
          this.updatequotationDataotherthanfile.description = this.uploadquotationData.description;

          this.uploadquotationForm.get('description').patchValue(results[0].description);

        },
        error: (error) => {
          // console.log('error')
          if (error.status == 403) {            
            Swal.fire({
              icon: 'error',
              title: 'Oops!',
              text: 'Token expired.',
              footer: '<a href="../login">Please login again!</a>'
            }).then(()=>{
              this.router.navigate(['../login']);
            })
          }
          else {
            Swal.fire({
              icon: 'error',
              title: 'Oops!',
              text: 'Internal server error.Please try after some time!',
              footer:'<a href="../login">Login</a>'
            }).then(()=>{
              location.reload();
            })
          }
        }
      })

  }

  //donwload and save file in local system (we use package name file-saver)
  downloadPDF(name: any, path:any) {
    const fileUrl = `${this.baseUrl}${path}`;

    if(fileUrl){
      this.checkService.checkFileExistence(fileUrl).subscribe(exists => {
        console.log(exists);
        if (exists) {
          const fileName = name;
          FileSaver.saveAs(fileUrl, fileName);
        } else {
          this.documentnotexists();
        }
      });
    }
    else{
      this.documentnotuploaded();
    }
    
  }

  toggleActionAdd() {
    this.toggleListBtn = false;
    this.toggleAddbtn = true;
    this.displayQuotationcontainer = false;
    this.displayemptydatamsg = true;
    this.uploadquotationForm.reset({
      quotation_name:'',
      request_id:0,
      file_name:'',
      description:''
    });

    this.display1 = true;
    this.display2 = false;
  }

  toggleActionUpdate() {
    this.toggleListBtn = true;
    this.toggleAddbtn = false;
    this.displayQuotationcontainer = true;
    this.displayemptydatamsg = false;
    this.uploadquotationForm.reset({
      quotation_name:'',
      request_id:0,
      file_name:'',
      description:''
    })
  }

  quotationnotuploaded(){
    Swal.fire({
      icon: 'warning',
      title: 'Warning!',
      text: 'Quotation not uploaded yet!'
    }).then(()=>{
      this.ngOnInit();
    })
  }

  onPaste(event: any) {
    event.preventDefault();

    const clipboardData = event.clipboardData.getData('text');
    if(clipboardData){
      
      const currentContent = this.uploadquotationData.description || ''; // Existing content or an empty string
      const newContent = currentContent + clipboardData; // Concatenate existing content with newly pasted content
      this.uploadquotationData.description = newContent;
    }
}


typeintextarea(data:any){
 
    this.uploadquotationData.description = data || '';

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
    // this.getSystemData();
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

    this.filteredQuotationData.sort((a: any, b: any) => {
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
  //   const base64 = function(s: any) { return window.btoa(unescape(encodeURIComponent(s))) };
  //   const format = function(s: any, c: any) { return s.replace(/{(\w+)}/g, function(m: any, p: any) { return c[p]; }) };
  
  //   // Define your column names
  //   const columnNames = ['S.No.','Quotation Name', 'Vendor Name', 'Category Name','Created By', 'Upload Date'];
  
  //   const tableHtml = `<table style="border-collapse: collapse; width: 80%; background-color: #f2f2f2;">
  //   <thead>
  //     <tr style="background-color: #00008B; color:#fff;">
  //       ${columnNames.map((name) => `<th style="border: 1px solid #dddddd; text-align: left; padding: 1px;">${name}</th>`).join('')}
  //     </tr>
  //   </thead>
  //   <tbody>
  //     ${this.filteredQuotationData.map((item: any, index: number) => {
  //       return `
  //         <tr style="border: 1px solid #dddddd; text-align: left; padding: 1px;">
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${index + 1}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.quotation_name}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.category_name?item.category_name:'NA'}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.description ? item.description:'NA'}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.user_name ? item.user_name:'NA'}</strong></td>
  //           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item?.created_date?item?.created_date:'NA'}</strong></td>
  //         </tr>`;
  //     }).join('')}
  //   </tbody>
  // </table>`;
  
  //   const ctx = { worksheet: 'Worksheet', table: tableHtml };
  //   const link = document.createElement('a');
  //   link.download = `report_document_data.xls`;
  //   link.href = uri + base64(format(template, ctx));
  //   link.click();
  // }

  exportToexcelfromnode(): any {
    const modifiedItemsDataList = this.filteredQuotationData.map((item: any, index: any) => {
      return {
        ...item,  // Spread the original object properties
        "S.No.": index + 1  // Add the S.No. field with the appropriate value
      };
    });

    const reportRequest = {
      reportTitle: "Quotation List",
      columns: [
        { header: 'S.No.', key: 'S.No.', width: 10, filterButton: false },
        { header: 'Quotation Name', key: 'quotation_name',width: 55, filterButton: true },
        { header: 'Category Name', key: 'request_item', width: 35, filterButton: true },
        { header: 'Description', key: 'description', width: 55, filterButton: true },
        { header: 'Upload Date', key: 'created_date', width: 30, format: 'date', filterButton: false },
        { header: 'Uploaded By', key: 'user_name', width: 25, filterButton: false },
      ],

      data: modifiedItemsDataList , // Data to populate the report
      totalsrow:false,
      filters:[
        { filterBy:(this.Quotationbydate.start_date && this.Quotationbydate.end_date)?'Upload Date':'' , startDate:this.Quotationbydate.start_date||'', endDate:this.Quotationbydate.end_date||''}
      ]
    };

    this.filesServices.exportToExcel(reportRequest).subscribe(
      (response: Blob) => {
        // Call downloadBlob to trigger the download with the response
        this.filesServices.downloadBlob(response, 'report_quotation_data.xlsx');
      },
      (error) => {
        console.error('Error exporting to Excel', error);
      }
    );
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

  validation() {
    this.uploadquotationForm = new FormGroup({
      quotation_name: new FormControl('', [Validators.required]),
      request_id: new FormControl(0, [Validators.required, Validators.pattern(/^[1-9][0-9]*$/)]),
      file_name: new FormControl(''),
      description: new FormControl('', [Validators.required])
    })
  }
}
