import { Component, input } from '@angular/core';
import { Character } from '../../models/character';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-character-card',
  imports: [RouterLink],
  templateUrl: './character-card.html',
  styleUrl: './character-card.css',
})
export class CharacterCard {
  character = input.required<Character>();
}
