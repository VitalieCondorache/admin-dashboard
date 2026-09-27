import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LoginComponent } from './login.component';
import { provideTranslocoTesting } from '../../../testing/transloco-testing';

const routerStub = {
  navigate: vi.fn().mockResolvedValue(true),
  navigateByUrl: vi.fn().mockResolvedValue(true),
};
const routeStub = {
  snapshot: { queryParamMap: convertToParamMap({}) },
};

function createFixture() {
  routerStub.navigate.mockClear();
  routerStub.navigateByUrl.mockClear();
  TestBed.configureTestingModule({
    imports: [LoginComponent],
    providers: [
      provideNoopAnimations(),
      { provide: Router, useValue: routerStub },
      { provide: ActivatedRoute, useValue: routeStub },
      provideHttpClient(),
      provideHttpClientTesting(),
      provideTranslocoTesting(),
    ],
  });
  const fixture = TestBed.createComponent(LoginComponent);
  fixture.detectChanges();
  return fixture;
}

describe('LoginComponent', () => {
  it('creates with prefilled demo credentials (valid form)', () => {
    const fixture = createFixture();
    const cmp = fixture.componentInstance;
    expect(cmp.form.valid).toBe(true);
    expect(cmp.form.controls.email.value).toBe('admin@demo.com');
  });

  it('form becomes invalid with a malformed email', () => {
    const fixture = createFixture();
    fixture.componentInstance.form.controls.email.setValue('not-an-email');
    expect(fixture.componentInstance.form.controls.email.valid).toBe(false);
  });

  it('short password fails minLength validator', () => {
    const fixture = createFixture();
    fixture.componentInstance.form.controls.password.setValue('123');
    expect(fixture.componentInstance.form.controls.password.valid).toBe(false);
  });

  it('submit() no-ops when form is invalid', () => {
    const fixture = createFixture();
    fixture.componentInstance.form.controls.email.setValue('');
    fixture.componentInstance.submit();
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('submit() calls AuthService.login and navigates on success', async () => {
    const fixture = createFixture();
    const http = TestBed.inject(HttpTestingController);

    fixture.componentInstance.submit();
    expect(fixture.componentInstance.loading()).toBe(true);

    http.expectOne('/api/auth/login').flush({
      user: { id: '1', email: 'admin@demo.com', name: 'A', role: 'admin', status: 'active', createdAt: '' },
      tokens: { accessToken: 'T', refreshToken: 'R' },
    });
    await Promise.resolve();
    expect(fixture.componentInstance.loading()).toBe(false);
    expect(routerStub.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    http.verify();
  });

  it('submit() resets loading on error', async () => {
    const fixture = createFixture();
    const http = TestBed.inject(HttpTestingController);
    fixture.componentInstance.submit();
    http.expectOne('/api/auth/login').flush(null, { status: 401, statusText: 'Unauthorized' });
    await Promise.resolve();
    expect(fixture.componentInstance.loading()).toBe(false);
    http.verify();
  });

  it('renders loading indicator while submitting', () => {
    const fixture = createFixture();
    const http = TestBed.inject(HttpTestingController);
    fixture.componentInstance.submit();
    fixture.detectChanges();
    expect(fixture.componentInstance.loading()).toBe(true);
    http.expectOne('/api/auth/login').flush({
      user: { id: '1', email: 'a', name: 'A', role: 'admin', status: 'active', createdAt: '' },
      tokens: { accessToken: 'T', refreshToken: 'R' },
    });
  });

  it('can toggle hidePassword', () => {
    const fixture = createFixture();
    const c = fixture.componentInstance;
    expect(c.hidePassword()).toBe(true);
    c.hidePassword.set(false);
    fixture.detectChanges();
    expect(c.hidePassword()).toBe(false);
  });
});
