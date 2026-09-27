import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  const snackStub = { open: vi.fn() };
  const routerStub = { navigate: vi.fn().mockResolvedValue(true) };

  beforeEach(() => {
    localStorage.clear();
    snackStub.open.mockClear();
    routerStub.navigate.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: snackStub },
        { provide: Router, useValue: routerStub },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('opens snackbar with server message on 500', () => {
    http.get('/x').subscribe({ error: () => undefined });
    controller
      .expectOne('/x')
      .flush({ message: 'Boom' }, { status: 500, statusText: 'Server Error' });
    expect(snackStub.open).toHaveBeenCalled();
    expect(snackStub.open.mock.calls[0][0]).toBe('Boom');
  });

  it('logs out on 401 and still shows snackbar', () => {
    const auth = TestBed.inject(AuthService);
    const spy = vi.spyOn(auth, 'logout');
    http.get('/y').subscribe({ error: () => undefined });
    controller.expectOne('/y').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(spy).toHaveBeenCalled();
    expect(snackStub.open).toHaveBeenCalled();
  });

  it('falls back to generic message when none provided', () => {
    http.get('/z').subscribe({ error: () => undefined });
    controller.expectOne('/z').flush(null, { status: 0, statusText: '' });
    expect(snackStub.open).toHaveBeenCalled();
  });
});
