import type { BoardState } from "@/types/board";

export const STORAGE_KEY = "task-board-state-v1";

export const INITIAL_BOARD_STATE: BoardState = {
  board: {
    id: "b1",
    title: "Demo Board",
    color: "#2E7EAF",
    listIds: ["b1l1", "b1l2", "b1l3"],
  },
  lists: {
    b1l1: {
      id: "b1l1",
      title: "Todo",
      cardIds: ["b1l1c1", "b1l1c2"],
    },
    b1l2: {
      id: "b1l2",
      title: "In Progress",
      cardIds: ["b1l2c1"],
    },
    b1l3: {
      id: "b1l3",
      title: "Done",
      cardIds: [],
    },
  },
  cards: {
    b1l1c1: {
      id: "b1l1c1",
      title: "Create interview Kanban",
      description: "",
      comments: [],
    },
    b1l1c2: {
      id: "b1l1c2",
      title: "Review Drag & Drop",
      description: "",
      comments: [],
    },
    b1l2c1: {
      id: "b1l2c1",
      title: "Set up Next.js project",
      description: "",
      comments: [],
    },
  },
};

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

export const isBoardState = (value: unknown): value is BoardState => {
  if (!isObject(value)) {
    return false;
  }

  if (
    !isObject(value.board) ||
    !isObject(value.lists) ||
    !isObject(value.cards)
  ) {
    return false;
  }

  const board = value.board;

  return (
    typeof board.id === "string" &&
    typeof board.title === "string" &&
    typeof board.color === "string" &&
    Array.isArray(board.listIds)
  );
};
