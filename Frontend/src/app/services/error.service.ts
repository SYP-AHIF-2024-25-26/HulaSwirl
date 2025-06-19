import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from './api-error';
import { ModalService, ModalType } from './modal.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private readonly modalService = inject(ModalService);
  handleError(
    e: any,
    setFieldError: (target: string, message: string) => void,
    addGlobalError: (message: string) => void
  ): void {
    if (e instanceof HttpErrorResponse) {
      const payload = e.error;
      const errors = Array.isArray(payload) ? payload : [payload];
      for (const err of errors) {
        if (err && typeof err === 'object' && 'message' in err) {
          const em = err as ApiError;
          if (em.target) {
            setFieldError(em.target, em.message);
          } else {
            addGlobalError(em.message);
          }
        } else if (typeof err === 'string') {
          addGlobalError(err);
        }
      }
    } else if (e instanceof Error) {
      addGlobalError(e.message);
    } else {
      addGlobalError('Unknown error');
    }
  }

  showProgress(duration: number) {
    this.modalService.openModal(ModalType.Error, { progressDuration: duration });
  }

  showStatus(message: string) {
    this.modalService.openModal(ModalType.Error, { message });
  }
}
