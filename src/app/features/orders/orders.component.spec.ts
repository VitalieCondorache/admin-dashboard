import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { OrdersComponent } from './orders.component';
import { provideTranslocoTesting } from '../../../testing/transloco-testing';

describe('OrdersComponent', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OrdersComponent],
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

  it('creates and loads first page', () => {
    const fixture = TestBed.createComponent(OrdersComponent);
    fixture.detectChanges();
    const reqs = http.match((r) => r.url === '/api/orders');
    expect(reqs.length).toBeGreaterThan(0);
    expect(reqs[0].request.params.get('page')).toBe('0');
    reqs.forEach((r) => r.flush({ items: [], total: 0, page: 0, pageSize: 10 }));
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('computes summary from items', () => {
    const fixture = TestBed.createComponent(OrdersComponent);
    fixture.detectChanges();
    const reqs = http.match((r) => r.url === '/api/orders');
    reqs.forEach((req) => req.flush({
      items: [
        { id: '1', customer: 'A', items: 2, payment: 'card', total: 100, status: 'pending', date: '2024-01-01' },
        { id: '2', customer: 'B', items: 3, payment: 'card', total: 200, status: 'shipped', date: '2024-01-02' },
        { id: '3', customer: 'C', items: 1, payment: 'bank', total: 50, status: 'delivered', date: '2024-01-03' },
      ],
      total: 3,
      page: 0,
      pageSize: 10,
    }));
    fixture.detectChanges();
    const s = fixture.componentInstance.summary();
    expect(s.revenue).toBe(350);
    expect(s.pending).toBe(1);
    expect(s.shipped).toBe(1);
    expect(s.delivered).toBe(1);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('pending');
  });

  it('statusBadge and paymentIcon return mapped values', () => {
    const fixture = TestBed.createComponent(OrdersComponent);
    fixture.detectChanges();
    http
      .match((r) => r.url === '/api/orders')
      .forEach((r) => r.flush({ items: [], total: 0, page: 0, pageSize: 10 }));
    expect(fixture.componentInstance.statusBadge('pending')).toContain('amber');
    expect(fixture.componentInstance.statusBadge('unknown')).toBe('');
    expect(fixture.componentInstance.paymentIcon('card')).toBe('credit_card');
    expect(fixture.componentInstance.paymentIcon('unknown')).toBe('payments');
  });
});
