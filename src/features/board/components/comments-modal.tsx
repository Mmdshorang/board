"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";

import type { BoardCard } from "@/types/board";

import styles from "./comments-modal.module.scss";

interface CommentsModalProps {
  card: BoardCard | null;
  onClose: () => void;
  onAddComment: (message: string) => void;
}

export const CommentsModal = ({
  card,
  onClose,
  onAddComment,
}: CommentsModalProps) => {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isOpen = Boolean(card);

  const comments = useMemo(() => card?.comments ?? [], [card]);

  useEffect(() => {
    if (card) {
      inputRef.current?.focus();
    }
  }, [card]);

  if (!isOpen || !card) {
    return null;
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = message.trim();
    if (!next) {
      return;
    }

    onAddComment(next);
    setMessage("");
  };

  return (
    <div
      aria-modal="true"
      className={styles.overlay}
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onClose();
        }
      }}
      role="dialog"
      tabIndex={-1}
    >
      <article
        className={styles.modal}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h3 className={styles.title}>
            Comments for &quot;{card.title}&quot;
          </h3>
          <button className={styles.close} onClick={onClose} type="button">
            x
          </button>
        </header>

        <ul className={styles.list}>
          {comments.length === 0 && (
            <li className={styles.empty}>
              No comments yet. Be the first to comment!
            </li>
          )}
          {comments.map((comment) => (
            <li className={styles.item} key={comment.id}>
              <p className={styles.meta}>
                {comment.author} -{" "}
                {new Date(comment.createdAt).toLocaleString()}
              </p>
              <p className={styles.message}>{comment.message}</p>
            </li>
          ))}
        </ul>

        <form className={styles.form} onSubmit={submit}>
          <textarea
            className={styles.input}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Write a comment..."
            ref={inputRef}
            rows={3}
            value={message}
          />
          <button
            className={styles.submit}
            disabled={!message.trim()}
            type="submit"
          >
            Add Comment
          </button>
        </form>
      </article>
    </div>
  );
};
