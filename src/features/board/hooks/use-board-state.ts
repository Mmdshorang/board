"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { boardReducer } from "@/features/board/state/board-reducer";
import {
  INITIAL_BOARD_STATE,
  isBoardState,
  STORAGE_KEY,
} from "@/features/board/state/initial-state";
import { createId } from "@/features/board/utils/id";
import type { BoardCard, BoardList, BoardState } from "@/types/board";

export interface UseBoardStateResult {
  board: BoardState["board"];
  lists: BoardList[];
  cardsById: Record<string, BoardCard>;
  isHydrated: boolean;
  updateBoardTitle: (title: string) => void;
  addList: (title: string) => void;
  removeList: (listId: string) => void;
  updateListTitle: (listId: string, title: string) => void;
  addCard: (listId: string, title: string) => void;
  updateCardTitle: (cardId: string, title: string) => void;
  reorderLists: (activeListId: string, overListId: string) => void;
  moveCard: (
    cardId: string,
    fromListId: string,
    toListId: string,
    overCardId?: string,
  ) => void;
  addComment: (cardId: string, message: string, author?: string) => void;
}

const parsePersistedState = (): BoardState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    return isBoardState(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const useBoardState = (): UseBoardStateResult => {
  const [state, dispatch] = useReducer(boardReducer, INITIAL_BOARD_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const persisted = parsePersistedState();
    if (persisted) {
      dispatch({ type: "hydrate", payload: persisted });
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [isHydrated, state]);

  const lists = useMemo(() => {
    return state.board.listIds
      .map((listId) => state.lists[listId])
      .filter(Boolean);
  }, [state.board.listIds, state.lists]);

  const updateBoardTitle = useCallback((title: string) => {
    dispatch({ type: "update-board-title", payload: { title } });
  }, []);

  const addList = useCallback((title: string) => {
    dispatch({
      type: "add-list",
      payload: {
        listId: createId("list"),
        title,
      },
    });
  }, []);

  const removeList = useCallback((listId: string) => {
    dispatch({ type: "remove-list", payload: { listId } });
  }, []);

  const updateListTitle = useCallback((listId: string, title: string) => {
    dispatch({ type: "update-list-title", payload: { listId, title } });
  }, []);

  const addCard = useCallback((listId: string, title: string) => {
    dispatch({
      type: "add-card",
      payload: {
        listId,
        cardId: createId("card"),
        title,
      },
    });
  }, []);

  const updateCardTitle = useCallback((cardId: string, title: string) => {
    dispatch({ type: "update-card-title", payload: { cardId, title } });
  }, []);

  const reorderLists = useCallback(
    (activeListId: string, overListId: string) => {
      dispatch({
        type: "reorder-lists",
        payload: { activeListId, overListId },
      });
    },
    [],
  );

  const moveCard = useCallback(
    (
      cardId: string,
      fromListId: string,
      toListId: string,
      overCardId?: string,
    ) => {
      dispatch({
        type: "move-card",
        payload: { cardId, fromListId, toListId, overCardId },
      });
    },
    [],
  );

  const addComment = useCallback(
    (cardId: string, message: string, author = "You") => {
      dispatch({
        type: "add-comment",
        payload: {
          cardId,
          comment: {
            id: createId("comment"),
            message,
            author,
            createdAt: new Date().toISOString(),
          },
        },
      });
    },
    [],
  );

  return {
    board: state.board,
    lists,
    cardsById: state.cards,
    isHydrated,
    updateBoardTitle,
    addList,
    removeList,
    updateListTitle,
    addCard,
    updateCardTitle,
    reorderLists,
    moveCard,
    addComment,
  };
};
