import { inject, signal, WritableSignal } from '@angular/core';
import { ErrorService } from './error.service';

export interface ErrorHandling {
  globalErrors: WritableSignal<string[]>;
  addGlobalError(message: string): void;
  clearGlobalError(): void;
  setFieldError(target: string, message: string): void;
  clearFieldError(field?: string): void;
  handleError(e: unknown): void;
}

export abstract class ErrorHandlingComponent implements ErrorHandling {
  globalErrors: WritableSignal<string[]> = signal([]);
  protected readonly errorService = inject(ErrorService);

  addGlobalError(message: string): void {
    this.globalErrors.set([...this.globalErrors(), message]);
  }

  clearGlobalError(): void {
    this.globalErrors.set([]);
  }

  abstract setFieldError(target: string, message: string): void;
  abstract clearFieldError(field?: string): void;

  handleError(e: unknown): void {
    this.errorService.handleError(
      e,
      (t, m) => this.setFieldError(t, m),
      m => this.addGlobalError(m)
    );
  }
}
