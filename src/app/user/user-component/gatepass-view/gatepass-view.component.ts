import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-gatepass-view',
  templateUrl: './gatepass-view.component.html',
  styleUrls: ['./gatepass-view.component.scss']
})
export class GatepassViewComponent {
  @ViewChild('logo', { static: true }) logo!: ElementRef<HTMLImageElement>;

  constructor(private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.showSpinner();
    // Start loading the image here if necessary
    const img = this.logo.nativeElement;
    if (img.complete) {
      // If the image is already cached and loaded
      this.onImageLoad();
    }
  }

  showSpinner() {
    this.spinner.show();
  }

  hideSpinner() {
    this.spinner.hide();
  }

  onImageLoad() {
    this.hideSpinner();
  }

  onImageError() {
    this.hideSpinner();
    console.error('Error loading the logo.');
    // You can handle the error here (e.g., show a fallback image or message)
  }
}
