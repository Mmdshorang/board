"use client";

import {
  closestCorners,
  DndContext,
  type DragCancelEvent,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { useMemo, useRef, useState } from "react";

import { useBoardState } from "@/features/board/hooks/use-board-state";

import { BoardHeader } from "./board-header";
import styles from "./board-page.module.scss";
import { CommentsModal } from "./comments-modal";
import { CreateListForm } from "./create-list-form";
import { ListColumn } from "./list-column";

const getCardDropTarget = (
  over: DragOverEvent["over"] | DragEndEvent["over"],
) => {
  if (!over) {
    return null;
  }

  const overType = over.data.current?.type as string | undefined;

  if (overType === "card") {
    const toListId = String(over.data.current?.listId ?? "");
    if (!toListId) {
      return null;
    }

    return {
      toListId,
      overCardId: String(over.id),
    };
  }

  if (overType === "dropzone") {
    const toListId = String(over.data.current?.listId ?? "");
    if (!toListId) {
      return null;
    }

    return {
      toListId,
    };
  }

  if (overType === "list") {
    return {
      toListId: String(over.id),
    };
  }

  return null;
};

export const BoardPage = () => {
  const {
    board,
    lists,
    cardsById,
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
  } = useBoardState();

  const [activeCommentCardId, setActiveCommentCardId] = useState<string | null>(
    null,
  );
  const activeCardListIdRef = useRef<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  const activeCommentCard = useMemo(() => {
    if (!activeCommentCardId) {
      return null;
    }
    return cardsById[activeCommentCardId] ?? null;
  }, [activeCommentCardId, cardsById]);

  const handleDragStart = ({ active }: DragStartEvent) => {
    const activeType = active.data.current?.type as string | undefined;

    if (activeType === "card") {
      const listId = String(active.data.current?.listId ?? "");
      activeCardListIdRef.current = listId || null;
      return;
    }

    activeCardListIdRef.current = null;
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) {
      return;
    }

    const activeType = active.data.current?.type as string | undefined;
    if (activeType !== "card") {
      return;
    }

    const cardId = String(active.id);
    const fromListId =
      activeCardListIdRef.current ?? String(active.data.current?.listId ?? "");
    if (!fromListId) {
      return;
    }

    const target = getCardDropTarget(over);
    if (!target || !target.toListId) {
      return;
    }

    if (target.toListId === fromListId) {
      return;
    }

    moveCard(cardId, fromListId, target.toListId, target.overCardId);
    activeCardListIdRef.current = target.toListId;
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) {
      activeCardListIdRef.current = null;
      return;
    }

    const activeType = active.data.current?.type as string | undefined;
    const overType = over.data.current?.type as string | undefined;

    if (activeType === "list" && overType === "list") {
      if (active.id !== over.id) {
        reorderLists(String(active.id), String(over.id));
      }
      activeCardListIdRef.current = null;
      return;
    }

    if (activeType !== "card") {
      activeCardListIdRef.current = null;
      return;
    }

    const cardId = String(active.id);
    const fromListId =
      activeCardListIdRef.current ?? String(active.data.current?.listId ?? "");
    if (!fromListId) {
      activeCardListIdRef.current = null;
      return;
    }

    const target = getCardDropTarget(over);
    if (!target || !target.toListId) {
      activeCardListIdRef.current = null;
      return;
    }

    moveCard(cardId, fromListId, target.toListId, target.overCardId);
    activeCardListIdRef.current = null;
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    activeCardListIdRef.current = null;
  };

  if (!isHydrated) {
    return <div className={styles.loading}>Loading board...</div>;
  }

  return (
    <main className={styles.board} style={{ backgroundColor: board.color }}>
      <BoardHeader onUpdateTitle={updateBoardTitle} title={board.title} />

      <DndContext
        collisionDetection={closestCorners}
        onDragCancel={handleDragCancel}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={board.listIds}
          strategy={horizontalListSortingStrategy}
        >
          <section className={styles.listsLane}>
            {lists.map((list) => (
              <ListColumn
                cards={list.cardIds
                  .map((cardId) => cardsById[cardId])
                  .filter(Boolean)}
                key={list.id}
                list={list}
                onAddCard={addCard}
                onOpenComments={setActiveCommentCardId}
                onRemove={removeList}
                onUpdateCardTitle={updateCardTitle}
                onUpdateTitle={updateListTitle}
              />
            ))}
            <div className={styles.addList}>
              <CreateListForm onCreate={addList} />
            </div>
          </section>
        </SortableContext>
      </DndContext>

      <CommentsModal
        card={activeCommentCard}
        onAddComment={(message) => {
          if (!activeCommentCardId) {
            return;
          }
          addComment(activeCommentCardId, message);
        }}
        onClose={() => setActiveCommentCardId(null)}
      />
    </main>
  );
};
