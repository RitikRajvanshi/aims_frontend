import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import { environment } from 'src/app/environments/environment.prod';
import Swal from 'sweetalert2';
import { firstValueFrom, forkJoin } from 'rxjs';
import Chart from 'chart.js/auto';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
interface MonthlyData {
  month: number;
  year: number;
  count: number;
  currencyTotals: { [currency: string]: number };
}
@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})

export class UserDashboardComponent implements OnInit {
  public chart: any;

  productionurl: any;
  firstDay: any;
  lastDay: any;
  OrderCount: number = 0;
  requestCount: number = 0;
  gatepassCount: number = 0;
  vendorData: any[] = [];
  lastfinnancialyrDate: any;
  nextfinnancialyrDate: any;
  DatesforFinancialyearreport = {
    start_date: '',
    end_date: ''
  };
  DatesforMothlyreport = {
    start_date: '',
    end_date: ''
  };

  currentMonthname: any;

  sumofPurchasingArray: any[] = [];
  numberofPoarray: any[] = [];
  amountofpurchasingyearly: any;
  amountofpurchasingmonthly: any;
  noofpoyearly: any;
  noofpomonthly: any;

  sumofPurchaseOrder: any;
  countOfitems: any;

  userName = localStorage.getItem('name');
  userRole = localStorage.getItem('level');

  monthlyReport = {
    sumtotal: 0,
    count: 0
  }

  // financialReport = {
  //   sumtotal: {currency:0, sumtotal:0},
  //   count: 0
  // }

  financialReport: {
    sumOfPurchase: any,
    count: number
  } = {
      sumOfPurchase: {},
      count: 0
    };


  Monthlyreportvar: any;
  finacialyearreportvar: any;
  everymonthreport: any;
  everymonthSumtotal: number[] = [];
  everymonthCount: number[] = [];

  objectKeys = Object.keys; // for *ngFor over object keys in HTML
  monthlyData: MonthlyData[] = [];

  // private monthlyData: { month: number; year: number, sumTotal: number; count: number }[] = [];




  years: number[] = [];
  selectedYear: number = 0;
  headerLable = {
    start_date: '',
    end_date: ''
  };

  purchaseIdsnotpresentinItems: any[] = [];
  purchaseIdsString: string = '';

  constructor(private sharedService: SharedService, private router: Router, private spinner: NgxSpinnerService) {
    const today = moment();
    const curMonth = today.month() + 1;
    const curYear = today.year();

    if (curMonth > 3) {
      this.lastfinnancialyrDate = moment(`${curYear}-04-01`).format('YYYY-MM-DD');
      this.nextfinnancialyrDate = moment(`${curYear + 1}-03-31`).format('YYYY-MM-DD');
    } else {
      this.lastfinnancialyrDate = moment(`${curYear - 1}-04-01`).format('YYYY-MM-DD');
      this.nextfinnancialyrDate = moment(`${curYear}-03-31`).format('YYYY-MM-DD');
    }

    // console.log(this.lastfinnancialyrDate, "this.lastfinnancialyrDate");
    // console.log(this.nextfinnancialyrDate, "this.nextfinnancialyrDate");

    this.DatesforFinancialyearreport.start_date = this.lastfinnancialyrDate;
    this.DatesforFinancialyearreport.end_date = this.nextfinnancialyrDate;
  }


  ngOnInit(): void {

    // this.createeverymonthreport();
    this.createeverymonthreport();
    // this.getsumOfpurchaseOrder();
    this.getCurrentMonthFirstAndLastDates();
    this.getCurrentMonthPoandCount();
    this.getfinacialyearcountandsum();
    this.countOfreceivedOrderandrequest();
    this.productionurl = environment.ADMIN_URL;

    this.generateYearList();
  }


  // Generate years from 2017 to current
  async generateYearList() {
    try {
      const result: any = await firstValueFrom(this.sharedService.getPurchaseJoinData());

      console.log(moment(result[result.length - 1].issue_date).format('YYYY'), "result");
      if (result && result.length) {
        const startYear = Number(moment(result[result.length - 1].issue_date).format('YYYY'));

        const currentYear = new Date().getFullYear();
        for (let y = startYear; y <= currentYear; y++) {
          this.years.push(y);
        }
      }
    }
    catch (error) {
      console.error('Error fetching start year:', error);
    }
  }

  // Called when dropdown changes
  onYearChange() {
    this.loadFinancialYear(this.selectedYear);
  }


  // Load financial year data for a given year
  async loadFinancialYear(year: number) {
    try {
      const startDate = moment(`${Number(year)}-04-01`).format('YYYY-MM-DD');
      const endDate = moment(`${Number(year) + 1}-03-31`).format('YYYY-MM-DD');

      this.DatesforFinancialyearreport.start_date = startDate;

      this.headerLable.start_date = moment(`${Number(year)}-04-01`).format('MMM YYYY');
      this.headerLable.end_date = moment(`${Number(year) + 1}-03-31`).format('MMM YYYY');

      this.DatesforFinancialyearreport.end_date = endDate;

      // console.log(this.DatesforFinancialyearreport, "loadFinancialYear");

      // Use your existing method that calls APIs
      this.finacialyearreportvar = await this.getPoandNumberofItems(this.DatesforFinancialyearreport);

      this.financialReport.sumOfPurchase = this.finacialyearreportvar.sumOfPurchase;
      this.financialReport.count = this.finacialyearreportvar.numberofItems[0]?.count || 0;


      this.createeverymonthreportForYear({ start_date: startDate, end_date: endDate });

      // console.log(`Financial year ${year}-${year+1} data:`, this.finacialyearreportvar);


    } catch (error: unknown) {
      console.error(error, 'loadFinancialYear');
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: 'Failed to load financial year data!',
      });
    }
  }


  countOfreceivedOrderandrequest() {
    forkJoin(
      [
        this.sharedService.getCountofreceiveorder(),
        this.sharedService.getCountofreceiverequest(),
        this.sharedService.getcountsendgatepasses(),
        this.sharedService.getsupplierdata(),
        this.sharedService.getpurchaseidsnotinitems(),
      ]).subscribe(
        {
          next: ([ordercount, requestcount, gatepasscount, supplierData, purchaseidsNotinItems]) => {
            this.OrderCount = (ordercount as any[])[0]?.count;
            this.requestCount = (requestcount as any[])[0]?.count;
            this.gatepassCount = (gatepasscount as any[])[0]?.count;
            console.log(ordercount, requestcount, gatepasscount, "supplierData");
            this.vendorData = (supplierData as any[]).filter((item: any) => item.status == '2');

            this.purchaseIdsString = (purchaseidsNotinItems as unknown[]).map((item: any) => item.purchase_id)
              .join(', ');
            this.purchaseIdsnotpresentinItems = (purchaseidsNotinItems as unknown[]);
            // console.log(this.purchaseIdsnotpresentinItems.length, "this.purchaseIdsString");
            // console.log(this.OrderCount, this.requestCount);
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


  async getfinacialyearcountandsum() {
    try {
      const today = moment();
      const curMonth = today.month() + 1;
      const curYear = today.year();

      if (curMonth > 3) {
        this.lastfinnancialyrDate = moment(`${curYear}-04-01`).format('YYYY-MM-DD');
        this.nextfinnancialyrDate = moment(`${curYear + 1}-03-31`).format('YYYY-MM-DD');
      } else {
        this.lastfinnancialyrDate = moment(`${curYear - 1}-04-01`).format('YYYY-MM-DD');
        this.nextfinnancialyrDate = moment(`${curYear}-03-31`).format('YYYY-MM-DD');
      }

      // console.log(this.lastfinnancialyrDate, "this.lastfinnancialyrDate");
      // console.log(this.nextfinnancialyrDate, "this.nextfinnancialyrDate");

      this.DatesforFinancialyearreport.start_date = this.lastfinnancialyrDate;
      this.DatesforFinancialyearreport.end_date = this.nextfinnancialyrDate;
      // console.log(this.DatesforFinancialyearreport, "getfinacialyearcountandsum");

      this.finacialyearreportvar = await this.getPoandNumberofItems(this.DatesforFinancialyearreport);

      this.financialReport.sumOfPurchase = this.finacialyearreportvar.sumOfPurchase;
      this.financialReport.count = this.finacialyearreportvar.numberofItems[0].count;

    }

    catch (error: unknown) {
      console.log(error, "getfinacialyearcountandsum");
      if (error instanceof HttpErrorResponse && error.status === 403) {
        await Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Token expired.',
          footer: '<a href="../login">Please login again!</a>'
        }).then(() => {
          this.router.navigate(['../login']);
        })

      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Internal server error. Please try after some time!',
          footer: '<a href="../login">Login</a>'
        }).then(() => {
          location.reload();
        })
      }
    }

  }

  getCurrentMonthFirstAndLastDates() {
    const currentDate = moment();

    // First day of the current month
    this.firstDay = currentDate.clone().startOf('month').toDate();
    this.currentMonthname = currentDate.format('MMMM-YY');

    // Last day of the current month
    this.lastDay = currentDate.clone().endOf('month').toDate();

    this.DatesforMothlyreport.start_date = this.firstDay;
    this.DatesforMothlyreport.end_date = this.lastDay;
  }

  async getCurrentMonthPoandCount() {
    try {

      const currentDate = moment();

      // First day of the current month
      this.firstDay = currentDate.clone().startOf('month').format('YYYY-MM-DD');

      // Last day of the current month
      this.lastDay = currentDate.clone().endOf('month').format('YYYY-MM-DD');

      this.DatesforMothlyreport.start_date = this.firstDay;
      this.DatesforMothlyreport.end_date = this.lastDay;


      // console.log(this.DatesforMothlyreport, "this.DatesforMothlyreport")

      this.Monthlyreportvar = await this.getPoandNumberofItems(this.DatesforMothlyreport);

      // console.log(this.Monthlyreportvar, "this.Monthlyreportvar");
      this.monthlyReport.sumtotal = this.Monthlyreportvar.sumOfPurchase[0]?.sumtotal;
      this.monthlyReport.count = this.Monthlyreportvar.numberofItems[0]?.count;
      // this.monthlyReport.count = this.variable2.count[0]
    }
    catch (error: unknown) {
      // console.log(error, "getCurrentMonthPoandCount");
      if (error instanceof HttpErrorResponse && error.status === 403) {
        await Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Token expired.',
          footer: '<a href="../login">Please login again!</a>'
        }).then(() => {
          this.router.navigate(['../login']);
        })

      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Internal server error. Please try after some time!',
          footer: '<a href="../login">Login</a>'
        }).then(() => {
          location.reload();
        })
      }
    }
  }



  //the below function is gives us array of start date of each month and last date of each month start from 11 month of current month till now..
  generateFinancialYearDates(): { start_date: string; end_date: string }[] {
    const currentDate = moment();

    const startingDate = currentDate.clone().subtract(11, 'months').startOf('month');
    this.headerLable.start_date = currentDate.clone().subtract(11, 'months').startOf('month').format('MMM YYYY');

    const endingDate = currentDate.endOf('month');
    this.headerLable.end_date = currentDate.endOf('month').format('MMM YYYY');


    const datesArray: { start_date: string; end_date: string }[] = [];

    while (startingDate.isSameOrBefore(endingDate, 'month')) {
      const startDateString = startingDate.format('YYYY-MM-DD');
      const endDateString = startingDate.clone().endOf('month').format('YYYY-MM-DD');

      datesArray.push({ start_date: startDateString, end_date: endDateString });

      startingDate.add(1, 'month');
    }
    // console.log(datesArray, "datesArray");
    return datesArray;
  }


  formatDate(date: Date): string {
    const dd: string = String(date.getDate()).padStart(2, '0');
    const mm: string = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy: number = date.getFullYear();
    return yyyy + '-' + mm + '-' + dd;
  }


  async createeverymonthreport() {
    const financialYearDates = this.generateFinancialYearDates();

    const promises = financialYearDates.map(async (dateRange: any) => {
      try {
        const ele: any = await this.getPoandNumberofItems(dateRange);
        const startDate = moment(dateRange.start_date);
        const adjustedMonth = startDate.month(); // 0-indexed
        const year = startDate.year();

        const currencyTotals: { [currency: string]: number } = {};
        (ele.sumOfPurchase || []).forEach((item: any) => {
          currencyTotals[item.currency] = +item?.sumtotal || 0;
        });

        this.monthlyData.push({
          month: adjustedMonth + 1, // 1-based month
          year,
          count: +ele.numberofItems?.[0]?.count || 0,
          currencyTotals
        });

      } catch (error) {
        // Handle errors
        console.error('Error fetching monthly data:', error);
      }
    });

    await Promise.all(promises);

    // Sort by year then month
    this.monthlyData.sort((a, b) => (a.year - b.year) || (a.month - b.month));

    this.prepareChartData();
  }


  async createeverymonthreportForYear(dateRange: { start_date: string, end_date: string }) {
    const start = moment(dateRange.start_date);
    const end = moment(dateRange.end_date);

    const datesArray: { start_date: string; end_date: string }[] = [];
    const current = start.clone();

    while (current.isSameOrBefore(end, 'month')) {
      datesArray.push({
        start_date: current.clone().startOf('month').format('YYYY-MM-DD'),
        end_date: current.clone().endOf('month').format('YYYY-MM-DD')
      });
      current.add(1, 'month');
    }

    this.monthlyData = [];
    const promises = datesArray.map(range => this.getPoandNumberofItems(range).then((ele: any) => {
      const currencyTotals: { [currency: string]: number } = {};
      (ele.sumOfPurchase || []).forEach((item: any) => {
        // currencyTotals[item.currency] = +item?.sumtotal || 0;
        currencyTotals[item.currency] = Number(
          String(item?.sumtotal).replace('+', '')
        ) || 0;
      });

      const startDate = moment(range.start_date);
      this.monthlyData.push({
        month: startDate.month() + 1,
        year: startDate.year(),
        count: +ele.numberofItems?.[0]?.count || 0,
        currencyTotals
      });
    }));

    await Promise.all(promises);
    this.monthlyData.sort((a, b) => (a.year - b.year) || (a.month - b.month));
    this.prepareChartData();
  }


  prepareChartData() {
    const labels: string[] = [];
    const countData: number[] = [];
    const currencyDataMap: { [currency: string]: number[] } = {};

    this.monthlyData.forEach(entry => {
      const monthName = moment().month(entry.month - 1).format('MMM');
      labels.push(`${monthName}-${entry.year}`);
      countData.push(entry.count);

      for (const currency in entry.currencyTotals) {
        if (!currencyDataMap[currency]) {
          currencyDataMap[currency] = Array(this.monthlyData.length).fill(0);
        }
      }
    });

    this.monthlyData.forEach((entry, i) => {
      for (const currency in currencyDataMap) {
        currencyDataMap[currency][i] = entry.currencyTotals[currency] || 0;
      }
    });

    this.createChart(labels, currencyDataMap, countData);
  }


  createChart(labels: string[], currencyDataMap: { [currency: string]: number[] }, countdata: number[]) {

    if (this.chart) {
      this.chart.destroy();
      this.chart = null; // important
    }

    const datasets = Object.keys(currencyDataMap).map((currency, index) => ({
      label: `Purchase (${currency})`,
      data: currencyDataMap[currency],
      backgroundColor: this.getColor(index),
      yAxisID: 'first'
    }));

    datasets.push({
      label: 'Number of POs',
      data: countdata,
      backgroundColor: '#427eee',
      yAxisID: 'second'
    });

    this.chart = new Chart("MyChart", {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 0.65,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Months',
              font: { weight: 'bold' }
            },
            ticks: {
              font: { weight: 'bold' },
              color: 'black'
            },
            grid: { display: true }
          },
          first: {
            title: {
              display: true,
              text: 'Total Purchase Amount',
              font: { weight: 'bold' },
              color: '#8f8f8f'
            },
            ticks: { font: { weight: 'bold' }, color: 'red' },
            grid: { display: true }
          },
          second: {
            type: 'linear',
            position: 'right',
            min: 0,
            max: 20,
            title: {
              display: true,
              text: 'Number of POs',
              font: { weight: 'bold' },
              color: '#8f8f8f'
            },
            ticks: { font: { weight: 'bold' }, color: '#427eee' },
            grid: { display: false }
          }
        }
      }
    });
  }

  getColor(index: number): string {
    const colors = ['#f96150', '#79a471', '#00bcd4', '#ff9800', '#9c27b0', '#4caf50'];
    return colors[index % colors.length];
  }


  async getPoandNumberofItems(obj: object) {
    try {
      const sumOfPurchaseResponse: any = await this.sharedService.getSumofpurchaseOrderbyDate(obj).toPromise();
      const receiveRequestResponse = await this.sharedService.getCountofPruchaseOrder(obj).toPromise();

      // Convert currency array to object for easier UI display
      const sumOfPurchaseByCurrency: Record<string, number> = {};
      sumOfPurchaseResponse.forEach((item: any) => {
        sumOfPurchaseByCurrency[item.currency] = Number(Number(item?.sumtotal || 0).toFixed(2));
      });

      return {
        sumOfPurchase: sumOfPurchaseResponse,
        numberofItems: receiveRequestResponse
      };
    }
    catch (error: any) {
      console.log(error, "getPoandNumberofItems");
      if (error instanceof HttpErrorResponse && error.status === 403) {
        await Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Token expired.',
          footer: '<a href="../login">Please login again!</a>'
        }).then(() => {
          this.router.navigate(['../login']);
        })

      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Internal server error. Please try after some time!',
          footer: '<a href="../login">Login</a>'
        }).then(() => {
          location.reload();
        })
      }
      throw error;
    }
  }


  RoutetoInspectionForm() {
    // Example: navigate with first purchase_id
    const purchaseId: any = this.purchaseIdsnotpresentinItems[0].purchase_id;
    // Mark that we navigated forward
    localStorage.setItem('navigated', 'true');

    if (purchaseId) {
      this.router.navigate(
        ['/user/upload-inspection-form'],
        { queryParams: { purchaseid: purchaseId } }
      );
    }


  }

}





