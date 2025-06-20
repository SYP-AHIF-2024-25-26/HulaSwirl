import { inject, signal, WritableSignal } from '@angular/core';
import { ErrorService } from './error.service';

export interface ErrorHandling {
  globalError: WritableSignal<string>;
  setGlobalError(message: string): void;
  clearGlobalError(): void;
  setFieldError(target: string, message: string): void;
  clearFieldError(field?: string): void;
  handleError(e: unknown): void;
}

export abstract class ErrorHandlingComponent implements ErrorHandling {
  globalError: WritableSignal<string> = signal("");
  protected readonly errorService = inject(ErrorService);

  setGlobalError(message: string): void {
    this.globalError.set(message);
  }

  clearGlobalError(): void {
    this.globalError.set("");
  }

  abstract setFieldError(target: string, message: string): void;
  abstract clearFieldError(field?: string): void;

  handleError(e: unknown): void {
    this.errorService.handleError(
      e,
      (t, m) => this.setFieldError(t, m),
      m => this.setGlobalError(m)
    );
  }
}
