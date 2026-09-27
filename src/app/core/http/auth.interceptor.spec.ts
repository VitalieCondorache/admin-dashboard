import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => controller.verify());

  it('does not set Authorization header when no token', () => {
    http.get('/test').subscribe();
    const req = controller.expectOne('/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('adds Bearer token when authenticated', () => {
    auth['state'].set({
      user: { id: '1', email: '', name: '', role: 'admin', status: 'active', createdAt: '' },
      tokens: { accessToken: 'abc', refreshToken: 'r' },
    });
    http.get('/test').subscribe();
    const req = controller.expectOne('/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
    req.flush({});
  });
});
