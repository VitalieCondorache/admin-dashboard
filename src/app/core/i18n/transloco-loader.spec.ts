import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { TranslocoHttpLoader } from './transloco-loader';

describe('TranslocoHttpLoader', () => {
  let loader: TranslocoHttpLoader;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    loader = TestBed.inject(TranslocoHttpLoader);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests assets/i18n/<lang>.json relative to <base href>', async () => {
    const p = firstValueFrom(loader.getTranslation('ro'));
    const req = http.expectOne('assets/i18n/ro.json');
    expect(req.request.method).toBe('GET');
    req.flush({ hello: 'salut' });
    await expect(p).resolves.toEqual({ hello: 'salut' });
  });
});
