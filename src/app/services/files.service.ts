import { Injectable } from '@angular/core';
// import { environment } from '../environments/environment.dev';
import { HttpClient, HttpHeaders, HttpEventType  } from '@angular/common/http';
import { environment } from '../environments/environment.prod';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(private httpClient:HttpClient) { }

  uploadFileandgetData(formdata:FormData){
    let url = environment.FILES_URL + environment.FILES.UPLOADFILEANDGETDATA

    return this.httpClient.post(url, formdata, {
      reportProgress: true, // Enables progress tracking
      observe: 'events'     // Receive HttpEvents to track progress
    });
  }

  uploadDocumentandgetData(formdata:FormData){
    let url = environment.FILES_URL + environment.FILES.UPLOADDOCUMENTANDGETDATA

    return this.httpClient.post(url, formdata, {
      reportProgress: true, // Enables progress tracking
      observe: 'events'     // Receive HttpEvents to track progress
    });
  }

  uploadQuotationandgetData(formdata:FormData){
    let url = environment.FILES_URL + environment.FILES.UPLOADQUOTATIONANDGETDATA

    return this.httpClient.post(url, formdata, {
      reportProgress: true, // Enables progress tracking
      observe: 'events'     // Receive HttpEvents to track progress
    });
  }

  uploadlogoandgetData(formdata:FormData){
    let url = environment.FILES_URL + environment.FILES.UPLOADLOGOANDGETDATA

    return this.httpClient.post(url, formdata);
  }

    //for full data uploadation/updation
    uploadInvoiceinpo(formdata:any){
      let url = environment.FILES_URL + environment.FILES.UPLOADINVOICEINPO
  
      return this.httpClient.post(url, formdata);
    }

  //It's use when have to update partial data without file type i.e invoice no.
    updateInvoicenoinpo(data:any){
      let url = environment.FILES_URL + environment.FILES.UPDATEINVOICENOINPO
  
      return this.httpClient.post(url, data);
    }

    uploadscanDocument(formdata:any){
      let url = environment.FILES_URL + environment.FILES.UPLOADSCANDOCUMENT
  
      return this.httpClient.post(url, formdata);
    }

    
  updateDocotherthanFile(data:any){
    let url = environment.FILES_URL + environment.FILES.UPDATEDOCOTHERTHANFILE

    return this.httpClient.post(url, data);
  }

  updatefullDoc(data:any){
    let url = environment.FILES_URL + environment.FILES.UPDATEFULLDOCUMENT

    return this.httpClient.post(url, data);
  }

  //QUOTATION
  uploadQuotation(formdata:any){
    let url = environment.FILES_URL + environment.FILES.UPLOADQUOTATION

    return this.httpClient.post(url, formdata);
  }

  updateQuatationotherthanFile(data:any){
    let url = environment.FILES_URL + environment.FILES.UPDATEQUOTATIONOTHERTHANFILE

    return this.httpClient.post(url, data);
  }

  updatefullQuotation(data:any){
    let url = environment.FILES_URL + environment.FILES.UPDATEFULLQUOTATION

    return this.httpClient.post(url, data);
  }

  // exportToExcel(data:any){
  //   let url = environment.FILES_URL + environment.FILES.EXPORTTOEXCEL

  //   return this.httpClient.post(url, data);
  // }

  exportToExcel(data: any): Observable<Blob> {
    let url = environment.FILES_URL + environment.FILES.EXPORTTOEXCEL

    return this.httpClient.post(url, data, { responseType: 'blob' }).pipe(
      catchError((error) => {
        console.error('Export to Excel failed', error);
        throw error;
      })
    );
  }

  // Helper method to handle the Blob download logic
  downloadBlob(response: Blob, fileName: string): void {
    // Create a URL for the Blob response
    const blobUrl = window.URL.createObjectURL(response);

    // Create an anchor element to simulate a click and download the file
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName; // Set the desired file name
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up the Blob URL after download
    window.URL.revokeObjectURL(blobUrl);
  }
}
