import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';
import { CharacterCard } from '../../components/character-card/character-card';
import { Character } from '../../models/character';
import { CharacterService } from '../../services/character';

@Component({
  selector: 'app-character-list',
  imports: [CharacterCard, FormsModule],
  templateUrl: './character-list.html',
  styleUrl: './character-list.css',
})
export class CharacterList {
  private readonly characterService = inject(CharacterService);

  // Filters
  searchTerm = signal('');
  status = signal('');
  species = signal('');
  gender = signal('');
  page = signal(1);

  // Results
  characters = signal<Character[]>([]);
  totalCount = signal(0);
  totalPages = signal(0);
  isLoading = signal(false);
  errorMessage = signal('');

  private readonly query = computed(() => ({
    name: this.searchTerm().trim(),
    status: this.status(),
    species: this.species(),
    gender: this.gender(),
    page: this.page(),
  }));

  constructor() {
    toObservable(this.query) // emits a value whenever a filter or the page changes.
      .pipe(
        // wait 400 ms without any changes before making the request.
        debounceTime(400),
        // avoid making queries when they are identical.
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        // activate the loading state and clear errors before each request
        tap(() => {
          this.isLoading.set(true);
          this.errorMessage.set('');
        }),
        // A new request is made, if the search is changed while the previous one is still in progress, 
        // the latter is cancelled and priority is given to the new one.
        switchMap(({ page, ...filters }) =>
          this.characterService.getCharacters(filters, page).pipe(
            catchError(() => {
              this.errorMessage.set('No se pudieron cargar los personajes.');
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      // result of the request
      .subscribe((response) => {
        if (response) {
          this.characters.set(response.results);
          this.totalCount.set(response.info.count);
          this.totalPages.set(response.info.pages);
        } else {
          this.characters.set([]);
          this.totalCount.set(0);
          this.totalPages.set(0);
        }
        this.isLoading.set(false);
      });
  }

  // Update the filters and reset the pagination. 
  onSearch(value: string) { this.searchTerm.set(value); this.page.set(1); }
  onStatus(value: string) { this.status.set(value); this.page.set(1); }
  onSpecies(value: string) { this.species.set(value); this.page.set(1); }
  onGender(value: string) { this.gender.set(value); this.page.set(1); }

  prevPage() { this.goToPage(this.page() - 1); }
  nextPage() { this.goToPage(this.page() + 1); }

  // switch to the specified page, if it exists
  goToPage(target: number) {
    if (target < 1 || target > this.totalPages()) return;

    this.page.set(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // calculate which page numbers we will display
  pages = computed<(number | null)[]>(() => {
    const total = this.totalPages();
    const current = this.page();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const result: (number | null)[] = [1];

    // select the page preceding and the page following the current one.
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    // ff pages are missing between the first page and the visible pages, we display an ellipsis.
    if (start > 2) {
      result.push(null);
    }

    // add page numbers near the current page.
    for (let i = start; i <= end; i++) {
      result.push(i);
    }

    // if there are missing pages before the last one, we display more dots.
    if (end < total - 1) {
      result.push(null);
    }

    // always show the last page
    result.push(total);
    return result;
  });
}