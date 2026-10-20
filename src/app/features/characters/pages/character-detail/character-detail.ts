import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Character, Episode } from '../../models/character';
import { CharacterService } from '../../services/character';
import { map, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-character-detail',
  imports: [RouterLink],
  templateUrl: './character-detail.html',
  styleUrl: './character-detail.css',
})
export class CharacterDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly characterService = inject(CharacterService);

  character = signal<Character | null>(null);
  episodes = signal<Episode[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  // traducciones de la api a español
  private readonly statusLabels: Record<string, string> = {
    Alive: 'Vivo',
    Dead: 'Muerto',
    unknown: 'Desconocido',
  };

  private readonly genderLabels: Record<string, string> = {
    Male: 'Masculino',
    Female: 'Femenino',
    Genderless: 'Sin género',
    unknown: 'Desconocido',
  };

  private readonly speciesLabels: Record<string, string> = {
    Human: 'Humano',
    Alien: 'Alienígena',
  };

  constructor() {
    // read the id from the URL
    const id = this.route.snapshot.paramMap.get('id')!;

    this.characterService
      .getCharacterById(id) // Obtener el personaje
      .pipe(
        // Al obtener los personajes, pedir los episodios
        switchMap((character) =>
          this.characterService
            .getEpisodes(character.episode)
            .pipe(map((episodes) => ({ character, episodes }))) // Personajes y episodios en un solo objeto
        ),
        takeUntilDestroyed(), // Limpiar petición al salir de la pantalla
      )
      .subscribe({
        // Si todo sale bien, guardamos datos
        next: ({ character, episodes }) => {
          this.character.set(character);
          this.episodes.set(episodes);
          this.isLoading.set(false);
        },
        // Si algo falló, muestra el error
        error: (err: HttpErrorResponse) => {
          this.errorMessage.set(err.status === 404
            ? 'No encontramos este personaje.'
            : 'No se pudo cargar el personaje.',
          );
          this.isLoading.set(false);
        },
      });
  }

  // Mostrar datos del personaje en español, si no hay, deja el original 
  statusLabel(value: string) {
    return this.statusLabels[value] ?? value;
  }

  genderLabel(value: string) {
    return this.genderLabels[value] ?? value;
  }

  speciesLabel(value: string) {
    return this.speciesLabels[value] ?? value;
  }

  placeLabel(name: string) {
    return name === 'unknown' ? 'Desconocido' : name;
  }

  // Color del punto del estado
  statusDotClass(value: string) {
    switch (value) {
      case 'Alive':
        return 'bg-green-500';
      case 'Dead':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }

  // Formatear fecha: "December 2, 2013" → "2 de diciembre de 2013"
  formatDate(date: string) {
    const parsed = new Date(date);
    return isNaN(parsed.getTime())
      ? date
      : parsed.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
