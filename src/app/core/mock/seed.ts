import { User } from '../models';

const ROLES = ['admin', 'manager', 'user'] as const;
const STATUSES = ['active', 'inactive', 'pending'] as const;
const FIRST = ['Ana', 'Ion', 'Maria', 'George', 'Elena', 'Andrei', 'Ioana', 'Mihai', 'Raluca', 'Cristian', 'Diana', 'Vlad', 'Sofia', 'Radu', 'Alex'];
const LAST = ['Popescu', 'Ionescu', 'Georgescu', 'Stan', 'Dumitrescu', 'Marin', 'Constantin', 'Dobre', 'Radu', 'Mihai'];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

export function seedUsers(count = 87): User[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const first = pick(FIRST, i);
    const last = pick(LAST, i * 7 + 3);
    return {
      id: crypto.randomUUID(),
      name: `${first} ${last}`,
      email: `${first}.${last}`.toLowerCase() + `${i}@example.com`,
      role: pick(ROLES, i),
      status: pick(STATUSES, i * 3),
      avatarUrl: `https://i.pravatar.cc/64?img=${(i % 70) + 1}`,
      createdAt: new Date(now - i * 86400000).toISOString(),
    };
  });
}

export const SEED_STATS = {
  totalRevenue: 128_450,
  revenueDelta: 12.4,
  activeUsers: 1_284,
  activeUsersDelta: 4.2,
  newSignups: 342,
  newSignupsDelta: -2.1,
  conversionRate: 3.6,
  conversionDelta: 0.8,
  revenueByMonth: [12, 19, 14, 22, 28, 31, 29, 35, 41, 38, 44, 52],
  usersByRole: { admin: 12, manager: 84, user: 1188 },
  recentOrders: Array.from({ length: 8 }, (_, i) => ({
    id: `ORD-${1000 + i}`,
    customer: `Customer ${i + 1}`,
    amount: Math.round(50 + Math.random() * 950),
    status: i % 3 === 0 ? 'pending' : 'paid',
    date: new Date(Date.now() - i * 3600_000).toISOString(),
  })),
};

// Products
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  status: 'published' | 'draft' | 'archived';
  imageUrl: string;
  createdAt: string;
}

const PROD_CATEGORIES = ['Electronics', 'Apparel', 'Home', 'Books', 'Sports', 'Beauty'];
const PROD_NAMES = [
  'Wireless Headphones', 'Smart Watch Pro', 'Mechanical Keyboard', 'USB-C Hub',
  '4K Monitor', 'Ergonomic Chair', 'Standing Desk', 'Desk Lamp LED',
  'Running Shoes', 'Yoga Mat', 'Water Bottle', 'Backpack Pro',
  'Coffee Maker', 'Air Purifier', 'Smart Bulb', 'Wireless Charger',
  'Bluetooth Speaker', 'Fitness Tracker', 'VR Headset', 'Drone Mini',
];

export function seedProducts(count = 48): Product[] {
  return Array.from({ length: count }, (_, i) => ({
    id: crypto.randomUUID(),
    name: pick(PROD_NAMES, i) + ' ' + (i + 1),
    sku: 'SKU-' + String(10000 + i),
    category: pick(PROD_CATEGORIES, i * 3),
    price: Math.round((19 + Math.random() * 480) * 100) / 100,
    stock: Math.floor(Math.random() * 200),
    rating: Math.round((3 + Math.random() * 2) * 10) / 10,
    status: (['published', 'published', 'published', 'draft', 'archived'] as const)[i % 5],
    imageUrl: `https://picsum.photos/seed/prod${i}/400/300`,
    createdAt: new Date(Date.now() - i * 2 * 86400000).toISOString(),
  }));
}

// Orders
export interface Order {
  id: string;
  customer: string;
  email: string;
  items: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'card' | 'paypal' | 'bank';
  createdAt: string;
}

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
const PAYMENTS = ['card', 'paypal', 'bank'] as const;

export function seedOrders(count = 64): Order[] {
  return Array.from({ length: count }, (_, i) => {
    const first = pick(FIRST, i * 2);
    const last = pick(LAST, i);
    return {
      id: 'ORD-' + String(10_000 + i),
      customer: `${first} ${last}`,
      email: `${first}.${last}`.toLowerCase() + '@example.com',
      items: 1 + Math.floor(Math.random() * 6),
      total: Math.round((29 + Math.random() * 1200) * 100) / 100,
      status: pick(ORDER_STATUSES, i * 7 + 1),
      paymentMethod: pick(PAYMENTS, i * 3),
      createdAt: new Date(Date.now() - i * 3600_000 * 5).toISOString(),
    };
  });
}

// Analytics
export const SEED_ANALYTICS = {
  visitorsByDay: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
    visitors: 400 + Math.round(Math.random() * 800),
    pageviews: 1200 + Math.round(Math.random() * 2400),
  })),
  trafficSources: {
    Organic: 42,
    Direct: 28,
    Social: 16,
    Referral: 9,
    Email: 5,
  },
  devices: { Desktop: 58, Mobile: 35, Tablet: 7 },
  topCountries: [
    { country: 'United States', code: 'US', visitors: 4820, pct: 38 },
    { country: 'Germany', code: 'DE', visitors: 2140, pct: 17 },
    { country: 'Romania', code: 'RO', visitors: 1680, pct: 13 },
    { country: 'France', code: 'FR', visitors: 1240, pct: 10 },
    { country: 'United Kingdom', code: 'GB', visitors: 980, pct: 8 },
    { country: 'Spain', code: 'ES', visitors: 720, pct: 6 },
  ],
  salesByCategory: [
    { category: 'Electronics', sales: 48_200 },
    { category: 'Apparel', sales: 32_100 },
    { category: 'Home', sales: 24_800 },
    { category: 'Sports', sales: 18_400 },
    { category: 'Beauty', sales: 14_200 },
    { category: 'Books', sales: 8_900 },
  ],
};

