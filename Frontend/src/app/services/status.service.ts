import { Injectable, inject } from '@angular/core';
import { ModalService, ModalType } from './modal.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  constructor(private modalService: ModalService) {}

  handleError(e: any) {
    if (e instanceof HttpErrorResponse) {
      const errorMessages: string | string[] = e.error
      if( Array.isArray(errorMessages)) {
        this.showStatus(`-${errorMessages.join('\n-')}`);
      } else {
        this.showStatus(`${errorMessages}`);
      }
    }
  }
  showStatus(message: string){
    console.log(message);
    this.modalService.closeModal();
    this.modalService.openModal(ModalType.E, { message: message });
  }
}
