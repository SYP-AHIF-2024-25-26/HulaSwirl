import {HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpHeaders} from '@angular/common/http';
import {inject} from '@angular/core';
import {finalize} from 'rxjs';
import {LoadingService} from './loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const service = inject(LoadingService);
  const skipLoading = req.headers.get('X-Skip-Loader');
  if (skipLoading) {
    const headers = req.headers.delete('X-Skip-Loader');
    const newReq = req.clone({headers});
    return next(newReq);
  }
  service.start();
  return next(req).pipe(finalize(() => service.stop()));
};
