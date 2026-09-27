import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackbar = inject(MatSnackBar);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.logout();
      }
      const message =
        err.error?.message ?? err.statusText ?? 'Something went wrong. Please try again.';
      snackbar.open(message, 'Close', { duration: 4000, panelClass: 'snack-error' });
      return throwError(() => err);
    }),
  );
};
