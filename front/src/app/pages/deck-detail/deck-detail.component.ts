import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FlashcardsApiService } from '../../services/flashcards-api.service';
import { Card, DeckDetail } from '../../models/flashcard.models';

@Component({
  selector: 'app-deck-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './deck-detail.component.html',
  styleUrl: './deck-detail.component.css',
})
export class DeckDetailComponent implements OnInit {
  readonly deck = signal<DeckDetail | null>(null);
  readonly selectedCardId = signal<number | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly selectedCard = computed(() => {
    const deck = this.deck();
    const cardId = this.selectedCardId();
    if (!deck || cardId === null) {
      return null;
    }
    return deck.cards.find((c) => c.id === cardId) ?? null;
  });

  private deckId = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: FlashcardsApiService,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.deckId = Number(idParam);

    if (!idParam || Number.isNaN(this.deckId)) {
      this.error.set('Invalid deck.');
      this.loading.set(false);
      return;
    }

    this.api.getDeck(this.deckId).subscribe({
      next: (deck) => {
        this.deck.set(deck);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load this deck.');
        this.loading.set(false);
      },
    });
  }

  selectCard(card: Card): void {
    this.selectedCardId.set(card.id);
  }
}
