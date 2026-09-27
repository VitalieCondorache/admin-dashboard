import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { AnalyticsComponent } from './analytics.component';
import { provideTranslocoTesting } from '../../../testing/transloco-testing';

describe('AnalyticsComponent', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AnalyticsComponent],
      providers: [
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideCharts(withDefaultRegisterables()),
        provideTranslocoTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('creates', () => {
    const fixture = TestBed.createComponent(AnalyticsComponent);
    fixture.detectChanges();
    http.expectOne('/api/analytics').flush({
      visitorsByDay: [],
      trafficSources: {},
      devices: {},
      topCountries: [],
      salesByCategory: [],
    });
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('computes totals correctly', () => {
    const fixture = TestBed.createComponent(AnalyticsComponent);
    fixture.detectChanges();
    http.expectOne('/api/analytics').flush({
      visitorsByDay: [
        { date: '2024-01-01', visitors: 100, pageviews: 300 },
        { date: '2024-01-02', visitors: 50, pageviews: 150 },
      ],
      trafficSources: { google: 60, direct: 40 },
      devices: { desktop: 80, mobile: 20 },
      topCountries: [
        { country: 'Romania', code: 'RO', visitors: 120, pct: 60 },
        { country: 'France', code: 'FR', visitors: 80, pct: 40 },
      ],
      salesByCategory: [{ category: 'A', sales: 1 }],
    });
    fixture.detectChanges();
    const t = fixture.componentInstance.totals()!;
    expect(t.totalVisitors).toBe(150);
    expect(t.totalPageviews).toBe(450);
    expect(t.avgSession).toBe('3.00');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Romania');
  });
});
