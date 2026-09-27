import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Only accept same-origin absolute paths. Protects against open-redirect
 * attacks via the `returnUrl` query parameter.
 */
function isSafeInternalPath(value: string | null | undefined): value is string {
  return !!value && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\');
}

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return router.createUrlTree(['/auth/login'], {
    queryParams: isSafeInternalPath(state.url) ? { returnUrl: state.url } : undefined,
  });
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? router.createUrlTree(['/']) : true;
};

export const roleGuard = (...roles: string[]): CanActivateFn => {
  return (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/auth/login'], {
        queryParams: isSafeInternalPath(state.url) ? { returnUrl: state.url } : undefined,
      });
    }
    if (!auth.hasRole(...roles)) return router.createUrlTree(['/forbidden']);
    return true;
  };
};

export { isSafeInternalPath };
