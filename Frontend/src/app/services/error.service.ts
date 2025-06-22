import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from './api-error';
import { ModalType } from './modal.service';
import { UniversalModalService } from '../shared/modal/universal-modal.service';
import { StatusModalComponent } from '../modals/status-modal/status-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private readonly modal = inject(UniversalModalService);
  handleError(
    e: any,
    setFieldError: (target: string, message: string) => void,
    setGlobalError: (message: string) => void
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
            setGlobalError(em.message);
          }
        } else if (typeof err === 'string') {
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
    this.modal.open({ body: StatusModalComponent, data: { progressDuration: duration } });
  }

  showMessage(message: string) {
    this.modal.open({ body: StatusModalComponent, data: { message } });
  }
}
