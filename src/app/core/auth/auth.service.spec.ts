import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  const routerStub = { navigate: vi.fn().mockResolvedValue(true) };

  beforeEach(() => {
    localStorage.clear();
    routerStub.navigate.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerStub },
      ],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('starts unauthenticated', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
    expect(service.accessToken()).toBeNull();
  });

  it('stores session after successful login', () => {
    const mockRes = {
      user: { id: '1', email: 'a@b.c', name: 'A', role: 'admin', status: 'active', createdAt: '' },
      tokens: { accessToken: 'T', refreshToken: 'R' },
    };
    service.login({ email: 'a@b.c', password: 'x' }).subscribe();
    const req = http.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockRes);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.user()?.email).toBe('a@b.c');
    expect(service.accessToken()).toBe('T');
    expect(localStorage.getItem('admin.auth')).toContain('a@b.c');
  });

  it('clears session on logout', () => {
    localStorage.setItem(
      'admin.auth',
      JSON.stringify({
        user: { id: '1', email: 'x', name: 'x', role: 'admin', status: 'active', createdAt: '' },
        tokens: { accessToken: 'T', refreshToken: 'R' },
      }),
    );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerStub },
      ],
    });
    const fresh = TestBed.inject(AuthService);
    expect(fresh.isAuthenticated()).toBe(true);

    fresh.logout();
    expect(fresh.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('admin.auth')).toBeNull();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('hasRole matches current role', () => {
    service['state'].set({
      user: { id: '1', email: '', name: '', role: 'manager', status: 'active', createdAt: '' },
      tokens: { accessToken: 'T', refreshToken: 'R' },
    });
    expect(service.hasRole('manager', 'admin')).toBe(true);
    expect(service.hasRole('user')).toBe(false);
  });
});
