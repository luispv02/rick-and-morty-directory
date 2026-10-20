import { Routes } from '@angular/router';
import { CharacterList } from './features/characters/pages/character-list/character-list';
import { CharacterDetail } from './features/characters/pages/character-detail/character-detail';

export const routes: Routes = [
  {
    path: '',
    component: CharacterList,
  },
  {
    path: 'character/:id',
    component: CharacterDetail
  },
  {
    path: '**',
    redirectTo: ''
  },
];
