import {
  SEED_ANALYTICS,
  SEED_STATS,
  seedOrders,
  seedProducts,
  seedUsers,
} from './seed';

describe('seed data', () => {
  it('seedUsers generates the requested number of users with required fields', () => {
    const users = seedUsers(10);
    expect(users.length).toBe(10);
    for (const u of users) {
      expect(u.id).toBeTruthy();
      expect(u.email).toContain('@');
      expect(['admin', 'manager', 'user']).toContain(u.role);
      expect(['active', 'inactive', 'pending']).toContain(u.status);
    }
  });

  it('seedProducts generates products with valid status and numeric price/stock', () => {
    const products = seedProducts(5);
    expect(products.length).toBe(5);
    for (const p of products) {
      expect(['published', 'draft', 'archived']).toContain(p.status);
      expect(typeof p.price).toBe('number');
      expect(typeof p.stock).toBe('number');
    }
  });

  it('seedOrders generates orders with valid status and payment', () => {
    const orders = seedOrders(5);
    expect(orders.length).toBe(5);
    for (const o of orders) {
      expect(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).toContain(o.status);
      expect(['card', 'paypal', 'bank']).toContain(o.paymentMethod);
    }
  });

  it('exposes SEED_STATS and SEED_ANALYTICS constants', () => {
    expect(SEED_STATS.revenueByMonth.length).toBe(12);
    expect(SEED_ANALYTICS.visitorsByDay.length).toBe(30);
    expect(SEED_ANALYTICS.topCountries.length).toBeGreaterThan(0);
  });
});
