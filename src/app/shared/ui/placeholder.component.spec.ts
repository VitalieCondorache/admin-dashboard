import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { PlaceholderComponent } from './placeholder.component';
import { provideTranslocoTesting } from '../../../testing/transloco-testing';

describe('PlaceholderComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PlaceholderComponent],
      providers: [provideZonelessChangeDetection(), provideTranslocoTesting()],
    });
  });

  it('creates with default titleKey', () => {
    const fixture = TestBed.createComponent(PlaceholderComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.titleKey).toBe('placeholder.comingSoon');
  });

  it('renders a custom titleKey', () => {
    const fixture = TestBed.createComponent(PlaceholderComponent);
    fixture.componentInstance.titleKey = 'custom.key';
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('custom.key');
  });
});
