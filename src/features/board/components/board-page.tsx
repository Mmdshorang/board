"use client";

import {
  closestCorners,
  DndContext,
  type DragCancelEvent,
  type DragEndEvent,
  type DragOverEvent,
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

const getPreviewGapIndex = (cardIds: string[], overCardId?: string) => {
  if (!overCardId) {
    return cardIds.length;
  }

  const index = cardIds.indexOf(overCardId);
  return index === -1 ? cardIds.length : index;
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
  const [cardDragPreview, setCardDragPreview] = useState<{
    toListId: string;
    overCardId?: string;
  } | null>(null);
  const activeCardSourceListIdRef = useRef<string | null>(null);

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
      setActiveDragCardId(String(active.id));
      const sourceListId = String(active.data.current?.listId ?? "");
      activeCardSourceListIdRef.current = sourceListId || null;
      return;
    }

    setActiveDragCardId(null);
    setCardDragPreview(null);
    activeCardSourceListIdRef.current = null;
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!activeDragCardId || String(active.id) !== activeDragCardId) {
      return;
    }

    const target = getCardDropTarget(over);
    setCardDragPreview((previous) => {
      if (!target) {
        return previous ? null : previous;
      }
      if (
        previous?.toListId === target.toListId &&
        previous.overCardId === target.overCardId
      ) {
        return previous;
      }
      return target;
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) {
      setActiveDragCardId(null);
      setCardDragPreview(null);
      activeCardSourceListIdRef.current = null;
      return;
    }

    const activeType = active.data.current?.type as string | undefined;
    const overType = over.data.current?.type as string | undefined;

    if (activeType === "list" && overType === "list") {
      if (active.id !== over.id) {
        reorderLists(String(active.id), String(over.id));
      }
      setActiveDragCardId(null);
      setCardDragPreview(null);
      activeCardSourceListIdRef.current = null;
      return;
    }

    const draggedCardId = activeDragCardId ?? String(active.id ?? "");
    if (!draggedCardId) {
      setActiveDragCardId(null);
      setCardDragPreview(null);
      activeCardSourceListIdRef.current = null;
      return;
    }

    const fromListId =
      activeCardSourceListIdRef.current ??
      String(active.data.current?.listId ?? "");
    if (!fromListId) {
      setActiveDragCardId(null);
      setCardDragPreview(null);
      activeCardSourceListIdRef.current = null;
      return;
    }

    const target = getCardDropTarget(over);
    if (!target || !target.toListId) {
      setActiveDragCardId(null);
      setCardDragPreview(null);
      activeCardSourceListIdRef.current = null;
      return;
    }

    moveCard(draggedCardId, fromListId, target.toListId, target.overCardId);
    setActiveDragCardId(null);
    setCardDragPreview(null);
    activeCardSourceListIdRef.current = null;
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    setActiveDragCardId(null);
    setCardDragPreview(null);
    activeCardSourceListIdRef.current = null;
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
            {lists.map((list) => {
              const sortableCardIds = activeDragCardId
                ? list.cardIds.filter((cardId) => cardId !== activeDragCardId)
                : list.cardIds;

              const previewGapIndex =
                cardDragPreview?.toListId === list.id
                  ? getPreviewGapIndex(
                      sortableCardIds,
                      cardDragPreview.overCardId,
                    )
                  : undefined;

              return (
                <ListColumn
                  cards={sortableCardIds
                    .map((cardId) => cardsById[cardId])
                    .filter(Boolean)}
                  key={list.id}
                  list={list}
                  onAddCard={addCard}
                  onOpenComments={setActiveCommentCardId}
                  onRemove={removeList}
                  onUpdateCardTitle={updateCardTitle}
                  onUpdateTitle={updateListTitle}
                  previewGapIndex={previewGapIndex}
                  sortableCardIds={sortableCardIds}
                />
              );
            })}
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
