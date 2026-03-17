import { type ButtonHTMLAttributes, forwardRef } from 'react';

import Image from 'next/image';

import { Button } from '../button/button';
import styles from './drag-handle-button.module.css';

type DragHandleButtonProps = {
  disabled: boolean;
  displayName: string;
  setActivatorNodeRef?: (node: HTMLButtonElement | null) => void;
  listeners?: ButtonHTMLAttributes<HTMLButtonElement>;
};

export const DragHandleButton = forwardRef<
  HTMLButtonElement,
  DragHandleButtonProps
>(({ disabled, displayName, setActivatorNodeRef, listeners = {} }, ref) => (
  <Button
    appearance="icon"
    ref={setActivatorNodeRef ?? ref}
    className={styles.dragHandleButton}
    type="button"
    aria-label={`Reorder ${displayName}`}
    {...listeners}
    isDisabled={disabled}
    aria-disabled={disabled}
    data-testid={`drag-handle-${displayName}`}
  >
    <Image
      width={24}
      height={24}
      src="/trading-hub/asset/drag-handle.svg"
      alt=""
    />
  </Button>
));

DragHandleButton.displayName = 'DragHandleButton';
