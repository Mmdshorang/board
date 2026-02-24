"use client";

import {
  closestCorners,
  DndContext,
  type DragCancelEvent,
  type DragEndEvent,
  DragOverlay,
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

const getCardDropTarget = (over: DragEndEvent["over"]) => {
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
  const [activeDragCardId, setActiveDragCardId] = useState<string | null>(null);
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

  const activeDragCard = useMemo(() => {
    if (!activeDragCardId) {
      return null;
    }
    return cardsById[activeDragCardId] ?? null;
  }, [activeDragCardId, cardsById]);

  const handleDragStart = ({ active }: DragStartEvent) => {
    const activeType = active.data.current?.type as string | undefined;

    if (activeType === "card") {
      const listId = String(active.data.current?.listId ?? "");
      activeCardListIdRef.current = listId || null;
      setActiveDragCardId(String(active.id));
      return;
    }

    setActiveDragCardId(null);
    activeCardListIdRef.current = null;
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) {
      setActiveDragCardId(null);
      activeCardListIdRef.current = null;
      return;
    }

    const activeType = active.data.current?.type as string | undefined;
    const overType = over.data.current?.type as string | undefined;

    if (activeType === "list" && overType === "list") {
      if (active.id !== over.id) {
        reorderLists(String(active.id), String(over.id));
      }
      setActiveDragCardId(null);
      activeCardListIdRef.current = null;
      return;
    }

    if (activeType !== "card") {
      setActiveDragCardId(null);
      activeCardListIdRef.current = null;
      return;
    }

    const cardId = String(active.id);
    const fromListId =
      activeCardListIdRef.current ?? String(active.data.current?.listId ?? "");
    if (!fromListId) {
      setActiveDragCardId(null);
      activeCardListIdRef.current = null;
      return;
    }

    const target = getCardDropTarget(over);
    if (!target || !target.toListId) {
      setActiveDragCardId(null);
      activeCardListIdRef.current = null;
      return;
    }

    moveCard(cardId, fromListId, target.toListId, target.overCardId);
    setActiveDragCardId(null);
    activeCardListIdRef.current = null;
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    setActiveDragCardId(null);
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
        <DragOverlay>
          {activeDragCard ? (
            <article className={styles.cardOverlay}>
              <p className={styles.cardOverlayTitle}>{activeDragCard.title}</p>
              <p className={styles.cardOverlayMeta}>
                Comments ({activeDragCard.comments.length})
              </p>
            </article>
          ) : null}
        </DragOverlay>
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
