import { Component, ViewChild, ElementRef } from '@angular/core';
import * as moment from 'moment';
import { SharedService } from 'src/app/services/shared.service';
import { AdminService } from 'src/app/services/admin.service';
import Swal from 'sweetalert2';
import domToImage from 'dom-to-image';
import jsPDF from 'jspdf';
import * as htmlToImage from 'html-to-image';
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';
import { Observable, map } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-gatepass-list',
  templateUrl: './gatepass-list.component.html',
  styleUrls: ['./gatepass-list.component.scss']
})
export class GatepassListComponent {
  @ViewChild('dataToExport', { static: false }) public dataToExport!: ElementRef;
  gatepassdata: any[] = [];
  gatepassdataforpdf:any []=[];
  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];
  gatepassid = null;
  searchTerm: string = '';
  searchItem = '';
  totalItems: number = 0;
  pdfdata:any[]=[];
  currentdate:any;
  getgatepassdataforpdf:any[]=[];
  showSection: boolean = false;
  viewformats:boolean = false;
  approvedbysir:any;
  currentSortColumn: string = ''; // Variable to store the current sort column
  isAscending: any; // Variable to store the current sorting order
  itemsData: any[] = [];
  sortingorder:any;
 
  

  constructor(private sharedService: SharedService, private adminService: AdminService, private route: ActivatedRoute, private router:Router) {
    this.currentdate = moment().format('DD-MM-YYYY');
  }

  ngOnInit() {
    this.getGatepassdata(this.gatepassid);
  }

  async getGatepassdata(id: any) {
    this.route.params.subscribe(async (params: any) => {
      // this.purchaseId = params['id'];
      const gatePassid = {
        gatepass_id: +params['id']
      };


      try{
        const results:any = await this.sharedService.getgatepassdatabyid(gatePassid).pipe(
          retry(3), // Retry the request up to 3 times
          catchError((error: HttpErrorResponse) => {
            console.error('Error fetching user data:', error);
            return of([]); // Return an empty array if an error occurs
          })
        ).toPromise();

        this.approvedbysir = results[0].is_sent;
         const filteredResults = results.map((e: any) => {
                const filteredoutdate = e.out_date ?moment(e.out_date).format('DD-MM-YYYY'):null;
                const filteredindate = e.in_date ?moment(e.in_date).format('DD-MM-YYYY'):null;
                return { ...e, out_date: filteredoutdate, in_date: filteredindate }
            });
  
          this.gatepassdata = filteredResults;
          this.count = filteredResults.length;
          this.itemsData = filteredResults;
         console.log(this.gatepassdata, "getGatepassdata");
      }
      catch(err){
        console.error(err);
      }
     
  })
 

  }

  getGatepassdataforpdf(id: any): Observable<any> {
   
    return this.sharedService.getgatepassdatabyid(id).pipe(
      map((results: any) => {
        console.log(results);
        let filteredoutdate: any;
        let filteredindate: any;
        return results.map((e: any) => {
            filteredoutdate = e.out_date?moment(e.out_date).format('DD-MM-YYYY'):null;
            filteredindate = e.in_date?moment(e.in_date).format('DD-MM-YYYY'):null;
          return { ...e, out_date: filteredoutdate, in_date: filteredindate }
        });
      })
    );
  }

  async gatepassreturn(data: any) {
    try {
      const receiveditemObj = {
        gatepass_id: data?.gatepass_id,
        in_date: moment().format('DD-MM-YYYY'),
        received_by: localStorage.getItem('name'),
        item_code: data?.item_code
      }

      const response = await this.adminService.receiveditemfromuserforgp(receiveditemObj).toPromise();
      console.log(response, "gatepassreturn");
      await Swal.fire({
        title: 'Success!',
        text: 'Item received successfully!',
        icon: 'success',
      })

      this.getGatepassdata(this.gatepassid);

    }
    catch (err) {
      console.error(err);
    }

  }


  async filterData(): Promise<void> {
    // If the originalData is not set, initialize it with the current itemsData
    if (!this.itemsData) {
      this.itemsData = this.itemsData;
    }

    // Start with the original data or the previously filtered data
    let filteredData: any[] = this.itemsData;
    // Filter by search term
    if (this.searchTerm) {
      filteredData = filteredData.filter((item: any) => {
        return Object.keys(item).some(key => {
          if (item[key] !== null && item[key] !== '' && (key === 'in_date' || key === 'out_date')) {
            return item[key]?.includes(this.searchTerm);
          } else if (item[key] !== null && item[key] !== '') {
            return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
          }
          return false;
        });
      });
    }

  

    // Update filtered data and totalItems
    this.gatepassdata = filteredData;
    this.totalItems = this.gatepassdata.length;
    this.count = filteredData.length;
    this.page = 1; // Reset to the first page when filtering occurs
  }

  NoSpaceallowedatstart(event: any) {
    if (event.target.selectionStart === 0 && event.code === "Space") {
      event.preventDefault();
    }
  }

  ontableDatachange(event: any) {
    this.page = event;
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
  }


  async getpdfdata(data:any){
      this.viewformats = true;
      const gatepassId = {
        gatepass_id:+data.gatepass_id
      }
      console.log(gatepassId);
  
      const results = await this.getGatepassdataforpdf(gatepassId).toPromise();

      console.log(results, "pdfdata");
      this.pdfdata = results;

      await new Promise(resolve => setTimeout(resolve, 500));
      await this.downloadAsPdf();
      this.viewformats = false;
  }
  
  public async downloadAsPdf(){
    const width = this.dataToExport.nativeElement.clientWidth;
    const height = this.dataToExport.nativeElement.clientHeight;
    const imageUnit = 'pt';
    const A4_WIDTH = 841.89; // A4 landscape width in points
    const A4_HEIGHT = 595.28; // A4 landscape height in points
  
    let scaledWidth = A4_WIDTH;
    let scaledHeight = (height / width) * A4_WIDTH; // Calculate height proportionally
  
    // If the calculated height is greater than A4_HEIGHT, adjust the dimensions
    if (scaledHeight > A4_HEIGHT) {
      scaledHeight = A4_HEIGHT;
      scaledWidth = (width / height) * A4_HEIGHT; // Calculate width proportionally
    }
  
    const orientation = 'l'; // Landscape orientation
  
    try {
      const randomDate = new Date().valueOf();

      const dataUrl = await domToImage.toPng(this.dataToExport.nativeElement, { width: width, height: height });
      const img = new Image();
      img.src = dataUrl;
  
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          resolve(); // Resolve without passing any value
        };
        img.onerror = (error) => {
          reject(error);
        };
      });
  
      const pdf = new jsPDF({
        orientation: orientation,
        unit: imageUnit,
        format: [scaledWidth, scaledHeight]
      });
  
      pdf.addImage(img, 'PNG', 0, 0, scaledWidth, scaledHeight);
  
      pdf.save(`gatepassid_${this.pdfdata[0]?.gatepass_id}_${this.currentdate}_${randomDate}`);
    } catch (error) {
      console.error('Error while converting to PDF:', error);
    }
  }

  // sort(columnName: string) {
  //   if (this.currentSortColumn === columnName) {
  //     this.isAscending = !this.isAscending; // Toggle sorting order
  //   } else {
  //     this.currentSortColumn = columnName; // Update current sort column
  //     this.isAscending = true; // Set sorting order to ascending for the new column
  //   }
  
  //   this.gatepassdata.sort((a: any, b: any) => {
  //     let comparison = 0;
  //     const valueA = a[columnName];
  //     const valueB = b[columnName];
  
  //     // Handle null or undefined values
  //     if (valueA === null || valueA === undefined) {
  //       comparison = valueB === null || valueB === undefined ? 0 : -1;
  //     } else if (valueB === null || valueB === undefined) {
  //       comparison = 1;
  //     } else {
  //       if (this.isDate(valueA) && this.isDate(valueB)) {
  //         const dateA = moment(valueA);
  //         const dateB = moment(valueB);
  //         comparison = dateA.diff(dateB);
  //       } else if (this.isNumber(valueA) && this.isNumber(valueB)) {
  //         comparison = valueA - valueB;
  //       } else {
  //         comparison = valueA.toString().localeCompare(valueB.toString());
  //       }
  //     }
  
  //     return this.isAscending ? comparison : -comparison;
  //   });
  // }
  
  // isDate(value: any): boolean {
  //   return moment(value, moment.ISO_8601, true).isValid();
  // }
  
  // isNumber(value: any): boolean {
  //   return !isNaN(value);
  // }

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

    this.gatepassdata.sort((a: any, b: any) => {
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


  async viewgatepass(data:any){
    this.viewformats = !this.viewformats;
    const gatepassId = {
      gatepass_id:+data.gatepass_id
    }
    console.log(gatepassId);

    const results = await this.getGatepassdataforpdf(gatepassId).toPromise();
    console.log(results);
    this.pdfdata = results;
    // await new Promise(resolve => setTimeout(resolve, 1000));

  }

  navigateBack() {
    let variable = localStorage.getItem('backUrl');
    this.router.navigateByUrl(`${variable}`);
    localStorage.removeItem('backUrl');
  }


}
