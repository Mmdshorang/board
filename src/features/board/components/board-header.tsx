"use client";

import styles from "./board-header.module.scss";
import { InlineEditableText } from "./inline-editable-text";

interface BoardHeaderProps {
  title: string;
  onUpdateTitle: (title: string) => void;
}

export const BoardHeader = ({ title, onUpdateTitle }: BoardHeaderProps) => {
  return (
    <header className={styles.header}>
      <InlineEditableText
        className={styles.titlePreview}
        editorClassName={styles.titleEditor}
        inputClassName={styles.titleInput}
        onSave={onUpdateTitle}
        placeholder="Edit board title"
        showActions={false}
        submitOnBlur
        value={title}
      />
    </header>
  );
};
