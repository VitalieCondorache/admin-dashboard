import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { authGuard, guestGuard, roleGuard } from './auth.guards';

function call(guard: ReturnType<typeof roleGuard> | typeof authGuard | typeof guestGuard) {
  return TestBed.runInInjectionContext(() =>
    guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
  );
}

describe('auth guards', () => {
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { createUrlTree: (segments: string[]) => ({ segments } as unknown as UrlTree) } },
      ],
    });
    auth = TestBed.inject(AuthService);
  });

  describe('authGuard', () => {
    it('allows navigation when authenticated', () => {
      auth['state'].set({
        user: { id: '1', email: '', name: '', role: 'admin', status: 'active', createdAt: '' },
        tokens: { accessToken: 'T', refreshToken: 'R' },
      });
      expect(call(authGuard)).toBe(true);
    });

    it('redirects to login when not authenticated', () => {
      const res = call(authGuard) as UrlTree & { segments: string[] };
      expect(res.segments).toEqual(['/auth/login']);
    });
  });

  describe('guestGuard', () => {
    it('allows when not authenticated', () => {
      expect(call(guestGuard)).toBe(true);
    });

    it('redirects to root when authenticated', () => {
      auth['state'].set({
        user: { id: '1', email: '', name: '', role: 'admin', status: 'active', createdAt: '' },
        tokens: { accessToken: 'T', refreshToken: 'R' },
      });
      const res = call(guestGuard) as UrlTree & { segments: string[] };
      expect(res.segments).toEqual(['/']);
    });
  });

  describe('roleGuard', () => {
    it('redirects to login when unauthenticated', () => {
      const guard = roleGuard('admin');
      const res = call(guard) as UrlTree & { segments: string[] };
      expect(res.segments).toEqual(['/auth/login']);
    });

    it('redirects to /forbidden when role does not match', () => {
      auth['state'].set({
        user: { id: '1', email: '', name: '', role: 'user', status: 'active', createdAt: '' },
        tokens: { accessToken: 'T', refreshToken: 'R' },
      });
      const guard = roleGuard('admin');
      const res = call(guard) as UrlTree & { segments: string[] };
      expect(res.segments).toEqual(['/forbidden']);
    });

    it('allows when role matches', () => {
      auth['state'].set({
        user: { id: '1', email: '', name: '', role: 'admin', status: 'active', createdAt: '' },
        tokens: { accessToken: 'T', refreshToken: 'R' },
      });
      const guard = roleGuard('admin', 'manager');
      expect(call(guard)).toBe(true);
    });
  });
});
