import { Routes } from '@angular/router';
import { DeckListComponent } from './pages/deck-list/deck-list.component';
import { DeckDetailComponent } from './pages/deck-detail/deck-detail.component';

export const routes: Routes = [
  { path: '', component: DeckListComponent },
  { path: 'decks/:id', component: DeckDetailComponent },
  { path: '**', redirectTo: '' },
];
