import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FlashcardsApiService } from '../../services/flashcards-api.service';
import { DeckWithCount } from '../../models/flashcard.models';

@Component({
  selector: 'app-deck-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './deck-list.component.html',
  styleUrl: './deck-list.component.css',
})
export class DeckListComponent implements OnInit {
  readonly decks = signal<DeckWithCount[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor(private readonly api: FlashcardsApiService) {}

  ngOnInit(): void {
    this.api.getDecksWithCounts().subscribe({
      next: (decks) => {
        this.decks.set(decks);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load decks. Is the API running?');
        this.loading.set(false);
      },
    });
  }
}
