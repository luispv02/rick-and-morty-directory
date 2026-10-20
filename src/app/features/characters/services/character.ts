import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { Character, CharacterFilters, CharacterResponse, Episode } from '../models/character';

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
  private readonly baseUrl = 'https://rickandmortyapi.com/api';

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

  // get character by id
  getCharacterById(id: number | string): Observable<Character> {
    return this.http.get<Character>(`${this.apiUrl}/${id}`);
  }

  // receives an array of episode urls and returns the complete information
  getEpisodes(urls: string[]): Observable<Episode[]> {
    if (!urls.length) return of([]);

    const ids = urls.map((url) => url.split('/').pop()).join(',');

    return this.http.get<Episode | Episode[]>(`${this.baseUrl}/episode/${ids}`).pipe(
      map((res) => (Array.isArray(res) ? res : [res])),
      catchError(() => of([] as Episode[])),
    );
  }
}
