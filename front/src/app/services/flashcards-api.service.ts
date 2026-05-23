import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import {
  Card,
  DeckDetail,
  DeckListItem,
  DeckWithCount,
} from '../models/flashcard.models';

@Injectable({ providedIn: 'root' })
export class FlashcardsApiService {
  private readonly baseUrl = '/api';

  constructor(private readonly http: HttpClient) {}

  getDecks(): Observable<DeckListItem[]> {
    return this.http.get<DeckListItem[]>(`${this.baseUrl}/decks`);
  }

  getCardCount(deckId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/decks/${deckId}/count`);
  }

  getDecksWithCounts(): Observable<DeckWithCount[]> {
    return this.getDecks().pipe(
      switchMap((decks) => {
        if (decks.length === 0) {
          return of([]);
        }

        return forkJoin(
          decks.map((deck) =>
            this.getCardCount(deck.id).pipe(
              map((cardCount) => ({ ...deck, cardCount })),
            ),
          ),
        );
      }),
    );
  }

  getDeck(id: number): Observable<DeckDetail> {
    return this.http.get<DeckDetail>(`${this.baseUrl}/decks/${id}`);
  }

  getCardFromDeck(deck: DeckDetail, cardId: number): Card | undefined {
    return deck.cards.find((c) => c.id === cardId);
  }
}
