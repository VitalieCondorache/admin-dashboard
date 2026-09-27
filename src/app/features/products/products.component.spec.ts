import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ProductsComponent } from './products.component';
import { provideTranslocoTesting } from '../../../testing/transloco-testing';

describe('ProductsComponent', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProductsComponent],
      providers: [
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslocoTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('creates and fetches first page', () => {
    const fixture = TestBed.createComponent(ProductsComponent);
    fixture.detectChanges();
    const reqs = http.match((r) => r.url === '/api/products');
    expect(reqs.length).toBeGreaterThan(0);
    expect(reqs[0].request.params.get('page')).toBe('0');
    expect(reqs[0].request.params.get('pageSize')).toBe('12');
    reqs.forEach((r) => r.flush({ items: [], total: 0, page: 0, pageSize: 12 }));
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('statusClass maps known statuses', () => {
    const fixture = TestBed.createComponent(ProductsComponent);
    fixture.detectChanges();
    http
      .match((r) => r.url === '/api/products')
      .forEach((r) => r.flush({ items: [], total: 0, page: 0, pageSize: 12 }));
    const cmp = fixture.componentInstance;
    expect(cmp.statusClass('published')).toContain('emerald');
    expect(cmp.statusClass('draft')).toContain('amber');
    expect(cmp.statusClass('archived')).toContain('zinc');
    expect(cmp.statusClass('other')).toBe('');
  });

  it('stockColor reflects stock level', () => {
    const fixture = TestBed.createComponent(ProductsComponent);
    fixture.detectChanges();
    http
      .match((r) => r.url === '/api/products')
      .forEach((r) => r.flush({ items: [], total: 0, page: 0, pageSize: 12 }));
    const cmp = fixture.componentInstance;
    expect(cmp.stockColor(0)).toContain('rose');
    expect(cmp.stockColor(5)).toContain('amber');
    expect(cmp.stockColor(100)).toContain('emerald');
  });

  it('remove() hits DELETE and triggers a refetch', () => {
    const fixture = TestBed.createComponent(ProductsComponent);
    fixture.detectChanges();
    http
      .match((r) => r.url === '/api/products')
      .forEach((r) => r.flush({ items: [], total: 0, page: 0, pageSize: 12 }));

    fixture.componentInstance.remove({ id: 'p1' } as never);
    const del = http.expectOne('/api/products/p1');
    expect(del.request.method).toBe('DELETE');
    del.flush({});
    http
      .match((r) => r.url === '/api/products')
      .forEach((r) => r.flush({ items: [], total: 0, page: 0, pageSize: 12 }));
  });

  it('renders product cards when data is loaded', () => {
    const fixture = TestBed.createComponent(ProductsComponent);
    fixture.detectChanges();
    http
      .match((r) => r.url === '/api/products')
      .forEach((r) => r.flush({
        items: [
          {
            id: 'p1',
            name: 'Headphones',
            sku: 'SKU-1',
            category: 'Electronics',
            price: 99,
            stock: 10,
            rating: 4.5,
            status: 'published',
            imageUrl: 'x',
            createdAt: '2024-01-01',
          },
          {
            id: 'p2',
            name: 'Draft Item',
            sku: 'SKU-2',
            category: 'Books',
            price: 20,
            stock: 0,
            rating: 3.5,
            status: 'draft',
            imageUrl: 'x',
            createdAt: '2024-01-02',
          },
        ],
        total: 2,
        page: 0,
        pageSize: 12,
      }));
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Headphones');
    expect(text).toContain('Draft Item');
  });
});
