import {ApplicationConfig, InjectionToken, provideZoneChangeDetection} from '@angular/core';
import {provideRouter, withComponentInputBinding} from '@angular/router';

import { routes } from './app.routes';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {loadingInterceptor} from './services/loading.interceptor';

export const BASE_URL = new InjectionToken<string>('BaseUrl');
export const WS_URL = new InjectionToken<string>('WsUrl');
//const IP = "192.168.0.200:8080";
const IP = "localhost:5110";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([loadingInterceptor])),
    { provide: BASE_URL, useValue: `http://${IP}/api/v1` },
    { provide: WS_URL, useValue: `ws://${IP}/ws/orders` },
  ]
};
