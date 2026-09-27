import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslocoModule } from '@jsverse/transloco';
import { PagedResult } from '../../core/models';
import { Order } from '../../core/mock/seed';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressBarModule,
    TranslocoModule,
  ],
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly search = new FormControl('', { nonNullable: true });
  readonly status = new FormControl('', { nonNullable: true });
  readonly statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  readonly displayed = ['id', 'customer', 'items', 'payment', 'total', 'status', 'date'];
  readonly page = signal(0);
  readonly pageSize = signal(10);
  readonly loading = signal(false);
  readonly result = signal<PagedResult<Order> | null>(null);

  readonly items = computed(() => this.result()?.items ?? []);
  readonly total = computed(() => this.result()?.total ?? 0);

  readonly summary = computed(() => {
    const all = this.items();
    return {
      revenue: all.reduce((s, o) => s + o.total, 0),
      pending: all.filter((o) => o.status === 'pending').length,
      shipped: all.filter((o) => o.status === 'shipped').length,
      delivered: all.filter((o) => o.status === 'delivered').length,
    };
  });

  private readonly searchSig = toSignal(
    this.search.valueChanges.pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' },
  );
  private readonly statusSig = toSignal(this.status.valueChanges, { initialValue: '' });

  constructor() {
    effect(() => {
      this.searchSig();
      this.statusSig();
      this.page.set(0);
      this.fetch();
    });
  }

  ngOnInit(): void {
    this.fetch();
  }

  onPage(e: PageEvent): void {
    this.page.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.fetch();
  }

  private fetch(): void {
    this.loading.set(true);
    let params = new HttpParams()
      .set('page', this.page())
      .set('pageSize', this.pageSize());
    if (this.search.value) params = params.set('search', this.search.value);
    if (this.status.value) params = params.set('status', this.status.value);

    this.http
      .get<PagedResult<Order>>('/api/orders', { params })
      .subscribe({
        next: (res) => {
          this.result.set(res);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  statusBadge(s: string): string {
    return {
      pending: 'bg-amber-100 text-amber-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-indigo-100 text-indigo-700',
      delivered: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-rose-100 text-rose-700',
    }[s] ?? '';
  }

  paymentIcon(p: string): string {
    return { card: 'credit_card', paypal: 'account_balance_wallet', bank: 'account_balance' }[p] ?? 'payments';
  }
}
