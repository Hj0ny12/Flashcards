export interface DeckListItem {
  id: number;
  name: string;
}

export interface DeckWithCount extends DeckListItem {
  cardCount: number;
}

export interface Card {
  id: number;
  targetWord: string;
  sentence: string | null;
  translation: string | null;
  definitions: string | null;
}

export interface DeckDetail {
  id: number;
  name: string;
  cards: Card[];
}
