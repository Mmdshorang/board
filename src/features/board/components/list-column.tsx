"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { BoardCard, BoardList } from "@/types/board";

import { CardItem } from "./card-item";
import { CreateCardForm } from "./create-card-form";
import { InlineEditableText } from "./inline-editable-text";
import styles from "./list-column.module.scss";

interface ListColumnProps {
  list: BoardList;
  cards: BoardCard[];
  onRemove: (listId: string) => void;
  onUpdateTitle: (listId: string, title: string) => void;
  onAddCard: (listId: string, title: string) => void;
  onUpdateCardTitle: (cardId: string, title: string) => void;
  onOpenComments: (cardId: string) => void;
}

export const ListColumn = ({
  list,
  cards,
  onRemove,
  onUpdateTitle,
  onAddCard,
  onUpdateCardTitle,
  onOpenComments,
}: ListColumnProps) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: {
      type: "list",
    },
    transition: {
      duration: 180,
      easing: "cubic-bezier(0.2, 0, 0, 1)",
    },
  });

  const { setNodeRef: setDropzoneRef, isOver } = useDroppable({
    id: `dropzone-${list.id}`,
    data: {
      type: "dropzone",
      listId: list.id,
    },
  });

  return (
    <section
      className={styles.column}
      data-dragging={isDragging}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        willChange: "transform",
      }}
    >
      <header className={styles.header}>
        <button
          className={styles.dragHandle}
          type="button"
          {...attributes}
          {...listeners}
        >
          ::
        </button>
        <InlineEditableText
          className={styles.titlePreview}
          inputClassName={styles.titleInput}
          onSave={(title) => onUpdateTitle(list.id, title)}
          placeholder="Enter list title..."
          value={list.title}
        />
        <button
          aria-label={`Delete ${list.title}`}
          className={styles.delete}
          onClick={() => onRemove(list.id)}
          type="button"
        >
          x
        </button>
      </header>

      <SortableContext
        items={list.cardIds}
        strategy={verticalListSortingStrategy}
      >
        <ul className={styles.cards} data-over={isOver} ref={setDropzoneRef}>
          {cards.map((card) => (
            <CardItem
              card={card}
              key={card.id}
              listId={list.id}
              onOpenComments={onOpenComments}
              onUpdateTitle={onUpdateCardTitle}
            />
          ))}
        </ul>
      </SortableContext>

      <div className={styles.addCard}>
        <CreateCardForm onCreate={(title) => onAddCard(list.id, title)} />
      </div>
    </section>
  );
};
