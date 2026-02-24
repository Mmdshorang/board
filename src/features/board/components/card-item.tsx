"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { BoardCard } from "@/types/board";
import styles from "./card-item.module.scss";
import { InlineEditableText } from "./inline-editable-text";

interface CardItemProps {
  card: BoardCard;
  listId: string;
  onUpdateTitle: (cardId: string, title: string) => void;
  onOpenComments: (cardId: string) => void;
}

export const CardItem = ({
  card,
  listId,
  onUpdateTitle,
  onOpenComments,
}: CardItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: "card",
      listId,
    },
    transition: {
      duration: 160,
      easing: "cubic-bezier(0.2, 0, 0, 1)",
    },
  });

  return (
    <li
      className={styles.wrapper}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        willChange: "transform",
      }}
    >
      <article
        className={styles.card}
        data-dragging={isDragging}
        {...attributes}
        {...listeners}
      >
        <InlineEditableText
          className={styles.titlePreview}
          inputClassName={styles.titleInput}
          onSave={(title) => onUpdateTitle(card.id, title)}
          placeholder="Edit card title"
          value={card.title}
        />
        <footer className={styles.footer}>
          <button
            className={styles.comments}
            onClick={() => onOpenComments(card.id)}
            type="button"
          >
            Comments ({card.comments.length})
          </button>
        </footer>
      </article>
    </li>
  );
};
