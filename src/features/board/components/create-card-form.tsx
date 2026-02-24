"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";

import styles from "./create-card-form.module.scss";

interface CreateCardFormProps {
  onCreate: (title: string) => void;
}

export const CreateCardForm = ({ onCreate }: CreateCardFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus();
    }
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    setTitle("");
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) {
      return;
    }

    onCreate(nextTitle);
    setTitle("");
  };

  if (!isOpen) {
    return (
      <button
        className={styles.addTrigger}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        + Add another card
      </button>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <textarea
        className={styles.input}
        ref={textareaRef}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            close();
          }
        }}
        placeholder="Enter a card title..."
        rows={3}
        spellCheck={false}
        value={title}
      />
      <div className={styles.actions}>
        <button
          className={styles.submit}
          disabled={!title.trim()}
          type="submit"
        >
          Create card
        </button>
        <button className={styles.cancel} onClick={close} type="button">
          Cancel
        </button>
      </div>
    </form>
  );
};
