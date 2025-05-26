import { Injectable, inject } from '@angular/core';
import { ModalService, ModalType } from './modal.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  constructor(private modalService: ModalService) {}

  showError(message: string, e: any) {
    this.modalService.closeModal();
    this.modalService.openModal(ModalType.E, { message: message });
    console.error(message, e);
  }

  handleError(e: any, todo: string) {
    if (e instanceof HttpErrorResponse) {
      console.log(e)
      this.showError("Something went wrong.", e);
    }
  }
  showStatus(message: string){
    this.modalService.closeModal();
    this.modalService.openModal(ModalType.E, { message: message });
  }
}
