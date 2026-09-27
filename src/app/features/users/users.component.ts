import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { UsersStore } from './users.store';
import { UserFormDialogComponent } from './user-form.dialog';
import { ConfirmDialogComponent } from '../../shared/ui/confirm.dialog';
import { User } from '../../core/models';

@Component({
  selector: 'app-users-page',
  standalone: true,
  providers: [UsersStore],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressBarModule,
    MatDividerModule,
    TranslocoModule,
  ],
  templateUrl: './users.component.html',
})
export class UsersComponent {
  readonly store = inject(UsersStore);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);

  readonly displayed = ['avatar', 'name', 'email', 'role', 'status', 'createdAt', 'actions'];
  readonly search = new FormControl('', { nonNullable: true });

  private readonly searchSignal = toSignal(
    this.search.valueChanges.pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' },
  );

  constructor() {
    // Single source of loading: reacts to search changes AND loads on mount
    // (initialValue '' triggers the first run). No ngOnInit needed.
    effect(() => {
      const term = this.searchSignal();
      this.store.setQuery({ search: term, page: 0 });
      this.store.load(this.store.query());
    });
  }

  onPage(e: PageEvent): void {
    this.store.setQuery({ page: e.pageIndex, pageSize: e.pageSize });
    this.store.load(this.store.query());
  }

  onSort(s: Sort): void {
    this.store.setQuery({
      sortBy: s.active,
      sortDir: (s.direction || 'asc') as 'asc' | 'desc',
    });
    this.store.load(this.store.query());
  }

  openCreate(): void {
    this.dialog
      .open(UserFormDialogComponent, { data: { mode: 'create' } })
      .afterClosed()
      .pipe(filter((r) => !!r))
      .subscribe((payload) => {
        this.store.create(payload);
        this.snack.open(this.transloco.translate('users.created'), this.transloco.translate('common.close'), { duration: 2500 });
      });
  }

  openEdit(user: User): void {
    this.dialog
      .open(UserFormDialogComponent, { data: { mode: 'edit', user } })
      .afterClosed()
      .pipe(filter((r) => !!r))
      .subscribe((payload) => {
        this.store.update(user.id, payload);
        this.snack.open(this.transloco.translate('users.updated'), this.transloco.translate('common.close'), { duration: 2500 });
      });
  }

  confirmDelete(user: User): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: this.transloco.translate('users.deleteConfirm.title'),
          message: this.transloco.translate('users.deleteConfirm.message', { name: user.name }),
          confirmText: this.transloco.translate('common.delete'),
          variant: 'danger',
        },
      })
      .afterClosed()
      .pipe(filter((r) => r === true))
      .subscribe(() => {
        this.store.remove(user.id);
        this.snack.open(this.transloco.translate('users.deleted'), this.transloco.translate('common.close'), { duration: 2500 });
      });
  }

  badgeClass(status: string): string {
    return {
      active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      inactive: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    }[status] ?? '';
  }
}
