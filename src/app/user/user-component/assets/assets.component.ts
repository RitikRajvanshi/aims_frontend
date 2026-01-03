import { Component } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { FormGroup, FormControl } from '@angular/forms';
import { environment } from 'src/app/environments/environment.prod';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
})
export class AssetsComponent {
  isDataorNot:boolean = true;
  dateForm: any;
  dates = {
    start_date: '',
    end_date: ''
  }
  displayList = false;
  purchaseDataList: any = [];
  searchItem = '';

  page: any = 1;
  count: any = 0;
  tableSize: any = 20;
  tableSizes: any = [20, 50, 100, 'All'];
  
  lastfinnancialyrDate: any;
  nextfinnancialyrDate: any;
  pathTobackend = environment.BASE_URL + 'files';
  previousUrl:any;


  constructor(private sharedService: SharedService, private router: Router, private location:Location) { }

  ngOnInit(): void {
    this.validation();
    this.getFinancialYear();
  }

  getFinancialYear() {
    var today = new Date();
    var curMonth = today.getMonth() + 1
    var curDate = today.getDate()
    var curYear = today.getFullYear();

    if (curMonth > 3) {
      this.lastfinnancialyrDate = curYear.toString() + '-' + '04' + '-' + '01';
      this.nextfinnancialyrDate = (curYear + 1).toString() + '-' + '03' + '-' + '31';

    } else {
      this.lastfinnancialyrDate = (curYear - 1).toString() + '-' + '-' + '04' + '-' + '01';
      this.nextfinnancialyrDate = (curYear + 1).toString() + '-' + '03' + '-' + '31';
    }

    this.dates.start_date = this.lastfinnancialyrDate;
    this.dates.end_date = this.nextfinnancialyrDate;

  }

   async submitDate() {
    // console.log(this.dates)

    try{
      this.displayList = true;
      this.purchaseDataList = await this.sharedService.getpurchaseorderDatabydateforasset(this.dates).toPromise();
      if(this.purchaseDataList?.length==0){
        this.isDataorNot = false;    
      }
      else{
        this.isDataorNot = true;
        return this.purchaseDataList;

      }
     
    }
    catch(error:unknown){
      if (error instanceof HttpErrorResponse && error.status === 403) {            
        await Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Token expired.',
          footer: '<a href="../login">Please login again!</a>'
        }).then(()=>{
        this.router.navigate(['../login']);
      })
    
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Internal server error. Please try after some time!',
          footer:'<a href="../login">Login</a>'
        }).then(()=>{
        location.reload();
      })
      }
  }
   

  }

  ontableDatachange(event: any) {
    this.page = event;
    // this.submitDate();
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
    // this.submitDate();
  }

  navigateToNewRoute() {
    this.previousUrl = this.location.path();
    localStorage.setItem('backUrl', this.previousUrl);
  }

  validation() {
    this.dateForm = new FormGroup({
      start_date: new FormControl(''),
      end_date: new FormControl(''),
    })
  }
}
