import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';

export interface ConfirmData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatIconModule,
    TranslocoModule,
  ],
  template: `
    <h2 mat-dialog-title class="!flex !items-center !gap-2">
      <mat-icon [class.text-rose-600]="data.variant === 'danger'" [class.text-brand-600]="data.variant !== 'danger'">
        {{ data.variant === 'danger' ? 'warning' : 'help' }}
      </mat-icon>
      {{ data.title }}
    </h2>
    <mat-dialog-content>
      <p class="text-sm opacity-80 max-w-sm">{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="!px-6 !pb-4">
      <button mat-stroked-button [mat-dialog-close]="false">
        {{ data.cancelText ?? ('confirm.cancel' | transloco) }}
      </button>
      <button
        mat-flat-button
        [color]="data.variant === 'danger' ? 'warn' : 'primary'"
        [mat-dialog-close]="true"
      >
        {{ data.confirmText ?? ('confirm.confirm' | transloco) }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmData>(MAT_DIALOG_DATA);
}
