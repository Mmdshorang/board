"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";

import styles from "./create-list-form.module.scss";

interface CreateListFormProps {
  onCreate: (title: string) => void;
}

export const CreateListForm = ({ onCreate }: CreateListFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
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
        + Add another list
      </button>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <input
        className={styles.input}
        ref={inputRef}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            close();
          }
        }}
        placeholder="Enter list title..."
        spellCheck={false}
        type="text"
        value={title}
      />
      <div className={styles.actions}>
        <button
          className={styles.submit}
          disabled={!title.trim()}
          type="submit"
        >
          Add list
        </button>
        <button className={styles.cancel} onClick={close} type="button">
          Cancel
        </button>
      </div>
    </form>
  );
};
