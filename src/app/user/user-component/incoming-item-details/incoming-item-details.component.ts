import { Component } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-incoming-item-details',
  templateUrl: './incoming-item-details.component.html',
  styleUrls: ['./incoming-item-details.component.scss']
})
export class IncomingItemDetailsComponent {
  searchItem='';
  page:number = 1;
  count:number = 0;
  tableSize:number = 10;
  tableSizes:any=[5,10,15,20,50,100];
  lastfinnancialyrDate:any;
  nextfinnancialyrDate:any;

  constructor(private sharedService:SharedService){}

  ngOnInit(): void {
    
  }
}
