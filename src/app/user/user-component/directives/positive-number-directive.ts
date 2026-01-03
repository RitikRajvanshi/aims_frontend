import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[b-positive]'
})

export class PositiveNumberDirective {

    constructor(private el: ElementRef) { }

    @HostListener('paste', ['$event'])
    handlePaste(event: ClipboardEvent) {
      const clipboardData = event.clipboardData || (window as any).clipboardData;
      const pastedInput = clipboardData.getData('text');
      
      if (!this.isValidPositiveNumber(pastedInput)) {
        event.preventDefault();
      }
    }
  
    @HostListener('input', ['$event'])
    onInput(event: InputEvent) {
      const input = this.el.nativeElement as HTMLInputElement;
      if (!this.isValidPositiveNumber(input.value)) {
        input.value = input.value.slice(0, -1);
      }
    }
  
    private isValidPositiveNumber(value: string): boolean {
      // This regex matches positive numbers with optional decimal places
      const pattern = /^(?!0$)(\d+(\.\d+)?|\.\d+)$/;
      return pattern.test(value);
    }
  }