import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpContextToken } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from './loading.service';

export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

export const loadingInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const service = inject(LoadingService);
  if (req.context.get(SKIP_LOADING)) {
    return next(req);
  }
  service.start();
  return next(req).pipe(finalize(() => service.stop()));
};
