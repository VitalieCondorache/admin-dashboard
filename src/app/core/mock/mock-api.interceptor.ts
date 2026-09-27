import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';
import { PagedResult, User } from '../models';
import {
  Order,
  Product,
  SEED_ANALYTICS,
  SEED_STATS,
  seedOrders,
  seedProducts,
  seedUsers,
} from './seed';

const LATENCY = 350;
let USERS: User[] = seedUsers();
let PRODUCTS: Product[] = seedProducts();
const ORDERS: Order[] = seedOrders();

function json<T>(body: T, status = 200): Observable<HttpResponse<T>> {
  return of(new HttpResponse<T>({ status, body })).pipe(delay(LATENCY));
}

function err(status: number, message: string): Observable<never> {
  return throwError(
    () => new HttpErrorResponse({ status, statusText: message, error: { message } }),
  ).pipe(delay(LATENCY)) as unknown as Observable<never>;
}

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url;
  if (!url.startsWith('/api/')) return next(req);

  // Auth
  if (url === '/api/auth/login' && req.method === 'POST') {
    const { email, password } = req.body as { email: string; password: string };
    if (email === 'admin@demo.com' && password === 'admin123') {
      return json({
        user: {
          id: '1',
          name: 'Admin Demo',
          email,
          role: 'admin' as const,
          status: 'active' as const,
          avatarUrl: 'https://i.pravatar.cc/64?img=12',
          createdAt: new Date().toISOString(),
        },
        tokens: { accessToken: 'mock-jwt-token', refreshToken: 'mock-refresh' },
      });
    }
    return err(401, 'Invalid credentials');
  }

  // Dashboard stats
  if (url === '/api/dashboard/stats' && req.method === 'GET') {
    return json(SEED_STATS);
  }

  // Users list
  if (url === '/api/users' && req.method === 'GET') {
    const page = +(req.params.get('page') ?? 0);
    const pageSize = +(req.params.get('pageSize') ?? 10);
    const search = (req.params.get('search') ?? '').toLowerCase();
    const sortBy = req.params.get('sortBy') ?? 'createdAt';
    const sortDir = req.params.get('sortDir') ?? 'desc';

    let data = USERS;
    if (search) {
      data = data.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.role.toLowerCase().includes(search),
      );
    }
    data = [...data].sort((a, b) => {
      const av = (a as unknown as Record<string, string>)[sortBy] ?? '';
      const bv = (b as unknown as Record<string, string>)[sortBy] ?? '';
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    const total = data.length;
    const items = data.slice(page * pageSize, page * pageSize + pageSize);
    const result: PagedResult<User> = { items, total, page, pageSize };
    return json(result);
  }

  // Users CRUD by id
  const idMatch = url.match(/^\/api\/users\/([\w-]+)$/);
  if (idMatch) {
    const id = idMatch[1];
    if (req.method === 'GET') {
      const found = USERS.find((u) => u.id === id);
      return found ? json(found) : err(404, 'User not found');
    }
    if (req.method === 'PUT') {
      const idx = USERS.findIndex((u) => u.id === id);
      if (idx === -1) return err(404, 'User not found');
      USERS[idx] = { ...USERS[idx], ...(req.body as Partial<User>) };
      return json(USERS[idx]);
    }
    if (req.method === 'DELETE') {
      USERS = USERS.filter((u) => u.id !== id);
      return json<void>(undefined as unknown as void, 204);
    }
  }

  if (url === '/api/users' && req.method === 'POST') {
    const body = req.body as Partial<User>;
    const user: User = {
      id: crypto.randomUUID(),
      name: body.name ?? 'New user',
      email: body.email ?? 'new@example.com',
      role: body.role ?? 'user',
      status: body.status ?? 'pending',
      avatarUrl: body.avatarUrl,
      createdAt: new Date().toISOString(),
    };
    USERS = [user, ...USERS];
    return json(user, 201);
  }

  // Products
  if (url === '/api/products' && req.method === 'GET') {
    const page = +(req.params.get('page') ?? 0);
    const pageSize = +(req.params.get('pageSize') ?? 12);
    const search = (req.params.get('search') ?? '').toLowerCase();
    const category = req.params.get('category') ?? '';
    const status = req.params.get('status') ?? '';

    let data = PRODUCTS;
    if (search) {
      data = data.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search),
      );
    }
    if (category) data = data.filter((p) => p.category === category);
    if (status) data = data.filter((p) => p.status === status);

    const total = data.length;
    const items = data.slice(page * pageSize, page * pageSize + pageSize);
    return json<PagedResult<Product>>({ items, total, page, pageSize });
  }

  const prodMatch = url.match(/^\/api\/products\/([\w-]+)$/);
  if (prodMatch) {
    const id = prodMatch[1];
    if (req.method === 'DELETE') {
      PRODUCTS = PRODUCTS.filter((p) => p.id !== id);
      return json<void>(undefined as unknown as void, 204);
    }
  }

  // Orders
  if (url === '/api/orders' && req.method === 'GET') {
    const page = +(req.params.get('page') ?? 0);
    const pageSize = +(req.params.get('pageSize') ?? 10);
    const search = (req.params.get('search') ?? '').toLowerCase();
    const status = req.params.get('status') ?? '';

    let data = ORDERS;
    if (search) {
      data = data.filter(
        (o) =>
          o.id.toLowerCase().includes(search) ||
          o.customer.toLowerCase().includes(search) ||
          o.email.toLowerCase().includes(search),
      );
    }
    if (status) data = data.filter((o) => o.status === status);

    const total = data.length;
    const items = data.slice(page * pageSize, page * pageSize + pageSize);
    return json<PagedResult<Order>>({ items, total, page, pageSize });
  }

  // Analytics
  if (url === '/api/analytics' && req.method === 'GET') {
    return json(SEED_ANALYTICS);
  }

  return err(404, `Mock route not found: ${req.method} ${url}`);
};
