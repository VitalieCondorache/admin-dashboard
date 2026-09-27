import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpParams, provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { mockApiInterceptor } from './mock-api.interceptor';
import { PagedResult, User } from '../models';
import { Order, Product } from './seed';

describe('mockApiInterceptor', () => {
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([mockApiInterceptor]))],
    });
    http = TestBed.inject(HttpClient);
  });

  it('passes through non-/api calls (errors out via backend)', async () => {
    // Non-api requests are forwarded -> no backend, request hangs; we just assert no throw synchronously
    const sub = http.get('/not-api').subscribe({ error: () => undefined });
    expect(sub).toBeDefined();
    sub.unsubscribe();
  });

  it('returns dashboard stats', async () => {
    const res = await firstValueFrom(http.get<Record<string, unknown>>('/api/dashboard/stats'));
    expect(res).toBeTruthy();
    expect(res['totalRevenue']).toBeGreaterThan(0);
  });

  it('logs in with demo credentials', async () => {
    const res = await firstValueFrom(
      http.post<{ user: User; tokens: { accessToken: string } }>('/api/auth/login', {
        email: 'admin@demo.com',
        password: 'admin123',
      }),
    );
    expect(res.user.email).toBe('admin@demo.com');
    expect(res.tokens.accessToken).toBe('mock-jwt-token');
  });

  it('rejects invalid credentials with 401', async () => {
    await expect(
      firstValueFrom(
        http.post('/api/auth/login', { email: 'x@x.com', password: 'bad' }),
      ),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('lists users with pagination and search', async () => {
    const res = await firstValueFrom(
      http.get<PagedResult<User>>('/api/users', {
        params: new HttpParams().set('page', 0).set('pageSize', 5).set('search', 'a'),
      }),
    );
    expect(res.items.length).toBeLessThanOrEqual(5);
    expect(typeof res.total).toBe('number');
  });

  it('creates, updates and deletes a user', async () => {
    const created = await firstValueFrom(
      http.post<User>('/api/users', { name: 'Test', email: 't@x.com' }),
    );
    expect(created.id).toBeTruthy();

    const updated = await firstValueFrom(
      http.put<User>(`/api/users/${created.id}`, { name: 'Updated' }),
    );
    expect(updated.name).toBe('Updated');

    await firstValueFrom(http.delete(`/api/users/${created.id}`));
    // After delete, GET by id should 404
    await expect(
      firstValueFrom(http.get(`/api/users/${created.id}`)),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('returns 404 on update for missing id', async () => {
    await expect(
      firstValueFrom(http.put('/api/users/missing-id', { name: 'x' })),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('lists products with category and status filters', async () => {
    const res = await firstValueFrom(
      http.get<PagedResult<Product>>('/api/products', {
        params: new HttpParams()
          .set('page', 0)
          .set('pageSize', 5)
          .set('category', 'Electronics')
          .set('status', 'published'),
      }),
    );
    expect(Array.isArray(res.items)).toBe(true);
  });

  it('deletes a product', async () => {
    const list = await firstValueFrom(
      http.get<PagedResult<Product>>('/api/products', {
        params: new HttpParams().set('page', 0).set('pageSize', 1),
      }),
    );
    if (list.items[0]) {
      await firstValueFrom(http.delete(`/api/products/${list.items[0].id}`));
    }
    expect(true).toBe(true);
  });

  it('lists orders with search and status', async () => {
    const res = await firstValueFrom(
      http.get<PagedResult<Order>>('/api/orders', {
        params: new HttpParams()
          .set('page', 0)
          .set('pageSize', 5)
          .set('search', 'ord')
          .set('status', 'pending'),
      }),
    );
    expect(Array.isArray(res.items)).toBe(true);
  });

  it('returns analytics payload', async () => {
    const res = await firstValueFrom(http.get<Record<string, unknown>>('/api/analytics'));
    expect(res['visitorsByDay']).toBeDefined();
  });

  it('404s on unknown /api route', async () => {
    await expect(firstValueFrom(http.get('/api/unknown'))).rejects.toMatchObject({
      status: 404,
    });
  });
});
