import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    TestBed.configureTestingModule({});
  });

  it('applies initial theme from localStorage', () => {
    localStorage.setItem('admin.theme', 'dark');
    const service = TestBed.inject(ThemeService);
    TestBed.tick();
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles between light and dark and persists', () => {
    localStorage.setItem('admin.theme', 'light');
    const service = TestBed.inject(ThemeService);
    TestBed.tick();
    expect(service.theme()).toBe('light');

    service.toggle();
    TestBed.tick();
    expect(service.theme()).toBe('dark');
    expect(localStorage.getItem('admin.theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    service.toggle();
    TestBed.tick();
    expect(service.theme()).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
