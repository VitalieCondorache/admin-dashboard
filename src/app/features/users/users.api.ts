import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResult, TableQuery, User } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/users';

  list(query: TableQuery): Observable<PagedResult<User>> {
    let params = new HttpParams()
      .set('page', query.page)
      .set('pageSize', query.pageSize);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.sortDir) params = params.set('sortDir', query.sortDir);
    if (query.search) params = params.set('search', query.search);
    return this.http.get<PagedResult<User>>(this.base, { params });
  }

  get(id: string): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`);
  }

  create(payload: Partial<User>): Observable<User> {
    return this.http.post<User>(this.base, payload);
  }

  update(id: string, payload: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
