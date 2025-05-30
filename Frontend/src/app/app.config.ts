import {ApplicationConfig, InjectionToken, provideZoneChangeDetection} from '@angular/core';
import {provideRouter, withComponentInputBinding} from '@angular/router';

import { routes } from './app.routes';
import {provideHttpClient, withFetch} from '@angular/common/http';


export const BASE_URL = new InjectionToken<string>('BaseUrl');
export const WS_URL = new InjectionToken<string>('WsUrl');
//const IP = "192.168.0.245:8080";
const IP = "localhost:7083";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
    { provide: BASE_URL, useValue: `https://${IP}/api/v1` },
    { provide: WS_URL, useValue: `wss://${IP}/ws/orders` },
  ]
};
