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
      const status = e.status;
      let backendMessage = e.error?.message || e.error || "No errormessage from server.";
      if(status==401){
        backendMessage = "Unauthorized";
      }
      this.showError(
        `Error while ${todo} (Status ${status}): ${backendMessage}`,
        e
      );
    } else if (e instanceof Error) {
      this.showError("Unknown Error: " + e.message, e);
    } else {
      this.showError("Something went wrong.", e);
    }
  }
  showStatus(message: string){
    this.modalService.closeModal();
    this.modalService.openModal(ModalType.E, { message: message });
  }
}
