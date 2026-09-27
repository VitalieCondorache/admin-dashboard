import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TranslocoModule } from '@jsverse/transloco';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

interface DashboardStats {
  totalRevenue: number;
  revenueDelta: number;
  activeUsers: number;
  activeUsersDelta: number;
  newSignups: number;
  newSignupsDelta: number;
  conversionRate: number;
  conversionDelta: number;
  revenueByMonth: number[];
  usersByRole: Record<string, number>;
  recentOrders: {
    id: string;
    customer: string;
    amount: number;
    status: string;
    date: string;
  }[];
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatCardModule, MatChipsModule, TranslocoModule, BaseChartDirective],
  templateUrl: './dashboard-home.component.html',
})
export class DashboardHomeComponent {
  private readonly http = inject(HttpClient);

  readonly stats = toSignal(this.http.get<DashboardStats>('/api/dashboard/stats'), {
    initialValue: null,
  });

  readonly kpis = computed(() => {
    const s = this.stats();
    if (!s) return [];
    return [
      {
        labelKey: 'dashboard.totalRevenue',
        value: '$' + s.totalRevenue.toLocaleString(),
        delta: s.revenueDelta,
        icon: 'payments',
        color: 'emerald',
      },
      {
        labelKey: 'dashboard.activeUsers',
        value: s.activeUsers.toLocaleString(),
        delta: s.activeUsersDelta,
        icon: 'group',
        color: 'blue',
      },
      {
        labelKey: 'dashboard.newSignups',
        value: s.newSignups.toLocaleString(),
        delta: s.newSignupsDelta,
        icon: 'person_add',
        color: 'amber',
      },
      {
        labelKey: 'dashboard.conversionRate',
        value: s.conversionRate + '%',
        delta: s.conversionDelta,
        icon: 'trending_up',
        color: 'purple',
      },
    ];
  });

  readonly revenueChart = computed<ChartConfiguration<'line'>['data']>(() => {
    const s = this.stats();
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          data: s?.revenueByMonth ?? [],
          label: 'Revenue (k $)',
          borderColor: '#3366ff',
          backgroundColor: 'rgba(51, 102, 255, 0.12)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  });

  readonly revenueOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(128,128,128,0.1)' } },
      x: { grid: { display: false } },
    },
  };

  readonly rolesChart = computed<ChartConfiguration<'doughnut'>['data']>(() => {
    const s = this.stats();
    const r = s?.usersByRole ?? { admin: 0, manager: 0, user: 0 };
    return {
      labels: ['Admin', 'Manager', 'User'],
      datasets: [
        {
          data: [r['admin'], r['manager'], r['user']],
          backgroundColor: ['#3366ff', '#8db5ff', '#dae6ff'],
          borderWidth: 0,
        },
      ],
    };
  });

  readonly rolesOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: { legend: { position: 'bottom' } },
  };
}
