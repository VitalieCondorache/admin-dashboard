import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ConfirmDialogComponent, ConfirmData } from './confirm.dialog';
import { provideTranslocoTesting } from '../../../testing/transloco-testing';

function setup(data: ConfirmData) {
  TestBed.configureTestingModule({
    imports: [ConfirmDialogComponent],
    providers: [
      provideNoopAnimations(),
      provideTranslocoTesting(),
      { provide: MAT_DIALOG_DATA, useValue: data },
    ],
  });
  const fixture = TestBed.createComponent(ConfirmDialogComponent);
  fixture.detectChanges();
  return fixture;
}

describe('ConfirmDialogComponent', () => {
  it('renders title, message and default labels', () => {
    const fixture = setup({ title: 'Del?', message: 'Sure?' });
    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Del?');
    expect(host.textContent).toContain('Sure?');
    expect(host.textContent).toContain('confirm.cancel');
    expect(host.textContent).toContain('confirm.confirm');
  });

  it('renders custom labels when provided', () => {
    const fixture = setup({
      title: 'T',
      message: 'M',
      confirmText: 'Yes',
      cancelText: 'No',
      variant: 'danger',
    });
    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Yes');
    expect(host.textContent).toContain('No');
    // danger variant -> icon "warning"
    expect(host.textContent).toContain('warning');
  });
});
