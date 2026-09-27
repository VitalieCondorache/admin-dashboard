import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideTransloco } from '@jsverse/transloco';

import { routes } from './app.routes';
import { authInterceptor } from './core/http/auth.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';
import { mockApiInterceptor } from './core/mock/mock-api.interceptor';
import { TranslocoHttpLoader } from './core/i18n/transloco-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(
      // Order matters: authInterceptor adds the token first, errorInterceptor
      // wraps the pipeline so it catches mock errors too, and mockApiInterceptor
      // is LAST so real error handling/auth run over its synthetic responses.
      withInterceptors([authInterceptor, errorInterceptor, mockApiInterceptor]),
    ),
    provideAnimationsAsync(),
    provideCharts(withDefaultRegisterables()),
    provideTransloco({
      config: {
        availableLangs: ['en', 'ro'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
  ],
};
