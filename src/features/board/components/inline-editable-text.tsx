"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./inline-editable-text.module.scss";

interface InlineEditableTextProps {
  value: string;
  placeholder: string;
  className?: string;
  inputClassName?: string;
  editorClassName?: string;
  showActions?: boolean;
  submitOnBlur?: boolean;
  onSave: (nextValue: string) => void;
}

export const InlineEditableText = ({
  value,
  placeholder,
  className,
  inputClassName,
  editorClassName,
  showActions = true,
  submitOnBlur = false,
  onSave,
}: InlineEditableTextProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipBlurSubmitRef = useRef(false);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const submit = () => {
    const nextValue = draft.trim();
    if (nextValue && nextValue !== value) {
      onSave(nextValue);
    }
    setDraft(value);
    setIsEditing(false);
  };

  const cancel = () => {
    skipBlurSubmitRef.current = true;
    setDraft(value);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <button
        className={`${styles.preview} ${className ?? ""}`}
        type="button"
        onClick={() => setIsEditing(true)}
      >
        <span>{value || placeholder}</span>
        <span className={styles.previewIcon}>edit</span>
      </button>
    );
  }

  return (
    <div className={`${styles.editor} ${editorClassName ?? ""}`}>
      <input
        className={`${styles.input} ${inputClassName ?? ""}`}
        ref={inputRef}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          if (!submitOnBlur) {
            return;
          }
          if (skipBlurSubmitRef.current) {
            skipBlurSubmitRef.current = false;
            return;
          }
          submit();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            if (submitOnBlur) {
              event.preventDefault();
              inputRef.current?.blur();
            } else {
              submit();
            }
          }
          if (event.key === "Escape") {
            cancel();
          }
        }}
        placeholder={placeholder}
        spellCheck={false}
        type="text"
        value={draft}
      />
      {showActions && (
        <>
          <button
            aria-label="Save"
            className={styles.actionSave}
            onClick={submit}
            type="button"
          >
            save
          </button>
          <button
            aria-label="Cancel"
            className={styles.actionCancel}
            onClick={cancel}
            type="button"
          >
            cancel
          </button>
        </>
      )}
    </div>
  );
};
