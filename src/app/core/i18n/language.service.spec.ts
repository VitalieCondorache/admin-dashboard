import { TestBed } from '@angular/core/testing';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { of } from 'rxjs';
import { LanguageService } from './language.service';

class StubLoader {
  getTranslation() {
    return of({});
  }
}

describe('LanguageService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideTransloco({
          config: {
            availableLangs: ['en', 'ro'],
            defaultLang: 'en',
            fallbackLang: 'en',
            reRenderOnLangChange: true,
            missingHandler: { logMissingKey: false, useFallbackTranslation: false },
          },
          loader: StubLoader,
        }),
      ],
    });
  });

  it('exposes the available languages', () => {
    const svc = TestBed.inject(LanguageService);
    expect(svc.available.map((l) => l.code)).toEqual(['en', 'ro']);
  });

  it('current() reflects active language initially', () => {
    const svc = TestBed.inject(LanguageService);
    expect(svc.current()).toBe('en');
  });

  it('set() updates current language and persists it', () => {
    const svc = TestBed.inject(LanguageService);
    const transloco = TestBed.inject(TranslocoService);

    svc.set('ro');

    expect(transloco.getActiveLang()).toBe('ro');
    expect(svc.current()).toBe('ro');
    expect(localStorage.getItem('admin.lang')).toBe('ro');
  });

  it('restores stored language on construction', () => {
    localStorage.setItem('admin.lang', 'ro');
    // new injector with stored value
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideTransloco({
          config: {
            availableLangs: ['en', 'ro'],
            defaultLang: 'en',
            fallbackLang: 'en',
            reRenderOnLangChange: true,
            missingHandler: { logMissingKey: false, useFallbackTranslation: false },
          },
          loader: StubLoader,
        }),
      ],
    });
    const svc = TestBed.inject(LanguageService);
    expect(svc.current()).toBe('ro');
  });
});
