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
    setGlobalError: (message: string) => void
  ): void {
    if (e instanceof HttpErrorResponse) {
      if( e.status === 401) {
        this.showMessage('You need to log in to perform this action.');
        return;
      }
      const payload = e.error;
      if (e.status === 403) {
        this.showMessage(payload[0].message);
        return;
      }
      const errors = Array.isArray(payload) ? payload : [payload];
      for (const err of errors) {
        if (err && typeof err === 'object' && 'message' in err) {
          const em = err as ApiError;
          if (em.target) {
            setFieldError(em.target, em.message);
          } else {
            setGlobalError(em.message);
          }
        } else {
          setGlobalError(err);
        }
      }
    } else if (e instanceof Error) {
      setGlobalError(e.message);
    } else {
      setGlobalError('Unknown error');
    }
  }

  showProgress(duration: number) {
    this.modalService.openModal(ModalType.Status, { progressDuration: duration });
  }

  showMessage(message: string) {
    this.modalService.openModal(ModalType.Status, { message });
  }
}
