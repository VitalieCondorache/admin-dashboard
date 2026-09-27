import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { User, UserRole } from '../../core/models';

export interface UserFormData {
  mode: 'create' | 'edit';
  user?: User;
}

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    TranslocoModule,
  ],
  template: `
    <h2 mat-dialog-title class="!flex !items-center !gap-2">
      <mat-icon class="text-brand-600">{{ data.mode === 'create' ? 'person_add' : 'edit' }}</mat-icon>
      {{ (data.mode === 'create' ? 'users.dialog.createTitle' : 'users.dialog.editTitle') | transloco }}
    </h2>

    <mat-dialog-content class="!pt-2">
      <form [formGroup]="form" class="flex flex-col gap-3 min-w-[min(90vw,420px)]">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'users.dialog.fullName' | transloco }}</mat-label>
          <input matInput formControlName="name" autocomplete="name" />
          @if (form.controls.name.hasError('required')) {
            <mat-error>{{ 'users.dialog.nameRequired' | transloco }}</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'users.dialog.email' | transloco }}</mat-label>
          <input matInput type="email" formControlName="email" autocomplete="email" />
          @if (form.controls.email.hasError('email')) {
            <mat-error>{{ 'users.dialog.emailInvalid' | transloco }}</mat-error>
          }
          @if (form.controls.email.hasError('required')) {
            <mat-error>{{ 'users.dialog.emailRequired' | transloco }}</mat-error>
          }
        </mat-form-field>

        <div class="grid grid-cols-2 gap-3">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'users.dialog.role' | transloco }}</mat-label>
            <mat-select formControlName="role">
              <mat-option value="admin">{{ 'users.roles.admin' | transloco }}</mat-option>
              <mat-option value="manager">{{ 'users.roles.manager' | transloco }}</mat-option>
              <mat-option value="user">{{ 'users.roles.user' | transloco }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'users.dialog.status' | transloco }}</mat-label>
            <mat-select formControlName="status">
              <mat-option value="active">{{ 'users.statuses.active' | transloco }}</mat-option>
              <mat-option value="inactive">{{ 'users.statuses.inactive' | transloco }}</mat-option>
              <mat-option value="pending">{{ 'users.statuses.pending' | transloco }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="!px-6 !pb-4">
      <button mat-stroked-button mat-dialog-close>{{ 'common.cancel' | transloco }}</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="form.invalid"
        (click)="submit()"
      >
        {{ (data.mode === 'create' ? 'users.dialog.createBtn' : 'users.dialog.saveBtn') | transloco }}
      </button>
    </mat-dialog-actions>
  `,
})
export class UserFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<UserFormDialogComponent>);
  readonly data = inject<UserFormData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['user' as UserRole, Validators.required],
    status: ['active' as User['status'], Validators.required],
  });

  constructor() {
    if (this.data.mode === 'edit' && this.data.user) {
      this.form.patchValue({
        name: this.data.user.name,
        email: this.data.user.email,
        role: this.data.user.role,
        status: this.data.user.status,
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.ref.close(this.form.getRawValue());
  }
}
