import {ApplicationConfig, LOCALE_ID, provideZoneChangeDetection} from '@angular/core';
import {provideRouter, withRouterConfig} from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {AuthInterceptor} from './interceptores/auth.interceptor';
import localeEs from '@angular/common/locales/es';
import {registerLocaleData} from '@angular/common';

registerLocaleData(localeEs, 'es');

// @ts-ignore
// @ts-ignore
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    { provide: LOCALE_ID, useValue: 'es' },
    provideRouter(routes,withRouterConfig({
        // Prevenir scroll automático al cambiar rutas
        onSameUrlNavigation: 'reload'
      })
    ),


    provideAnimationsAsync(),
    providePrimeNG({ theme: { preset: Aura } }),
    provideHttpClient(
      withInterceptors([AuthInterceptor]) // ✅ Aquí se inyecta correctamente
    )
  ]
};
