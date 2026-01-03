import { Component,Input,Inject,Optional  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import { AdminService } from 'src/app/services/admin.service';
import { CheckService } from 'src/app/services/check.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-supplier-evaluation',
  templateUrl: './supplier-evaluation.component.html',
  styleUrls: ['./supplier-evaluation.component.scss']
})
export class SupplierEvaluationComponent {
    @Input() purchaseid!: string |undefined |null; // Input to receive purchase I
  supplierData = {
    purchase_id: '',
    supplier_name: '',
    address: '',
    phone: '',
    mobile: '',
    email: '',
  }

  evaluationData = {
    purchase_id: '',
    evaluation_basis: '',
    vendor_status: '',
    qualitybasis_grading: '',
    pricebasis_grading: '',
    communicationbasis_grading: '',
    deliverybasis_grading: '',
    commitmentbasis_grading: '',
    flag: 'true',
    evaluation_done_by: localStorage.getItem('login_id')
  }


  evaluationGradingValuesArray: any = []
  qualityGrading: any;
  priceGrading: any;
  communicationGrading: any;
  deliveryGrading: any;
  commitmentGrading: any;

  TotalGrading = 0;
  purchaseId = {
    purchase_id: ''
  }
  supplierevaluationForm: any;
  purchaseIdFromparams: any;
  display: boolean = true;
  makeEvaluationbasisreadOnly: boolean = false;
  bgColor = 'white';
  textColor = 'black';
  BackgroundColor: any;
  TextColor: any;

  checkadminapproval = {
    admin1: 0,
    admin2: 0
  };

  hideEvaluation = false;

  constructor(public activatedRoute: ActivatedRoute, private router: Router, private sharedService: SharedService, private adminService: AdminService, private checkService: CheckService, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data:any) {

  }


  ngOnInit() {
    this.validation();
    // this.activatedRoute.params.subscribe({
    //   next: (params: any) => {

    //     this.purchaseIdFromparams = params['pid']?params['pid']:this.data;

    //     this.purchaseId.purchase_id = this.purchaseIdFromparams
    //     this.getsupplierdata(this.purchaseId);

    //     this.getPurchaseJoinDatabyPid();

    //     //verifying the supplier is already evaluated or not
    //     this.checkService.verificationofpIdinsupplierEvaluation(this.purchaseId).subscribe(
    //       {
    //         next: (results: any) => {
    //           if (results[0].verification_of_supplierevaluation == 1) {
    //             this.sharedService.getsupplierEvaluationdatabypid(this.purchaseId).subscribe(
    //               {
    //                 next: (results: any) => {
    //                   if (results[0].vendor_status == 'Approved') {
    //                     this.BackgroundColor = '#cbf5dd'
    //                   }
    //                   else if (results[0].vendor_status == 'Rejected') {
    //                     this.BackgroundColor = '#ff9a98';
    //                   }
    //                   else {
    //                     this.BackgroundColor = '#FFD580';
    //                   }
    //                   this.evaluationData.evaluation_basis = results[0].evaluation_basis;
    //                   this.evaluationData.qualitybasis_grading = results[0].qualitybasis_grading;
    //                   this.evaluationData.pricebasis_grading = results[0].pricebasis_grading;
    //                   this.evaluationData.communicationbasis_grading = results[0].communicationbasis_grading;
    //                   this.evaluationData.deliverybasis_grading = results[0].deliverybasis_grading;
    //                   this.evaluationData.commitmentbasis_grading = results[0].commitmentbasis_grading;
    //                   this.evaluationData.vendor_status = results[0].vendor_status;
    //                   this.display = false;
    //                   this.supplierevaluationForm.get('qualitybasis_grading')?.disable();
    //                   this.supplierevaluationForm.get('pricebasis_grading')?.disable();
    //                   this.supplierevaluationForm.get('communicationbasis_grading')?.disable();
    //                   this.supplierevaluationForm.get('deliverybasis_grading')?.disable();
    //                   this.supplierevaluationForm.get('commitmentbasis_grading')?.disable();
    //                   this.supplierevaluationForm.get('vendor_status')?.disable();
    //                   this.makeEvaluationbasisreadOnly = true;
    //                 },
    //                 error: (error) => {
    //                   if (error.status == 403) {
    //                     Swal.fire({
    //                       icon: 'error',
    //                       title: 'Oops!',
    //                       text: 'Token expired.',
    //                       footer: '<a href="../login">Please login again!</a>'
    //                     }).then(() => {
    //                       this.router.navigate(['../login']);
    //                     })
    //                   }
    //                   else {
    //                     Swal.fire({
    //                       icon: 'error',
    //                       title: 'Oops!',
    //                       text: 'Internal server error.Please try after some time!',
    //                       footer: '<a href="../login">Login</a>'
    //                     }).then(() => {
    //                       location.reload();
    //                     })
    //                   }
    //                 }
    //               })

    //           } else {
    //             console.log('Supplier didn\'t evaluate yet....')
    //           }

    //         }, error: (error) => {
    //           if (error.status == 403) {
    //             Swal.fire({
    //               icon: 'error',
    //               title: 'Oops!',
    //               text: 'Token expired.',
    //               footer: '<a href="../login">Please login again!</a>'
    //             }).then(() => {
    //               this.router.navigate(['../login']);
    //             })
    //           }
    //           else {
    //             Swal.fire({
    //               icon: 'error',
    //               title: 'Oops!',
    //               text: 'Internal server error.Please try after some time!',
    //               footer: '<a href="../login">Login</a>'
    //             }).then(() => {
    //               location.reload();
    //             })
    //           }
    //         }
    //       })
    //   },
    //   error: (error) => {
    //     if (error.status == 403) {
    //       Swal.fire({
    //         icon: 'error',
    //         title: 'Oops!',
    //         text: 'Token expired.',
    //         footer: '<a href="../login">Please login again!</a>'
    //       }).then(() => {
    //         this.router.navigate(['../login']);
    //       })
    //     }
    //     else {
    //       Swal.fire({
    //         icon: 'error',
    //         title: 'Oops!',
    //         text: 'Internal server error.Please try after some time!',
    //         footer: '<a href="../login">Login</a>'
    //       }).then(() => {
    //         location.reload();
    //       })
    //     }
    //   }
    // })

    this.getDatafromparams();

  }


  getDatafromparams(){
      this.activatedRoute.params.subscribe({
      next: (params: any) => {

        this.purchaseIdFromparams = params['pid']?params['pid']:this.data;

        this.purchaseId.purchase_id = this.purchaseIdFromparams
        this.getsupplierdata(this.purchaseId);

        this.getPurchaseJoinDatabyPid();

        //verifying the supplier is already evaluated or not
        this.checkService.verificationofpIdinsupplierEvaluation(this.purchaseId).subscribe(
          {
            next: (results: any) => {
              if (results[0].verification_of_supplierevaluation == 1) {
                this.sharedService.getsupplierEvaluationdatabypid(this.purchaseId).subscribe(
                  {
                    next: (results: any) => {
                      if (results[0].vendor_status == 'Approved') {
                        this.BackgroundColor = '#cbf5dd'
                      }
                      else if (results[0].vendor_status == 'Rejected') {
                        this.BackgroundColor = '#ff9a98';
                      }
                      else {
                        this.BackgroundColor = '#FFD580';
                      }
                      this.evaluationData.evaluation_basis = results[0].evaluation_basis;
                      this.evaluationData.qualitybasis_grading = results[0].qualitybasis_grading;
                      this.evaluationData.pricebasis_grading = results[0].pricebasis_grading;
                      this.evaluationData.communicationbasis_grading = results[0].communicationbasis_grading;
                      this.evaluationData.deliverybasis_grading = results[0].deliverybasis_grading;
                      this.evaluationData.commitmentbasis_grading = results[0].commitmentbasis_grading;
                      this.evaluationData.vendor_status = results[0].vendor_status;
                      this.display = false;
                      this.supplierevaluationForm.get('qualitybasis_grading')?.disable();
                      this.supplierevaluationForm.get('pricebasis_grading')?.disable();
                      this.supplierevaluationForm.get('communicationbasis_grading')?.disable();
                      this.supplierevaluationForm.get('deliverybasis_grading')?.disable();
                      this.supplierevaluationForm.get('commitmentbasis_grading')?.disable();
                      this.supplierevaluationForm.get('vendor_status')?.disable();
                      this.makeEvaluationbasisreadOnly = true;
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

              } else {
                console.log('Supplier didn\'t evaluate yet....')
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
                  location.reload();
                })
              }
            }
          })
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

  getsupplierdata(pid: any) {

    this.sharedService.getsupplierjoindatafrompo(pid).subscribe({
      next: (results: any) => {
        console.log(results[0].phone, "results");
        this.supplierData.purchase_id = results[0].purchase_id;
        this.evaluationData.purchase_id = results[0].purchase_id;

        this.supplierData.supplier_name = results[0].supplier_name;
        this.supplierData.address = results[0].address;
        this.supplierData.phone = results[0].phone;
        this.supplierData.mobile = results[0].mobile;
        this.supplierData.email = results[0].email;
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
    })
  }


  Selectqualitygrading(data: any) {
    if (data == 'A') {
      this.evaluationGradingValuesArray[0] = 3;

    }
    else if (data == 'B') {
      this.evaluationGradingValuesArray[0] = 2;

    }
    else {
      this.evaluationGradingValuesArray[0] = 1;

    }
    this.evaluationData.qualitybasis_grading = data;
    this.TotalGrading = this.evaluationGradingValuesArray.reduce(this.add, 0);
    this.gradingValue();
  }

  Selectpricegrading(data: any) {
    if (data == 'A') {
      this.evaluationGradingValuesArray[1] = 3;


    }
    else if (data == 'B') {
      this.evaluationGradingValuesArray[1] = 2;


    }
    else {
      this.evaluationGradingValuesArray[1] = 1;


    }

    this.evaluationData.pricebasis_grading = data;
    this.TotalGrading = this.evaluationGradingValuesArray.reduce(this.add, 0);
    this.gradingValue();
  }

  Selectcommunicationgrading(data: any) {
    if (data == 'A') {
      this.evaluationGradingValuesArray[2] = 3;


    }
    else if (data == 'B') {
      this.evaluationGradingValuesArray[2] = 2;


    }
    else {
      this.evaluationGradingValuesArray[2] = 1;

    }


    this.evaluationData.communicationbasis_grading = data;

    this.TotalGrading = this.evaluationGradingValuesArray.reduce(this.add, 0);
    this.gradingValue();

  }

  Selectdeliverygrading(data: any) {
    if (data == 'A') {
      this.evaluationGradingValuesArray[3] = 3;

    }
    else if (data == 'B') {
      this.evaluationGradingValuesArray[3] = 2;

    }
    else {
      this.evaluationGradingValuesArray[3] = 1;

    }

    this.evaluationData.deliverybasis_grading = data;
    this.TotalGrading = this.evaluationGradingValuesArray.reduce(this.add, 0);
    this.gradingValue();
  }

  //sum of array values thorugh reduce method
  add(accumulator: any, a: any) {
    return accumulator + a;
  }

  gradingValue() {
    if (this.TotalGrading > 12) {
      this.evaluationData.vendor_status = 'Approved';
      this.textColor = '#007500';
    }
    else if (this.TotalGrading < 12) {
      this.evaluationData.vendor_status = 'Rejected';
      this.textColor = '#ff3333';
    }
    else {
      this.evaluationData.vendor_status = 'Conditionally accepted';
      this.textColor = ' #CC5500';
    }
  }

  Selectcommitmentgrading(data: any) {
    if (data == 'A') {
      this.evaluationGradingValuesArray[4] = 3;
    }
    else if (data == 'B') {
      this.evaluationGradingValuesArray[4] = 2;
    }
    else {
      this.evaluationGradingValuesArray[4] = 1;
    }

    this.evaluationData.commitmentbasis_grading = data;
    this.TotalGrading = this.evaluationGradingValuesArray.reduce(this.add, 0);

    // Clear array using the length property
    this.TotalGrading = this.evaluationGradingValuesArray.reduce(this.add, 0);
    this.gradingValue();
    // this.evaluationGradingValuesArray.length = 0;

  }


  getPurchaseJoinDatabyPid() {
    this.sharedService.getPurchaseJoinDatabyPid(this.purchaseId).subscribe(
      {
        next: (results: any) => {
          //evaluation is  possible after purchase order is fully inspected....

          const checkinpection = results.map((e: any) => {
            //checking all purchase items are inspected in the respective purchase order
            if (e.inspected_by === 10) {
              return true   //true ---> inspected
            }
            else {
              return false     // false ---> not inspected
            }
          })

          // if includes(false) is true indicate that there is any item which is not inspected
          if (checkinpection.includes(false)) {
            this.hideEvaluation = true;
            Swal.fire({
              icon: 'warning',
              title: 'Oops...',
              text: 'Please evaluate after inspection!',
              footer: 'Without inpection, evaluation is not possible!'

            }).then(() => {
              this.navigateBack();
              // this.router.navigateByUrl('/user/upload-inspection-form');
            })
          }

          this.checkadminapproval.admin1 = results[0].approved_by_admin1;
          this.checkadminapproval.admin2 = results[0].approved_by_admin2;

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

  async addsupplierEvaluation() {
    if (this.supplierevaluationForm.invalid) {
      this.supplierevaluationForm.controls['qualitybasis_grading'].markAsTouched();
      this.supplierevaluationForm.controls['pricebasis_grading'].markAsTouched();
      this.supplierevaluationForm.controls['communicationbasis_grading'].markAsTouched();
      this.supplierevaluationForm.controls['deliverybasis_grading'].markAsTouched();
      this.supplierevaluationForm.controls['commitmentbasis_grading'].markAsTouched();
      this.supplierevaluationForm.controls['evaluation_basis'].markAsTouched();
    }
    else {
      // this.adminService.addsupplierEvaluation(this.evaluationData).subscribe(
      //   {
      //     next: (results: any) => {
      //       Swal.fire({
      //         title: 'Success!',
      //         text: 'Evaluation done successfully!',
      //         icon: 'success',
      //       }).then(() => {

      //         // this.router.navigateByUrl('user/upload-inspection-form');
      //         this.navigateBackWithParams();

      //       })
      //     }, error: (error) => {
      //       // console.log('error')
      //       if (error.status == 403) {
      //         Swal.fire({
      //           icon: 'error',
      //           title: 'Oops!',
      //           text: 'Token expired.',
      //           footer: '<a href="../login">Please login again!</a>'
      //         }).then(() => {
      //           this.router.navigate(['../login']);
      //         })
      //       }
      //       else {
      //         Swal.fire({
      //           icon: 'error',
      //           title: 'Oops!',
      //           text: 'Internal server error.Please try after some time!',
      //           footer: '<a href="../login">Login</a>'
      //         }).then(() => {
      //           location.reload();
      //         })
      //       }
      //     }
      //   })
      try {
        await firstValueFrom(this.adminService.addsupplierEvaluation(this.evaluationData));
        await Swal.fire({
          title: 'Success!',
          text: 'Evaluation done successfully!',
          icon: 'success',
        })
          .then(async () => {
            await firstValueFrom(this.adminService.sentMailforverification(this.evaluationData));
            console.info('Mail sent to vinay sir.');

            if(!this.data){
              let timerInterval:any;
            Swal.fire({
              html: `<h2 style="color:red">Redirecting to upload inspection form page!</h2>`,
              timer: 2000,
              timerProgressBar: true,
              didOpen: () => {
                Swal.showLoading();
              },
              willClose: () => {
                clearInterval(timerInterval);
              }
            }).then((result) => {
              /* Read more about handling dismissals below */
              if (result.dismiss === Swal.DismissReason.timer) {
                console.log("I was closed by the timer");
              }
              this.navigateBackWithParams();
            });
            }
            else{
              this.getDatafromparams();
            }
            
          })
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

    }

  }

  getcolor() {

    if (this.evaluationData.vendor_status == 'Rejected') {
      return 'red';
    }
    else if (this.evaluationData.vendor_status == 'Approved') {
      return 'green';
    }
    else {
      return 'white';
    }
  }
  instructions() {
    Swal.fire({
      title: '<strong>Instructions to evaluate</strong>',
      icon: 'info',
      html:
        // '<span class="text-left"><strong>If you select</strong></span>, ' +
        '<p class="text-secondary mt-2">A + A + A + A + ? = Accepted</p> ' +
        '<p class="text-secondary">A + A + A + B + B = Accepted</p>' +
        '<p class="text-secondary">A + A + B + B + B = Accepted</p>' +
        ' <p class="text-secondary">A + A + A + C + C = Rejected</p>' +
        '<p class="text-secondary">A + A + B + B + C = Rejected</p>' +
        '<p class="text-secondary">B + B + B + B + ? = Rejected</p>' +
        '<p class="text-secondary">B + B + B + C + C = Rejected</p>' +
        '<p class="text-secondary">C + C + C + C + ? = Rejected</p>' +
        '<p class="text-secondary">A + A + B + B + B = Conditionally Accepted</p>' +
        '<p class="text-secondary">A + A + A + B + C = Conditionally Accepted</p>',
      showCloseButton: true,
    })
  }

  navigateBack() {
    let variable = localStorage.getItem('backUrl');
    this.router.navigateByUrl(`${variable}`);
    localStorage.removeItem('backUrl');
  }

  navigateBackWithParams() {
    const backUrl = localStorage.getItem('backUrl');
    const queryParamsRaw = localStorage.getItem('backUrlQueryParams');
    const queryParams = queryParamsRaw ? JSON.parse(queryParamsRaw) : {};

    if (backUrl) {
      this.router.navigate([backUrl], { queryParams });
    } else {
      this.ngOnInit();
    }
  }


  validation() {
    this.supplierevaluationForm = new FormGroup({
      purchase_id: new FormControl('', [Validators.required]),
      evaluation_basis: new FormControl('', [Validators.required]),
      vendor_status: new FormControl({ value: '', disabled: true }, [Validators.required]),
      qualitybasis_grading: new FormControl('', [Validators.required]),
      pricebasis_grading: new FormControl('', [Validators.required]),
      communicationbasis_grading: new FormControl('', [Validators.required]),
      deliverybasis_grading: new FormControl('', [Validators.required]),
      commitmentbasis_grading: new FormControl('', [Validators.required])
    })
  }
}
