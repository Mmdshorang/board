import { arrayMove } from "@dnd-kit/sortable";

import type { BoardState, CardComment } from "@/types/board";

export type BoardAction =
  | { type: "hydrate"; payload: BoardState }
  | { type: "update-board-title"; payload: { title: string } }
  | { type: "add-list"; payload: { listId: string; title: string } }
  | { type: "remove-list"; payload: { listId: string } }
  | {
      type: "update-list-title";
      payload: { listId: string; title: string };
    }
  | {
      type: "add-card";
      payload: { listId: string; cardId: string; title: string };
    }
  | {
      type: "update-card-title";
      payload: { cardId: string; title: string };
    }
  | {
      type: "reorder-lists";
      payload: { activeListId: string; overListId: string };
    }
  | {
      type: "move-card";
      payload: {
        cardId: string;
        fromListId: string;
        toListId: string;
        overCardId?: string;
      };
    }
  | {
      type: "add-comment";
      payload: { cardId: string; comment: CardComment };
    };

const getInsertIndex = (cardIds: string[], overCardId?: string): number => {
  if (!overCardId) {
    return cardIds.length;
  }

  const index = cardIds.indexOf(overCardId);
  return index === -1 ? cardIds.length : index;
};

export const boardReducer = (
  state: BoardState,
  action: BoardAction,
): BoardState => {
  switch (action.type) {
    case "hydrate":
      return action.payload;

    case "update-board-title":
      return {
        ...state,
        board: {
          ...state.board,
          title: action.payload.title,
        },
      };

    case "add-list": {
      const { listId, title } = action.payload;

      return {
        ...state,
        board: {
          ...state.board,
          listIds: [...state.board.listIds, listId],
        },
        lists: {
          ...state.lists,
          [listId]: {
            id: listId,
            title,
            cardIds: [],
          },
        },
      };
    }

    case "remove-list": {
      const { listId } = action.payload;
      const list = state.lists[listId];
      if (!list) {
        return state;
      }

      const lists = { ...state.lists };
      const cards = { ...state.cards };
      delete lists[listId];
      for (const cardId of list.cardIds) {
        delete cards[cardId];
      }

      return {
        ...state,
        board: {
          ...state.board,
          listIds: state.board.listIds.filter((id) => id !== listId),
        },
        lists,
        cards,
      };
    }

    case "update-list-title": {
      const { listId, title } = action.payload;
      const list = state.lists[listId];
      if (!list) {
        return state;
      }

      return {
        ...state,
        lists: {
          ...state.lists,
          [listId]: {
            ...list,
            title,
          },
        },
      };
    }

    case "add-card": {
      const { listId, cardId, title } = action.payload;
      const list = state.lists[listId];
      if (!list) {
        return state;
      }

      return {
        ...state,
        lists: {
          ...state.lists,
          [listId]: {
            ...list,
            cardIds: [...list.cardIds, cardId],
          },
        },
        cards: {
          ...state.cards,
          [cardId]: {
            id: cardId,
            title,
            description: "",
            comments: [],
          },
        },
      };
    }

    case "update-card-title": {
      const { cardId, title } = action.payload;
      const card = state.cards[cardId];
      if (!card) {
        return state;
      }

      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            title,
          },
        },
      };
    }

    case "reorder-lists": {
      const { activeListId, overListId } = action.payload;
      if (activeListId === overListId) {
        return state;
      }

      const oldIndex = state.board.listIds.indexOf(activeListId);
      const newIndex = state.board.listIds.indexOf(overListId);
      if (oldIndex === -1 || newIndex === -1) {
        return state;
      }

      return {
        ...state,
        board: {
          ...state.board,
          listIds: arrayMove(state.board.listIds, oldIndex, newIndex),
        },
      };
    }

    case "move-card": {
      const { cardId, fromListId, toListId, overCardId } = action.payload;
      const fromList = state.lists[fromListId];
      const toList = state.lists[toListId];
      if (!fromList || !toList) {
        return state;
      }

      const sourceIndex = fromList.cardIds.indexOf(cardId);
      if (sourceIndex === -1) {
        return state;
      }

      if (fromListId === toListId) {
        const destinationIndex = getInsertIndex(fromList.cardIds, overCardId);
        if (sourceIndex === destinationIndex) {
          return state;
        }

        if (
          destinationIndex === fromList.cardIds.length &&
          sourceIndex === fromList.cardIds.length - 1
        ) {
          return state;
        }

        const reordered = arrayMove(
          fromList.cardIds,
          sourceIndex,
          destinationIndex,
        );

        return {
          ...state,
          lists: {
            ...state.lists,
            [fromListId]: {
              ...fromList,
              cardIds: reordered,
            },
          },
        };
      }

      const sourceCards = [...fromList.cardIds];
      sourceCards.splice(sourceIndex, 1);

      const destinationCards = [...toList.cardIds];
      const destinationIndex = getInsertIndex(destinationCards, overCardId);
      destinationCards.splice(destinationIndex, 0, cardId);

      return {
        ...state,
        lists: {
          ...state.lists,
          [fromListId]: {
            ...fromList,
            cardIds: sourceCards,
          },
          [toListId]: {
            ...toList,
            cardIds: destinationCards,
          },
        },
      };
    }

    case "add-comment": {
      const { cardId, comment } = action.payload;
      const card = state.cards[cardId];
      if (!card) {
        return state;
      }

      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            comments: [comment, ...card.comments],
          },
        },
      };
    }

    default:
      return state;
  }
};
