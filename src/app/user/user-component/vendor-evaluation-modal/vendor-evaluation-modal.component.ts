import { Component } from '@angular/core';
import { Inject } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { retry } from 'rxjs';

@Component({
  selector: 'app-vendor-evaluation-modal',
  templateUrl: './vendor-evaluation-modal.component.html',
  styleUrls: ['./vendor-evaluation-modal.component.scss']
})
export class VendorEvaluationModalComponent {

  supplierEvaluationData: any;
  supplierDatalength: any;
  EvaluationArray: any = []
  EvaluationId = {
    user_id: 0
  }

  sumofEvaluation = 0;
  avgofSumofEvaluation = 0;
  averageGradingVar: any;
  generalRating = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private Ref: MatDialogRef<VendorEvaluationModalComponent>, private sharedService: SharedService, private router: Router) {

  }

  ngOnInit(): void {
    this.VendorEvaluationDatabysupplierid(this.data);
    this.supplierdatalist();

  }

  VendorEvaluationDatabysupplierid(id: any) {

    this.sharedService.getsupplierEvaluationdatabysupplierId(id).subscribe(
      {
        next: (results: any) => {
          this.supplierEvaluationData = JSON.parse(JSON.stringify(results));
          this.supplierEvaluationData.map((e: any) => {
            this.EvaluationArray.push(e.qualitybasis_grading, e.pricebasis_grading, e.communicationbasis_grading, e.deliverybasis_grading, e.commitmentbasis_grading);
          })

          this.supplierDatalength = results.length;
          // this.EvaluationArray = this.EvaluationArray.map(this.convertGrading);

          // The below process is to evaluate the average calculation and rating of evaluation  of the vendor....
          this.sumofEvaluation = this.processGradesAndSum(this.EvaluationArray);
          this.avgofSumofEvaluation = this.processGradesAndSum(this.EvaluationArray) / +this.supplierDatalength;
          this.averageGrading(this.avgofSumofEvaluation);
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

  processGradesAndSum(gradingarr: any) {
    let sum = 0;
    for (let i = 0; i < gradingarr.length; i++) {
      const grade = gradingarr[i];

      switch (grade) {
        case "A":
          gradingarr[i] = 3;
          sum += 3;
          break;
        case "B":
          gradingarr[i] = 2;
          sum += 2
          break;
        case "C":
          gradingarr[i] = 1;
          sum += 1
          break;
        default:

          // If the grade is not A, B, or C, leave it as is and ignore for sum
          if (typeof grade === 'number' && !isNaN(grade)) {
            sum += grade;
          }
      }
    }
    return sum
  }

  //average calculation converted into average rating...
  averageGrading(grade: number) {
    if (!isNaN(grade) && grade !== null) {
      if (grade <= 12) {
        this.averageGradingVar = "C";
      }
      else if (grade == 12) {
        this.averageGradingVar = "B"

      }
      else {
        this.averageGradingVar = "A"
      }
    }
    else {
      this.averageGradingVar = "Not Defined Yet"
    }

  }

  async supplierdatalist() {
    try {
      const results: any = await this.sharedService.getsupplierdata().pipe(
        retry(3), // Retry the request up to 3 times
      ).toPromise();
      
      console.log(this.data, "supplier_id");
      const filteredVendor = results.filter((data: any) => {
        return data.supplier_id == this.data.supplier_id;
      });

      // console.log(filteredVendor[0].rating, "results");
      if (filteredVendor.length) {
        this.generalRating = filteredVendor[0].rating;
      }
    }
    catch (error: unknown) {
      console.error(error, "Error at Vendors data");
    }
  }
}
