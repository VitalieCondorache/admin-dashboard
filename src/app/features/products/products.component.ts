import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TranslocoModule } from '@jsverse/transloco';
import { PagedResult } from '../../core/models';
import { Product } from '../../core/mock/seed';

@Component({
  selector: 'app-products',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    TranslocoModule,
  ],
  templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  // Monotonically increasing token: discards stale responses from aborted
  // fetches (user changed filter mid-request) to prevent UI flicker.
  private fetchToken = 0;

  readonly search = new FormControl('', { nonNullable: true });
  readonly category = new FormControl('', { nonNullable: true });
  readonly status = new FormControl('', { nonNullable: true });

  readonly categories = ['Electronics', 'Apparel', 'Home', 'Books', 'Sports', 'Beauty'];
  readonly statuses = ['published', 'draft', 'archived'];

  readonly page = signal(0);
  readonly pageSize = signal(12);
  readonly loading = signal(false);
  readonly result = signal<PagedResult<Product> | null>(null);

  readonly items = computed(() => this.result()?.items ?? []);
  readonly total = computed(() => this.result()?.total ?? 0);

  private readonly searchSig = toSignal(
    this.search.valueChanges.pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' },
  );
  private readonly categorySig = toSignal(this.category.valueChanges, { initialValue: '' });
  private readonly statusSig = toSignal(this.status.valueChanges, { initialValue: '' });

  constructor() {
    effect(() => {
      this.searchSig();
      this.categorySig();
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
    const token = ++this.fetchToken;
    let params = new HttpParams()
      .set('page', this.page())
      .set('pageSize', this.pageSize());
    if (this.search.value) params = params.set('search', this.search.value);
    if (this.category.value) params = params.set('category', this.category.value);
    if (this.status.value) params = params.set('status', this.status.value);

    this.http
      .get<PagedResult<Product>>('/api/products', { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          // Ignore responses from superseded requests.
          if (token !== this.fetchToken) return;
          this.result.set(res);
          this.loading.set(false);
        },
        error: () => {
          if (token !== this.fetchToken) return;
          this.loading.set(false);
        },
      });
  }

  remove(p: Product): void {
    this.http
      .delete(`/api/products/${p.id}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.fetch(),
      });
  }

  statusClass(s: string): string {
    return {
      published: 'bg-emerald-100 text-emerald-700',
      draft: 'bg-amber-100 text-amber-700',
      archived: 'bg-zinc-100 text-zinc-700',
    }[s] ?? '';
  }

  stockColor(stock: number): string {
    if (stock === 0) return 'text-rose-600';
    if (stock < 20) return 'text-amber-600';
    return 'text-emerald-600';
  }
}
