import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

interface AnalyticsData {
  visitorsByDay: { date: string; visitors: number; pageviews: number }[];
  trafficSources: Record<string, number>;
  devices: Record<string, number>;
  topCountries: { country: string; code: string; visitors: number; pct: number }[];
  salesByCategory: { category: string; sales: number }[];
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslocoModule, BaseChartDirective],
  templateUrl: './analytics.component.html',
})
export class AnalyticsComponent {
  private readonly http = inject(HttpClient);
  readonly data = toSignal(this.http.get<AnalyticsData>('/api/analytics'), {
    initialValue: null,
  });

  readonly totals = computed(() => {
    const d = this.data();
    if (!d) return null;
    const totalVisitors = d.visitorsByDay.reduce((s, x) => s + x.visitors, 0);
    const totalPageviews = d.visitorsByDay.reduce((s, x) => s + x.pageviews, 0);
    const avgSession = (totalPageviews / Math.max(totalVisitors, 1)).toFixed(2);
    return { totalVisitors, totalPageviews, avgSession };
  });

  readonly visitorsChart = computed<ChartConfiguration<'line'>['data']>(() => {
    const d = this.data();
    return {
      labels: d?.visitorsByDay.map((x) => x.date.slice(5)) ?? [],
      datasets: [
        {
          data: d?.visitorsByDay.map((x) => x.visitors) ?? [],
          label: 'Visitors',
          borderColor: '#3366ff',
          backgroundColor: 'rgba(51, 102, 255, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          data: d?.visitorsByDay.map((x) => x.pageviews) ?? [],
          label: 'Pageviews',
          borderColor: '#10b981',
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2,
          borderDash: [6, 4],
        },
      ],
    };
  });

  readonly visitorsOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { grid: { color: 'rgba(128,128,128,0.1)' } }, x: { grid: { display: false } } },
  };

  readonly trafficChart = computed<ChartConfiguration<'doughnut'>['data']>(() => {
    const d = this.data();
    const labels = Object.keys(d?.trafficSources ?? {});
    return {
      labels,
      datasets: [
        {
          data: labels.map((k) => d!.trafficSources[k]),
          backgroundColor: ['#3366ff', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
          borderWidth: 0,
        },
      ],
    };
  });

  readonly deviceChart = computed<ChartConfiguration<'doughnut'>['data']>(() => {
    const d = this.data();
    const labels = Object.keys(d?.devices ?? {});
    return {
      labels,
      datasets: [
        {
          data: labels.map((k) => d!.devices[k]),
          backgroundColor: ['#3366ff', '#8db5ff', '#dae6ff'],
          borderWidth: 0,
        },
      ],
    };
  });

  readonly doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: { legend: { position: 'bottom' } },
  };

  readonly salesChart = computed<ChartConfiguration<'bar'>['data']>(() => {
    const d = this.data();
    return {
      labels: d?.salesByCategory.map((x) => x.category) ?? [],
      datasets: [
        {
          data: d?.salesByCategory.map((x) => x.sales) ?? [],
          label: 'Sales ($)',
          backgroundColor: '#3366ff',
          borderRadius: 8,
          maxBarThickness: 40,
        },
      ],
    };
  });

  readonly salesOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { grid: { color: 'rgba(128,128,128,0.1)' } }, x: { grid: { display: false } } },
  };
}
