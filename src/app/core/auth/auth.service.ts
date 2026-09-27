import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthTokens, LoginPayload, User } from '../models';

const STORAGE_KEY = 'admin.auth';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly state = signal<AuthState>(this.restore());

  readonly user = computed(() => this.state().user);
  readonly isAuthenticated = computed(() => !!this.state().tokens?.accessToken);
  readonly accessToken = computed(() => this.state().tokens?.accessToken ?? null);
  readonly role = computed(() => this.state().user?.role ?? null);

  login(payload: LoginPayload): Observable<{ user: User; tokens: AuthTokens }> {
    return this.http
      .post<{ user: User; tokens: AuthTokens }>('/api/auth/login', payload)
      .pipe(tap((res) => this.setSession(res.user, res.tokens)));
  }

  logout(): void {
    this.state.set({ user: null, tokens: null });
    localStorage.removeItem(STORAGE_KEY);
    void this.router.navigate(['/auth/login']);
  }

  hasRole(...roles: string[]): boolean {
    const r = this.role();
    return !!r && roles.includes(r);
  }

  private setSession(user: User, tokens: AuthTokens): void {
    const next = { user, tokens };
    this.state.set(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  private restore(): AuthState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthState) : { user: null, tokens: null };
    } catch {
      return { user: null, tokens: null };
    }
  }
}
