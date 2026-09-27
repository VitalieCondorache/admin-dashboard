import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { UserFormDialogComponent, UserFormData } from './user-form.dialog';
import { User } from '../../core/models';
import { provideTranslocoTesting } from '../../../testing/transloco-testing';

function setup(data: UserFormData, dialogRef = { close: vi.fn() }) {
  TestBed.configureTestingModule({
    imports: [UserFormDialogComponent],
    providers: [
      provideNoopAnimations(),
      provideTranslocoTesting(),
      { provide: MAT_DIALOG_DATA, useValue: data },
      { provide: MatDialogRef, useValue: dialogRef },
    ],
  });
  const fixture = TestBed.createComponent(UserFormDialogComponent);
  fixture.detectChanges();
  return { fixture, dialogRef, cmp: fixture.componentInstance };
}

describe('UserFormDialogComponent', () => {
  it('creates in "create" mode with an invalid empty form', () => {
    const { cmp } = setup({ mode: 'create' });
    expect(cmp.form.invalid).toBe(true);
    expect(cmp.form.controls.role.value).toBe('user');
    expect(cmp.form.controls.status.value).toBe('active');
  });

  it('patches form from user in "edit" mode', () => {
    const user: User = {
      id: '1',
      email: 'a@b.c',
      name: 'Ana',
      role: 'admin',
      status: 'active',
      createdAt: '',
    };
    const { cmp } = setup({ mode: 'edit', user });
    expect(cmp.form.controls.name.value).toBe('Ana');
    expect(cmp.form.controls.email.value).toBe('a@b.c');
    expect(cmp.form.controls.role.value).toBe('admin');
  });

  it('submit() does nothing when form is invalid', () => {
    const { cmp, dialogRef } = setup({ mode: 'create' });
    cmp.submit();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('submit() closes dialog with payload when form is valid', () => {
    const { cmp, dialogRef } = setup({ mode: 'create' });
    cmp.form.setValue({
      name: 'Ion',
      email: 'ion@x.com',
      role: 'manager',
      status: 'pending',
    });
    cmp.submit();
    expect(dialogRef.close).toHaveBeenCalledWith({
      name: 'Ion',
      email: 'ion@x.com',
      role: 'manager',
      status: 'pending',
    });
  });
});
