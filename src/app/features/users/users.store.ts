import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { TableQuery, User } from '../../core/models';
import { UsersApi } from './users.api';

interface UsersState {
  items: User[];
  total: number;
  loading: boolean;
  saving: boolean;
  query: TableQuery;
  error: string | null;
}

const initial: UsersState = {
  items: [],
  total: 0,
  loading: false,
  saving: false,
  query: { page: 0, pageSize: 10, sortBy: 'createdAt', sortDir: 'desc', search: '' },
  error: null,
};

export const UsersStore = signalStore(
  withState(initial),
  withComputed((s) => ({
    hasItems: computed(() => s.items().length > 0),
    pageCount: computed(() => Math.ceil(s.total() / s.query().pageSize)),
  })),
  withMethods((store, api = inject(UsersApi)) => ({
    setQuery(patch: Partial<TableQuery>): void {
      patchState(store, (state) => ({ query: { ...state.query, ...patch } }));
    },
    load: rxMethod<TableQuery>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((query) =>
          api.list(query).pipe(
            tap({
              next: (res) =>
                patchState(store, {
                  items: res.items,
                  total: res.total,
                  loading: false,
                }),
              error: (err: Error) =>
                patchState(store, { loading: false, error: err.message }),
            }),
          ),
        ),
      ),
    ),
    refresh(): void {
      this.load(store.query());
    },
    create(payload: Partial<User>): void {
      patchState(store, { saving: true });
      api.create(payload).subscribe({
        next: () => {
          patchState(store, { saving: false });
          this.refresh();
        },
        error: () => patchState(store, { saving: false }),
      });
    },
    update(id: string, payload: Partial<User>): void {
      // Snapshot only the target item so concurrent updates on different
      // rows don't stomp on each other's rollback state.
      const original = store.items().find((u) => u.id === id);
      if (!original) return;
      patchState(store, {
        items: store.items().map((u) => (u.id === id ? { ...u, ...payload } : u)),
        saving: true,
      });
      api.update(id, payload).subscribe({
        next: (saved) => {
          patchState(store, {
            items: store.items().map((u) => (u.id === id ? saved : u)),
            saving: false,
          });
        },
        error: () => {
          // Restore only the affected row; any other in-flight optimistic
          // updates on different rows remain intact.
          patchState(store, {
            items: store.items().map((u) => (u.id === id ? original : u)),
            saving: false,
          });
        },
      });
    },
    remove(id: string): void {
      const original = store.items().find((u) => u.id === id);
      if (!original) return;
      const total = store.total();
      patchState(store, {
        items: store.items().filter((u) => u.id !== id),
        total: Math.max(0, total - 1),
      });
      api.remove(id).subscribe({
        error: () =>
          patchState(store, {
            // Re-insert the single removed row; leaves other concurrent
            // mutations on other rows untouched.
            items: [original, ...store.items()],
            total: total,
          }),
      });
    },
  })),
);
