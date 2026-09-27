import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UsersApi } from './users.api';
import { UsersStore } from './users.store';
import { User } from '../../core/models';

function user(id: string, over: Partial<User> = {}): User {
  return {
    id,
    email: `${id}@x.com`,
    name: `User ${id}`,
    role: 'user',
    status: 'active',
    createdAt: '2024-01-01',
    ...over,
  };
}

describe('UsersStore', () => {
  let store: InstanceType<typeof UsersStore>;
  let api: {
    list: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    api = {
      list: vi.fn().mockReturnValue(of({ items: [user('1')], total: 1, page: 0, pageSize: 10 })),
      create: vi.fn().mockReturnValue(of(user('new'))),
      update: vi.fn().mockReturnValue(of(user('1', { name: 'Updated' }))),
      remove: vi.fn().mockReturnValue(of(void 0)),
    };
    TestBed.configureTestingModule({
      providers: [UsersStore, { provide: UsersApi, useValue: api }],
    });
    store = TestBed.inject(UsersStore);
  });

  it('has sane initial state', () => {
    expect(store.items()).toEqual([]);
    expect(store.total()).toBe(0);
    expect(store.loading()).toBe(false);
    expect(store.hasItems()).toBe(false);
  });

  it('setQuery() patches the query', () => {
    store.setQuery({ page: 3, search: 'foo' });
    expect(store.query().page).toBe(3);
    expect(store.query().search).toBe('foo');
    expect(store.query().pageSize).toBe(10);
  });

  it('load() sets items and total from the API', () => {
    store.load(store.query());
    expect(api.list).toHaveBeenCalled();
    expect(store.items().length).toBe(1);
    expect(store.total()).toBe(1);
    expect(store.loading()).toBe(false);
    expect(store.hasItems()).toBe(true);
  });

  it('update() performs optimistic patch', () => {
    store.load(store.query());
    store.update('1', { name: 'Optimistic' });
    expect(store.items()[0].name).toBe('Updated');
    expect(api.update).toHaveBeenCalledWith('1', { name: 'Optimistic' });
  });

  it('update() rolls back on error', () => {
    store.load(store.query());
    const snapshot = store.items();
    api.update.mockReturnValueOnce(throwError(() => new Error('x')));
    store.update('1', { name: 'Failed' });
    expect(store.items()).toEqual(snapshot);
  });

  it('remove() removes item optimistically and decrements total', () => {
    store.load(store.query());
    store.remove('1');
    expect(store.items().length).toBe(0);
    expect(store.total()).toBe(0);
    expect(api.remove).toHaveBeenCalledWith('1');
  });

  it('pageCount computed reflects total/pageSize', () => {
    store.load(store.query());
    store.setQuery({ pageSize: 5 });
    // items total = 1, pageSize = 5 -> ceil(1/5) = 1
    expect(store.pageCount()).toBe(1);
  });

  it('create() calls api.create and refreshes', () => {
    store.create({ name: 'New' });
    expect(api.create).toHaveBeenCalledWith({ name: 'New' });
    expect(api.list).toHaveBeenCalled();
    expect(store.saving()).toBe(false);
  });

  it('create() resets saving flag on error', () => {
    api.create.mockReturnValueOnce(throwError(() => new Error('x')));
    store.create({ name: 'x' });
    expect(store.saving()).toBe(false);
  });

  it('remove() rolls back on api error', () => {
    store.load(store.query());
    const prev = store.items();
    const total = store.total();
    api.remove.mockReturnValueOnce(throwError(() => new Error('x')));
    store.remove('1');
    expect(store.items()).toEqual(prev);
    expect(store.total()).toBe(total);
  });
});
