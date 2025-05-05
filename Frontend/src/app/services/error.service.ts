import { Injectable, inject } from '@angular/core';
import { ModalService, ModalType } from './modal.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  constructor(private modalService: ModalService) {}

  showError(message: string, e: any) {
    this.modalService.openModal(ModalType.E, { message: message });
    console.error(message, e);
  }

  handleError(e: any, todo: string) {
    if (e instanceof HttpErrorResponse) {
      const status = e.status;
      const backendMessage = e.error?.message || "No errormessage from server.";

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

  startProgress(seconds: number) {
    this.modalService.openModal(ModalType.E, {
      message: 'Getränk wird zubereitet...',
      progressDuration: seconds
    });
  }
}
