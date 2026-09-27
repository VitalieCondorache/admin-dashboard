import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);

  getTranslation(lang: string) {
    // Relative on purpose: the browser resolves it against <base href>, so the
    // same build works both at "/" (dev) and under a sub-path deploy such as
    // "/admin-dashboard/". An absolute "/assets/..." path would 404 there.
    return this.http.get<Translation>(`assets/i18n/${lang}.json`);
  }
}
