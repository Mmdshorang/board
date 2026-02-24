export interface CardComment {
  id: string;
  message: string;
  author: string;
  createdAt: string;
}

export interface BoardCard {
  id: string;
  title: string;
  description: string;
  comments: CardComment[];
}

export interface BoardList {
  id: string;
  title: string;
  cardIds: string[];
}

export interface Board {
  id: string;
  title: string;
  color: string;
  listIds: string[];
}

export interface BoardState {
  board: Board;
  lists: Record<string, BoardList>;
  cards: Record<string, BoardCard>;
}
