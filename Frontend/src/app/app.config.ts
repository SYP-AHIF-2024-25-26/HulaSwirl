import {ApplicationConfig, InjectionToken, provideZoneChangeDetection} from '@angular/core';
import {provideRouter, withComponentInputBinding} from '@angular/router';

import { routes } from './app.routes';
import {provideHttpClient, withFetch} from '@angular/common/http';


export const BASE_URL = new InjectionToken<string>('BaseUrl');
export const WS_URL = new InjectionToken<string>('WsUrl');
const IP = "localhost:5110";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
    { provide: BASE_URL, useValue: `http://${IP}/api/v1` },
    { provide: WS_URL, useValue: `ws://${IP}/ws/orders` },
  ]
};
