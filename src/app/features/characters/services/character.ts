import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import { CharacterFilters, CharacterResponse } from '../models/character';

const EMPTY_RESPONSE: CharacterResponse = {
  info: { count: 0, pages: 0, next: null, prev: null },
  results: [],
};

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://rickandmortyapi.com/api/character';

  getCharacters(filters: CharacterFilters = {}, page: number = 1): Observable<CharacterResponse> {
    let params = new HttpParams().set('page', page);

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    }

    // make a GET request to retrieve characters and handle errors
    return this.http.get<CharacterResponse>(this.apiUrl, { params }).pipe(
      catchError((err: HttpErrorResponse) =>
        err.status === 404 ? of(EMPTY_RESPONSE) : throwError(() => err),
      ),
    );
  }
}
