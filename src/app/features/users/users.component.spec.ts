import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideTranslocoTesting } from '../../../testing/transloco-testing';
import { UsersComponent } from './users.component';
import { UsersApi } from './users.api';
import { User } from '../../core/models';

const user: User = {
  id: 'u1',
  email: 'a@b.c',
  name: 'Ana',
  role: 'user',
  status: 'active',
  createdAt: '',
};

function makeDialog(afterClosedValue: unknown) {
  const ref = { afterClosed: () => of(afterClosedValue) };
  return { open: vi.fn().mockReturnValue(ref) };
}

describe('UsersComponent', () => {
  const snackStub = { open: vi.fn() };

  function configure(dialogStub: { open: ReturnType<typeof vi.fn> }) {
    TestBed.configureTestingModule({
      imports: [UsersComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslocoTesting(),
        { provide: MatDialog, useValue: dialogStub },
        { provide: MatSnackBar, useValue: snackStub },
        {
          provide: UsersApi,
          useValue: {
            list: vi
              .fn()
              .mockReturnValue(of({ items: [], total: 0, page: 0, pageSize: 10 })),
            create: vi.fn().mockReturnValue(of({})),
            update: vi.fn().mockReturnValue(of({})),
            remove: vi.fn().mockReturnValue(of(void 0)),
          },
        },
      ],
    });
  }

  beforeEach(() => {
    snackStub.open.mockClear();
  });

  it('creates', () => {
    configure(makeDialog(null));
    const fixture = TestBed.createComponent(UsersComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('badgeClass returns expected mappings', () => {
    configure(makeDialog(null));
    const fixture = TestBed.createComponent(UsersComponent);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    expect(c.badgeClass('active')).toContain('emerald');
    expect(c.badgeClass('inactive')).toContain('zinc');
    expect(c.badgeClass('pending')).toContain('amber');
    expect(c.badgeClass('unknown')).toBe('');
  });

  it('onPage updates store query', () => {
    configure(makeDialog(null));
    const fixture = TestBed.createComponent(UsersComponent);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    c.onPage({ pageIndex: 2, pageSize: 25, length: 0 });
    expect(c.store.query().page).toBe(2);
    expect(c.store.query().pageSize).toBe(25);
  });

  it('onSort updates sort config', () => {
    configure(makeDialog(null));
    const fixture = TestBed.createComponent(UsersComponent);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    c.onSort({ active: 'name', direction: 'desc' });
    expect(c.store.query().sortBy).toBe('name');
    expect(c.store.query().sortDir).toBe('desc');
  });

  it('openCreate calls store.create and shows snackbar on confirm', () => {
    const payload = { name: 'X', email: 'x@y.z', role: 'user', status: 'active' };
    configure(makeDialog(payload));
    const fixture = TestBed.createComponent(UsersComponent);
    fixture.detectChanges();
    const spy = vi.spyOn(fixture.componentInstance.store, 'create');
    fixture.componentInstance.openCreate();
    expect(spy).toHaveBeenCalledWith(payload);
    expect(snackStub.open).toHaveBeenCalled();
  });

  it('openCreate does nothing on cancel', () => {
    configure(makeDialog(null));
    const fixture = TestBed.createComponent(UsersComponent);
    fixture.detectChanges();
    const spy = vi.spyOn(fixture.componentInstance.store, 'create');
    fixture.componentInstance.openCreate();
    expect(spy).not.toHaveBeenCalled();
  });

  it('openEdit calls store.update with user id', () => {
    const payload = { name: 'Updated' };
    configure(makeDialog(payload));
    const fixture = TestBed.createComponent(UsersComponent);
    fixture.detectChanges();
    const spy = vi.spyOn(fixture.componentInstance.store, 'update');
    fixture.componentInstance.openEdit(user);
    expect(spy).toHaveBeenCalledWith('u1', payload);
  });

  it('confirmDelete calls store.remove when user confirms', () => {
    configure(makeDialog(true));
    const fixture = TestBed.createComponent(UsersComponent);
    fixture.detectChanges();
    const spy = vi.spyOn(fixture.componentInstance.store, 'remove');
    fixture.componentInstance.confirmDelete(user);
    expect(spy).toHaveBeenCalledWith('u1');
  });

  it('confirmDelete does nothing when cancelled', () => {
    configure(makeDialog(false));
    const fixture = TestBed.createComponent(UsersComponent);
    fixture.detectChanges();
    const spy = vi.spyOn(fixture.componentInstance.store, 'remove');
    fixture.componentInstance.confirmDelete(user);
    expect(spy).not.toHaveBeenCalled();
  });

  it('renders user rows when data is present', () => {
    const listSpy = vi
      .fn()
      .mockReturnValue(
        of({
          items: [user, { ...user, id: 'u2', name: 'Ion', status: 'pending' as const }],
          total: 2,
          page: 0,
          pageSize: 10,
        }),
      );
    TestBed.configureTestingModule({
      imports: [UsersComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslocoTesting(),
        { provide: MatDialog, useValue: makeDialog(null) },
        { provide: MatSnackBar, useValue: snackStub },
        {
          provide: UsersApi,
          useValue: {
            list: listSpy,
            create: vi.fn().mockReturnValue(of({})),
            update: vi.fn().mockReturnValue(of({})),
            remove: vi.fn().mockReturnValue(of(void 0)),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(UsersComponent);
    fixture.detectChanges();
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Ana');
    expect(text).toContain('Ion');
  });
});
