import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { FilesService } from 'src/app/services/files.service';
import { Router } from '@angular/router';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { environment } from 'src/app/environments/environment.prod';
import Swal from 'sweetalert2';
declare var require: any
const FileSaver = require('file-saver');
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { CheckService } from 'src/app/services/check.service';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-upload-scan-document',
  templateUrl: './upload-scan-document.component.html',
  styleUrls: ['./upload-scan-document.component.scss']
})
export class UploadScanDocumentComponent {
  isDataorNot: boolean = true;
  baseUrl: any;
  searchItem = '';
  searchTerm = '';
  uploaddocumentForm: any
  categoryData: any;
  files: any;
  uploadProgress: any;
  uploadfileandgetData: any;

  addButton: boolean = true;      // for add button
  updateButton: boolean = false;     // for update button

  toggleListBtn = true;
  toggleAddbtn = false;
  displaydocumentContainer = true;
  displayemptydatamsg = false;
  getDocData: any;
  getcreatedby: any;
  empltyDataList = [];
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];
  currentdate: any;

  //for inserting document
  uploadDocData: any = {
    document_name: '',
    document_path: '',
    mimetype: '',
    category_id: null,
    description: '',
    created_by: localStorage.getItem('login_id')
  }

  //for updating document
  uploadDocData2: any = {
    document_id: 0,
    document_name: '',
    document_path: '',
    mimetype: '',
    category_id: null,
    description: ''
  }

  updateDocDataotherthanfile: any = {
    document_id: 0,
    category_id: null,
    description: '',
  }

  created_by = localStorage.getItem('name');

  fileName = {
    file_name: ''
  }

  documentId = {
    document_id: 0
  }
  documentbydate = {
    start_date: '',
    end_date: ''
  }
  itemsData: any[] = [];
  filteredDocumentData: any;
  totalItems: number = 0;
  userRole = localStorage.getItem('level');
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  isRotating: boolean = false;
  sortingorder:any;
  itemsPerpage:any = 20;

  constructor(private sharedService: SharedService, private filesServices: FilesService, private router: Router, private spinner: NgxSpinnerService, private checkService: CheckService) {
    const today = moment();
    this.currentdate = today.format('YYYY-MM-DD');
  }

  ngOnInit(): void {
    this.validation();
    // this.getAlldata();
    this.getCategoryData();
    this.getDocumentData();
    this.baseUrl = environment.BASE_URL;
  }


  async getCategoryData() {
    try {
      this.spinner.show();
      const sortByProperty = (arr: any[], propertyName: string) => {
        return arr.sort((a, b) => {
          const itemA = a[propertyName].toUpperCase();
          const itemB = b[propertyName].toUpperCase();
          return itemA.localeCompare(itemB);
        });
      };
      const results: any = await this.sharedService.getCategorydata().pipe(
        retry(3), // Retry the request up to 3 times
        // catchError((error: HttpErrorResponse) => {
        //   console.error('Error fetching accepted requests:', error);
        //   return of([]); // Return an empty array if an error occurs
        // })
      ).toPromise();

      if (!results || results.length == 0) {
        this.spinner.hide();
      }
      else {
        this.categoryData = sortByProperty(JSON.parse(JSON.stringify(results)), 'category_name');
      }

    }
    catch (error: unknown) {
      this.spinner.hide();
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
  }

  async getDocumentData() {
    this.spinner.show();
    try {
      const results: any = await this.sharedService.getDocumentdata().pipe(
        retry(3), // Retry the request up to 3 times
        // catchError((error: HttpErrorResponse) => {
        //   console.error('Error fetching accepted requests:', error);
        //   return of([]); // Return an empty array if an error occurs
        // })
      ).toPromise();

      if (results?.length == 0) {
        this.isDataorNot = false;
      } else {
        this.isDataorNot = true;
        const filteredResults = results.map((item: any) => {

          const splitcreateddate = item.created_date ? moment(item.created_date).format('DD-MM-YYYY') : null;
          return { ...item, created_date: splitcreateddate };

        });
        this.filteredDocumentData = filteredResults;
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
    finally {
      this.spinner.hide();
    }
  }

  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space" && event.key === " ") {
      event.preventDefault();
    }

  }

  selectedCategory(id: any) {
    console.log(id, "categoryData.category_id");
    this.uploadDocData.category_id = + id.category_id;
  }

  getDocname(event: any) {
    if (event.target.files.length > 0) {

      const file = event.target.files[0];
      const fileSizeInKB = file.size / 1024; // Get file size in KB

      if (fileSizeInKB <= 2048 && file.type == 'application/pdf') {
        this.files = file;
        this.fileName.file_name = this.files.name;
      }
      else if (file.type !== 'application/pdf') {
        this.uploaddocumentForm.get('document_name').touched;
        this.uploaddocumentForm.controls["document_name"].reset();
        Swal.fire({
          title: 'Warning!',
          text: 'Filetype is invalid!',
          icon: 'warning',
        });
      }
      else {
        // File size exceeds the limit, show an error message
        this.uploaddocumentForm.get('document_name').touched;
        this.uploaddocumentForm.controls["document_name"].reset();
        Swal.fire({
          title: 'Error!',
          text: 'File size exceeds the allowed limit of 2mb !',
          icon: 'error',
        });
      }
    }
  }

  uploadDocument() {
    this.uploadDocData2.description = this.uploadDocData2.description ? this.uploadDocData2.description : this.uploadDocData.description;

    if (this.uploaddocumentForm.invalid) {
      this.uploaddocumentForm.controls['document_name'].markAsTouched();
      this.uploaddocumentForm.controls['category_id'].markAsTouched();
      this.uploaddocumentForm.controls['description'].markAsTouched();
    }
    else {

      if (this.addButton) {

        const formdata = new FormData();
        formdata.append('file', this.files);
        //uploading document in backend folder name 'file' and gets its information

        this.filesServices.uploadDocumentandgetData(formdata).subscribe
          // {
          //   next: (results: any) => {
          ((event: HttpEvent<any>) => {

            if (event.type === HttpEventType.UploadProgress && event.total !== undefined) {
              this.uploadProgress = Math.round((100 * event.loaded) / event.total);
            }
            else if (event.type === HttpEventType.Response) {
              this.uploadProgress = 100; // Completed
              const results = event.body;
              this.uploadfileandgetData = results;
              this.uploadDocData.document_name = this.uploadfileandgetData.filename;
              this.uploadDocData.document_path = this.uploadfileandgetData.filepath;
              this.fileName.file_name = this.uploadfileandgetData.filename;
              this.uploadDocData.mimetype = this.uploadfileandgetData.mimetype;

              this.filesServices.uploadscanDocument(this.uploadDocData).subscribe(
                {
                  next: (results: any) => {
                    // alert(results.message);
                    Swal.fire({
                      title: 'Success!',
                      text: 'Document uploaded successfully!',
                      icon: 'success',
                    }).then(() => {
                      this.uploadDocData.category_id = null;
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
          })
      }

      else {

        if (this.files == undefined || null || "") {
          this.updateDocDataotherthanfile.description = this.uploadDocData.description;
          this.updateDocDataotherthanfile.category_id = this.uploadDocData.category_id;
          this.filesServices.updateDocotherthanFile(this.updateDocDataotherthanfile).subscribe(
            {
              next: (results: any) => {
                Swal.fire({
                  title: 'Success!',
                  text: 'Document updated successfully!',
                  icon: 'success',
                }).then(() => {
                  this.uploadDocData.category_id = null;
                  this.uploadDocData2.category_id = null;
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
        else {

          const formdata2 = new FormData();
          formdata2.append('file', this.files);

          this.filesServices.uploadDocumentandgetData(formdata2).subscribe(
            {
              next: (event: HttpEvent<any>) => {
                if (event.type === HttpEventType.UploadProgress && event.total !== undefined) {
                  this.uploadProgress = Math.round((100 * event.loaded) / event.total);
                }
                else if (event.type === HttpEventType.Response) {
                  this.uploadProgress = 100; // Completed
                  const results = event.body;

                  this.uploadfileandgetData = results;
                  this.uploadDocData2.document_name = this.uploadfileandgetData.filename;
                  this.uploadDocData2.document_path = this.uploadfileandgetData.filepath;
                  this.uploadDocData2.mimetype = this.uploadfileandgetData.mimetype;
                  this.uploadDocData2.category_id = this.uploadDocData.category_id;
                  this.uploadDocData2.description = this.uploadDocData.description;
                  this.filesServices.updatefullDoc(this.uploadDocData2).subscribe(
                    {
                      next: (results: any) => {
                        Swal.fire({
                          title: 'Success!',
                          text: 'Document updated successfully!',
                          icon: 'success',
                        }).then(() => {
                          this.uploadDocData.category_id = null;
                          this.uploadDocData2.category_id = null;
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

  toggleExpand(item: any) {
    item.isExpanded = !item.isExpanded;

  }

  updateDocument(id: any) {
    //this is used to clear the validation of particular control
    this.uploaddocumentForm.controls['document_name'].clearValidators();
    this.addButton = false;
    this.updateButton = true;
    this.displayemptydatamsg = false;
    this.displaydocumentContainer = true;
    this.toggleListBtn = true;
    this.toggleAddbtn = false;
    this.documentId.document_id = id;

    this.sharedService.getDocumentdatabydocId(this.documentId).subscribe(
      {
        next: (results: any) => {
          this.updateDocDataotherthanfile.document_id = this.documentId.document_id;
          this.uploadDocData2.document_id = this.documentId.document_id;

          this.fileName.file_name = results[0]?.document_name;
          this.uploadDocData.category_id = results[0]?.category_id;
          this.updateDocDataotherthanfile.category_id = this.uploadDocData?.category_id;

          this.uploadDocData.description = results[0]?.description;
          this.updateDocDataotherthanfile.description = this.uploadDocData?.description;

          this.uploaddocumentForm.get('description').patchValue(results[0]?.description);

        }, error: (error) => {
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

  //donwload and save file in local system (we use package name file-saver)
  downloadPDF(path: any, name: any) {
    const fileUrl = `${this.baseUrl}${path}`;
    if (fileUrl) {
      this.checkService.checkFileExistence(fileUrl).subscribe(exists => {
        console.log(exists);
        if (exists) {
          const fileName = name;
          FileSaver.saveAs(fileUrl, fileName)
        } else {
          this.documentnotexists();
        }
      });
    }
    else {
      this.documentnotuploaded();
    }
  }

  toggleActionAdd() {
    this.toggleListBtn = false;
    this.toggleAddbtn = true;
    this.displaydocumentContainer = false;
    this.displayemptydatamsg = true;
    this.uploaddocumentForm.reset({
      document_name: '',
      category_id: null,
      file_name: '',
      description: ''
    })

    this.addButton = true;
    this.updateButton = false;

  }

  toggleActionUpdate() {
    this.toggleListBtn = true;
    this.toggleAddbtn = false;
    this.displaydocumentContainer = true;
    this.displayemptydatamsg = false;
    this.uploaddocumentForm.reset({
      document_name: '',
      category_id: null,
      file_name: '',
      description: ''
    })
  }

  documentNotuploaded() {
    Swal.fire({
      icon: 'warning',
      title: 'Warning!',
      text: 'Document not uploaded yet'
    }).then(() => {
      this.ngOnInit();
    })
  }

  onPaste(event: any) {
    event.preventDefault(); // Prevent default paste behavior
    const clipboardData = event.clipboardData.getData('text');
    if (clipboardData) {
      const currentContent = this.uploadDocData.description || ''; // Existing content or an empty string
      const newContent = currentContent + clipboardData; // Concatenate existing content with newly pasted content
      this.uploadDocData.description = newContent;
    }
  }


  typeintextarea(data: any) {
    this.uploadDocData.description = data || '';
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
    if (this.documentbydate?.start_date && this.documentbydate?.end_date) {
      if (this.documentbydate.start_date <= this.documentbydate.end_date) {
        filteredData = filteredData.filter((item: any) => {
          const filteredcreateddate = moment(item?.created_date, 'DD-MM-YYYY').format('YYYY-MM-DD');
          if (filteredcreateddate) {
            return filteredcreateddate >= this.documentbydate.start_date &&
            filteredcreateddate <= this.documentbydate.end_date;
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
    this.filteredDocumentData = filteredData;
    this.totalItems = this.filteredDocumentData.length;
    this.count = this.totalItems;
    this.page = 1; // Reset to the first page when filtering occurs
  }


  refreshfilter() {
    this.isRotating = true;
    this.getDocumentData().then(() => {
      // Clear date filters
      if (this.documentbydate?.start_date || this.documentbydate?.end_date) {
        this.documentbydate.start_date = '';
        this.documentbydate.end_date = '';
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
      this.filteredDocumentData = filteredData;
      this.totalItems = this.filteredDocumentData.length;
      this.page = 1; // Reset to the first page when filtering occurs
      setTimeout(() => {
        this.isRotating = false;

      }, 500);
    });
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

    this.filteredDocumentData.sort((a: any, b: any) => {
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

//   exportToExcel() {
//     const randomDate = new Date().valueOf();
//     const uri = 'data:application/vnd.ms-excel;base64,';
//     const template = `
//     <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
//     <head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
//     <body>{table}</body>
//     </html>
//   `;
//     const base64 = function (s: any) { return window.btoa(unescape(encodeURIComponent(s))) };
//     const format = function (s: any, c: any) { return s.replace(/{(\w+)}/g, function (m: any, p: any) { return c[p]; }) };

//     // Define your column names
//     const columnNames = ['S.No.', 'Document Name', 'Vendor Name', 'Category Name', 'Created By', 'Upload Date'];

//     const tableHtml = `<table style="border-collapse: collapse; width: 80%; background-color: #f2f2f2;">
//   <thead>
//     <tr style="background-color: #00008B; color:#fff;">
//       ${columnNames.map((name) => `<th style="border: 1px solid #dddddd; text-align: left; padding: 1px;">${name}</th>`).join('')}
//     </tr>
//   </thead>
//   <tbody>
//     ${this.filteredDocumentData.map((item: any, index: number) => {
//       return `
//         <tr style="border: 1px solid #dddddd; text-align: left; padding: 1px;">
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${index + 1}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.document_name}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.category_name ? item.category_name : 'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.description ? item.description : 'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item.user_name ? item.user_name : 'NA'}</strong></td>
//           <td style="border: 1px solid #dddddd; text-align: left; padding: 1px;"><strong>${item?.created_date ? item?.created_date : 'NA'}</strong></td>
//         </tr>`;
//     }).join('')}
//   </tbody>
// </table>`;

//     const ctx = { worksheet: 'Worksheet', table: tableHtml };
//     const link = document.createElement('a');
//     link.download = `report_document_data.xls`;
//     link.href = uri + base64(format(template, ctx));
//     link.click();
//   }

  checkAndOpenFile(filePath: string) {
    if (filePath) {
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
    else {
      this.documentnotuploaded();
    }

  }

  exportToexcelfromnode(): any {
    const modifiedItemsDataList = this.filteredDocumentData.map((item: any, index: any) => {
      return {
        ...item,  // Spread the original object properties
        "S.No.": index + 1  // Add the S.No. field with the appropriate value
      };
    });

    const reportRequest = {
      reportTitle: "Document List",
      columns: [
        { header: 'S.No.', key: 'S.No.', width: 10, filterButton: false },
        { header: 'Document Name', key: 'document_name',width: 55, filterButton: true },
        { header: 'Category Name', key: 'category_name', width: 35, filterButton: true },
        { header: 'Description', key: 'description', width: 55, filterButton: true },
        { header: 'Uploaded By', key: 'user_name', width: 25, filterButton: false },
        { header: 'Upload Date', key: 'created_date', width: 30, format: 'date', filterButton: false },
      ],
      data:modifiedItemsDataList,
      totalsrow:false , // Data to populate the report
      totalsRowFunction: "sum" ,
      filters:[
        { filterBy:(this.documentbydate.start_date && this.documentbydate.end_date)?'Upload Date':'' , startDate:this.documentbydate.start_date||'', endDate:this.documentbydate.end_date||''}
      ]
    };

    this.filesServices.exportToExcel(reportRequest).subscribe(
      (response: Blob) => {
        // Call downloadBlob to trigger the download with the response
        this.filesServices.downloadBlob(response, 'report_document_data.xlsx');
      },
      (error) => {
        console.error('Error exporting to Excel', error);
      }
    );
  }

  documentnotuploaded() {
    Swal.fire({
      icon: 'warning',
      title: 'Warning!',
      text: 'File not uploaded yet!'
    })
  }

  documentnotexists() {
    Swal.fire({
      icon: 'warning',
      title: 'Warning!',
      text: 'File does not exists!'
    })
  }

  validation() {
    this.uploaddocumentForm = new FormGroup({
      document_name: new FormControl('', [Validators.required]),
      category_id: new FormControl(null, [Validators.pattern(/^(?=.*[1-9])[0-9]*[.,]?[0-9]{1,9}$/)]),
      file_name: new FormControl(''),
      description: new FormControl('', [Validators.required])
    })
  }

}
