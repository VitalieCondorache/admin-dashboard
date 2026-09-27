import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideTranslocoTesting } from '../../../testing/transloco-testing';
import { DashboardLayoutComponent } from './dashboard-layout.component';

describe('DashboardLayoutComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardLayoutComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslocoTesting(),
      ],
    });
  });

  it('creates', () => {
    const fixture = TestBed.createComponent(DashboardLayoutComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('exposes navigation items', () => {
    const fixture = TestBed.createComponent(DashboardLayoutComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.nav.length).toBeGreaterThan(0);
    expect(fixture.componentInstance.nav[0].path).toBe('/dashboard');
  });

  it('toggleSidebar toggles collapsed on desktop', () => {
    const fixture = TestBed.createComponent(DashboardLayoutComponent);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    c.isMobile.set(false);
    c.collapsed.set(false);
    c.toggleSidebar();
    expect(c.collapsed()).toBe(true);
  });

  it('toggleSidebar toggles mobileOpen on mobile', () => {
    const fixture = TestBed.createComponent(DashboardLayoutComponent);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    c.isMobile.set(true);
    c.mobileOpen.set(false);
    c.toggleSidebar();
    expect(c.mobileOpen()).toBe(true);
  });

  it('closeMobile closes menu on mobile only', () => {
    const fixture = TestBed.createComponent(DashboardLayoutComponent);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    c.isMobile.set(true);
    c.mobileOpen.set(true);
    c.closeMobile();
    expect(c.mobileOpen()).toBe(false);
  });

  it('onResize switches isMobile based on width', () => {
    const fixture = TestBed.createComponent(DashboardLayoutComponent);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    c.mobileOpen.set(true);

    Object.defineProperty(window, 'innerWidth', { value: 1400, configurable: true });
    c.onResize();
    expect(c.isMobile()).toBe(false);
    expect(c.mobileOpen()).toBe(false);

    Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });
    c.onResize();
    expect(c.isMobile()).toBe(true);
  });
});
