import { Component } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';

@Component({
  selector: 'app-report-items-list',
  templateUrl: './report-items-list.component.html',
  styleUrls: ['./report-items-list.component.scss']
})
export class ReportItemsListComponent {
  isDataorNot:boolean = true;
  itemsDataList: any = [];
  empltyDataList=[];
  searchItem = '';

  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];

  itemData: any[] = [];
  filtereditemList: any[] = [];
  searchTerm: string = '';
  totalItems: number=0;

  constructor(private sharedService: SharedService, private router: Router, private spinner:NgxSpinnerService) { }

  ngOnInit(): void {

    this.getitemsDataList();
  }

  getitemsDataList() {
    this.sharedService.getitemsData().pipe(map((results:any)=>{
    this.spinner.show();
      if(results?.length==0){
        this.isDataorNot = false;
      }
      else{
        this.isDataorNot = true;
        return results.map((item: any) => {
            
          if (item.created_date && item.warrantyend_date) {
            const splitecreateddate = moment(item.created_date).format('DD-MM-YYYY');
            const splitewarrantyenddate = moment(item.warrantyend_date).format('DD-MM-YYYY');
            return { ...item, created_date: splitecreateddate, warrantyend_date:splitewarrantyenddate};
          }
          return item;
        });
      }
    })).subscribe({
      next:(filteredResults: any)=>{

      this.filtereditemList = filteredResults;
      this.itemData = filteredResults;
      this.count = filteredResults.length;
      this.spinner.hide();
    
    },
  error:(error)=>{
    this.spinner.hide();
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
    this.applyFilter();
      
  }

  applyFilter(): void {
    if (this.searchTerm) {
      this.filtereditemList = this.itemData.filter((item: any) => {
        // Check if any property matches the search term and is not null or empty
        return Object.keys(item).some(key => {
          if (item[key] !== null && item[key] !== '' && key === 'created_date' || key === 'warrantyend_date' ) { 
            return item[key]?.includes(this.searchTerm);

          } 
          else if (item[key] !== null && item[key] !== '') {
            // For other properties, check if they include the search term
            return item[key]?.toString().toLowerCase()?.includes(this.searchTerm.toLowerCase());
          }
          return false; // Ignore null or empty properties
        });
      });
    } else {
      this.filtereditemList = this.itemData;
    }

    this.totalItems = this.filtereditemList.length;
    this.count = this.totalItems;

    this.page = 1; // Reset to the first page when filtering occurs 
  }

  ontableDatachange(event: any) {
    this.page = event;
    // this.getitemsDataList();

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
    // this.getitemsDataList();

  }


}
