import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from './loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const service = inject(LoadingService);
  if (req.headers.has('X-Skip-Loading')) {
    const modReq = req.clone({ headers: req.headers.delete('X-Skip-Loading') });
    return next(modReq);
  }
  service.start();
  return next(req).pipe(finalize(() => service.stop()));
};
