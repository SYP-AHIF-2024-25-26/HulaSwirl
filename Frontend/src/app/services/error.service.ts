import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from './api-error';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
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

  showProgress(_duration: number) { }
  showStatus(_message: string) { }
}
