import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UsersApi } from './users.api';

describe('UsersApi', () => {
  let api: UsersApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(UsersApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('list() sends pagination/sort/search params', () => {
    api
      .list({ page: 2, pageSize: 25, sortBy: 'name', sortDir: 'asc', search: 'jo' })
      .subscribe();
    const req = http.expectOne(
      (r) => r.url === '/api/users' && r.method === 'GET',
    );
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('pageSize')).toBe('25');
    expect(req.request.params.get('sortBy')).toBe('name');
    expect(req.request.params.get('sortDir')).toBe('asc');
    expect(req.request.params.get('search')).toBe('jo');
    req.flush({ items: [], total: 0, page: 2, pageSize: 25 });
  });

  it('get() hits /api/users/:id', () => {
    api.get('abc').subscribe();
    const req = http.expectOne('/api/users/abc');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('create() POSTs payload', () => {
    api.create({ name: 'X' }).subscribe();
    const req = http.expectOne('/api/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'X' });
    req.flush({});
  });

  it('update() PUTs payload to /api/users/:id', () => {
    api.update('id1', { name: 'Y' }).subscribe();
    const req = http.expectOne('/api/users/id1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ name: 'Y' });
    req.flush({});
  });

  it('remove() DELETEs /api/users/:id', () => {
    api.remove('id1').subscribe();
    const req = http.expectOne('/api/users/id1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
