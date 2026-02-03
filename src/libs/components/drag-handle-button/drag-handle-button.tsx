import { forwardRef } from 'react';

import Image from 'next/image';

import styles from './drag-handle-button.module.css';

interface DragHandleButtonProps {
  disabled: boolean;
  displayName: string;
  setActivatorNodeRef?: (node: HTMLElement | null) => void;
  listeners?: Record<string, unknown>;
}

export const DragHandleButton = forwardRef<
  HTMLButtonElement,
  DragHandleButtonProps
>(({ disabled, displayName, setActivatorNodeRef, listeners = {} }, ref) => (
  <button
    ref={setActivatorNodeRef || ref}
    className={styles.dragHandleButton}
    type="button"
    aria-label={`Reorder ${displayName}`}
    {...listeners}
    disabled={disabled}
    aria-disabled={disabled}
    data-testid={`drag-handle-${displayName}`}
  >
    <Image
      width={24}
      height={24}
      src="/trading-hub/asset/drag-handle.svg"
      alt="Drag handle"
    />
  </button>
));

DragHandleButton.displayName = 'DragHandleButton';
