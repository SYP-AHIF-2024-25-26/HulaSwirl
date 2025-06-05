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
      if(errorMessages) {
        if (errorMessages instanceof Array) {
          if (errorMessages.length > 1) {
            this.showStatus(`Multiple errors occurred:\n❗${errorMessages.join("\n❗")}`);
          } else {
            this.showStatus(errorMessages[0]);
          }
        } else {
          this.showStatus(errorMessages);
        }
      } else {
        this.showStatus(`An error occurred: ${e.status} ${e.statusText}`);
      }
    } else if (e instanceof Error) {
      this.showStatus(`An error occurred: ${e.message}`);
    }
  }

  showProgress(progressDuration: number) {
    this.modalService.closeModal();
    this.modalService.openModal(ModalType.E, { progressDuration: progressDuration });
  }

  showStatus(message: string) {
    this.modalService.closeModal();
    this.modalService.openModal(ModalType.E, { message: message });
  }
}
