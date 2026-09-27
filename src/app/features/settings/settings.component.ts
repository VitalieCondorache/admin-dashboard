import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    TranslocoModule,
  ],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);

  readonly profileForm = this.fb.nonNullable.group({
    name: [this.auth.user()?.name ?? '', Validators.required],
    email: [this.auth.user()?.email ?? '', [Validators.required, Validators.email]],
    phone: [''],
    bio: [''],
    timezone: ['Europe/Bucharest'],
    language: ['en'],
  });

  readonly passwordForm = this.fb.nonNullable.group({
    current: ['', Validators.required],
    next: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', Validators.required],
  });

  readonly notifyForm = this.fb.nonNullable.group({
    emailMarketing: [true],
    emailProduct: [true],
    emailSecurity: [true],
    pushDesktop: [false],
    pushOrders: [true],
    weeklyDigest: [true],
  });

  readonly timezones = ['Europe/Bucharest', 'Europe/London', 'Europe/Berlin', 'America/New_York', 'Asia/Tokyo'];
  readonly languages = [
    { code: 'en', label: 'English' },
    { code: 'ro', label: 'Română' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
  ];

  save(name: string): void {
    this.snack.open(
      this.transloco.translate('settings.savedMessage', { name }),
      this.transloco.translate('common.cancel'),
      { duration: 2500 },
    );
  }
}
