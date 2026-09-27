import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [TranslocoModule],
  template: `
    <div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div class="mb-4 rounded-full bg-brand-50 dark:bg-brand-900/40 p-4">
        <span class="material-icons !text-4xl text-brand-600">construction</span>
      </div>
      <h3 class="text-xl font-semibold">{{ titleKey | transloco }}</h3>
      <p class="mt-1 max-w-sm opacity-70">
        {{ 'placeholder.roadmap' | transloco }}
      </p>
    </div>
  `,
})
export class PlaceholderComponent {
  titleKey = 'placeholder.comingSoon';
}
