import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { DashboardHomeComponent } from './dashboard-home.component';
import { provideTranslocoTesting } from '../../../testing/transloco-testing';

describe('DashboardHomeComponent', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardHomeComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideCharts(withDefaultRegisterables()),
        provideTranslocoTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('creates and computes empty kpis until data arrives', () => {
    const fixture = TestBed.createComponent(DashboardHomeComponent);
    fixture.detectChanges();
    http.expectOne('/api/dashboard/stats').flush({
      totalRevenue: 0,
      revenueDelta: 0,
      activeUsers: 0,
      activeUsersDelta: 0,
      newSignups: 0,
      newSignupsDelta: 0,
      conversionRate: 0,
      conversionDelta: 0,
      revenueByMonth: [],
      usersByRole: { admin: 0, manager: 0, user: 0 },
      recentOrders: [],
    });
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.kpis().length).toBe(4);
  });

  it('builds KPIs from stats payload', () => {
    const fixture = TestBed.createComponent(DashboardHomeComponent);
    fixture.detectChanges();
    http.expectOne('/api/dashboard/stats').flush({
      totalRevenue: 1234,
      revenueDelta: 5,
      activeUsers: 10,
      activeUsersDelta: -2,
      newSignups: 3,
      newSignupsDelta: 1,
      conversionRate: 2.5,
      conversionDelta: 0.1,
      revenueByMonth: Array(12).fill(0),
      usersByRole: { admin: 1, manager: 2, user: 7 },
      recentOrders: [
        { id: 'ORD-1', customer: 'Ana', amount: 100, status: 'pending', date: '2024-01-01' },
        { id: 'ORD-2', customer: 'Ion', amount: 200, status: 'paid', date: '2024-01-02' },
      ],
    });
    fixture.detectChanges();
    const kpis = fixture.componentInstance.kpis();
    expect(kpis[0].value).toContain('1,234');
    expect(kpis[3].value).toBe('2.5%');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('ORD-1');
  });
});
