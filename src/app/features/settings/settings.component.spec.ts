import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SettingsComponent } from './settings.component';
import { provideTranslocoTesting } from '../../../testing/transloco-testing';

describe('SettingsComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslocoTesting(),
      ],
    });
  });

  it('creates with the three forms', () => {
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    expect(cmp).toBeTruthy();
    expect(cmp.profileForm).toBeDefined();
    expect(cmp.passwordForm).toBeDefined();
    expect(cmp.notifyForm).toBeDefined();
  });

  it('profile form requires name and valid email', () => {
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
    const f = fixture.componentInstance.profileForm;
    f.patchValue({ name: '', email: 'bad' });
    expect(f.invalid).toBe(true);
    f.patchValue({ name: 'Ion', email: 'ion@x.com' });
    expect(f.valid).toBe(true);
  });

  it('password form enforces minLength(8) on new password', () => {
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
    const f = fixture.componentInstance.passwordForm;
    f.setValue({ current: 'a', next: 'short', confirm: 'short' });
    expect(f.controls.next.valid).toBe(false);
    f.controls.next.setValue('longenough');
    expect(f.controls.next.valid).toBe(true);
  });
});
