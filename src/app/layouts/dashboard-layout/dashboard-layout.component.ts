import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/i18n/language.service';

interface NavItem {
  labelKey: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    TranslocoModule,
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly lang = inject(LanguageService);

  readonly nav: NavItem[] = [
    { labelKey: 'nav.dashboard', icon: 'dashboard', path: '/dashboard' },
    { labelKey: 'nav.users', icon: 'group', path: '/users' },
    { labelKey: 'nav.products', icon: 'inventory_2', path: '/products' },
    { labelKey: 'nav.orders', icon: 'receipt_long', path: '/orders' },
    { labelKey: 'nav.analytics', icon: 'analytics', path: '/analytics' },
    { labelKey: 'nav.settings', icon: 'settings', path: '/settings' },
  ];

  readonly collapsed = signal(false);
  readonly mobileOpen = signal(false);
  readonly isMobile = signal(typeof window !== 'undefined' && window.innerWidth < 1024);

  readonly sidebarCollapsedVisual = computed(
    () => !this.isMobile() && this.collapsed(),
  );

  @HostListener('window:resize')
  onResize(): void {
    const mobile = window.innerWidth < 1024;
    this.isMobile.set(mobile);
    if (!mobile) {
      this.mobileOpen.set(false);
    }
  }

  toggleSidebar(): void {
    if (this.isMobile()) {
      this.mobileOpen.update((v) => !v);
    } else {
      this.collapsed.update((v) => !v);
    }
  }

  closeMobile(): void {
    if (this.isMobile()) {
      this.mobileOpen.set(false);
    }
  }
}
