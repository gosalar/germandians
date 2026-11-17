import { Button } from '@mantine/core';
import { useId, useRef } from 'react';

import styles from './styles.module.scss';

interface ConfirmationProps {
  trigger: string;
  copy: { title: string; description: string; cancel: string; accept: string };
  onConfirm(): void;
  variant?: 'navy' | 'ring' | 'yellow';
}

/** Shared native confirmation for actions that end or discard a practice run. */
export default function Confirmation({ trigger, copy, onConfirm, variant = 'ring' }: ConfirmationProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const title = useId();
  const description = useId();

  const open = () => {
    dialog.current?.showModal();
    cancel.current?.focus();
  };

  const accept = () => {
    dialog.current?.close();
    onConfirm();
  };

  return (
    <>
      <Button ref={opener} type="button" variant={variant} size="md" onClick={open}>{trigger}</Button>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby={title}
        aria-describedby={description}
        onClose={() => opener.current?.focus()}
      >
        <h2 id={title}>{copy.title}</h2>
        <p id={description}>{copy.description}</p>
        <div className={styles.actions}>
          <Button ref={cancel} type="button" variant="ring" size="md" onClick={() => dialog.current?.close()}>
            {copy.cancel}
          </Button>
          <Button type="button" variant="navy" size="md" onClick={accept}>{copy.accept}</Button>
        </div>
      </dialog>
    </>
  );
}
