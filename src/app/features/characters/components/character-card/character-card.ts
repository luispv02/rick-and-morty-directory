import { Component, input } from '@angular/core';
import { Character } from '../../models/character';

@Component({
  selector: 'app-character-card',
  imports: [],
  templateUrl: './character-card.html',
  styleUrl: './character-card.css',
})
export class CharacterCard {
  character = input.required<Character>();
}
