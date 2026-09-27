import { of } from 'rxjs';
import { provideTransloco } from '@jsverse/transloco';

/**
 * Empty loader keeps unit tests decoupled from the real translation files —
 * components rendering keys instead of their values is acceptable in DOM
 * assertions and faster than loading and parsing JSON for every spec.
 */
export class TranslocoStubLoader {
  getTranslation() {
    return of({});
  }
}

export function provideTranslocoTesting() {
  return provideTransloco({
    config: {
      availableLangs: ['en'],
      defaultLang: 'en',
      fallbackLang: 'en',
      missingHandler: { logMissingKey: false, useFallbackTranslation: false },
    },
    loader: TranslocoStubLoader,
  });
}
