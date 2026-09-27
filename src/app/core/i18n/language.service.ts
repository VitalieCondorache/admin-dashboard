import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';

const KEY = 'admin.lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);

  readonly available = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ro', label: 'Română', flag: '🇷🇴' },
  ];

  private readonly _current = signal(this.transloco.getActiveLang());
  readonly current = this._current.asReadonly();

  constructor() {
    const stored = localStorage.getItem(KEY);
    if (stored && this.available.some((l) => l.code === stored)) {
      this.transloco.setActiveLang(stored);
    }

    this.transloco.langChanges$.pipe(takeUntilDestroyed()).subscribe((lang) => {
      this._current.set(lang);
      // Mirror the active language onto <html lang> so assistive tech,
      // hyphenation and the browser spellchecker follow the UI language.
      document.documentElement.lang = lang;
    });
  }

  set(lang: string): void {
    this.transloco.setActiveLang(lang);
    localStorage.setItem(KEY, lang);
  }
}
