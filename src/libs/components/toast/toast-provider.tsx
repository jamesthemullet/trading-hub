import type { ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';

import { onSaveSuccess } from '@/libs/utils/toast-events';

import { Toast } from './toast';
import styles from './toast-provider.module.css';

type ToastEntry = { id: number; message: string; bottomOffset: number };

const GAP_PX = 8;
const FALLBACK_ROW_HEIGHT_PX = 48;

export const ToastProvider = (): ReactElement | null => {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const nextId = useRef(0);
  const nextBottomOffset = useRef(0);
  const rowHeight = useRef<number | null>(null);
  const firstSlotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return onSaveSuccess((message) => {
      const id = nextId.current;
      // Only mutates the local ref; does not trigger a re-render.
      // eslint-disable-next-line functional/immutable-data
      nextId.current += 1;

      const bottomOffset = nextBottomOffset.current;
      // Only mutates the local ref; does not trigger a re-render.
      // eslint-disable-next-line functional/immutable-data
      nextBottomOffset.current +=
        (rowHeight.current ?? FALLBACK_ROW_HEIGHT_PX) + GAP_PX;

      setToasts((current) => [...current, { id, message, bottomOffset }]);
    });
  }, []);

  useEffect(() => {
    if (rowHeight.current === null && firstSlotRef.current) {
      // Only mutates the local ref; does not trigger a re-render.
      // eslint-disable-next-line functional/immutable-data
      rowHeight.current = firstSlotRef.current.getBoundingClientRect().height;
    }
  }, [toasts]);

  const dismiss = (id: number): void => {
    setToasts((current) => {
      const remaining = current.filter((toast) => toast.id !== id);
      if (remaining.length === 0) {
        // All toasts cleared: restart stacking from the bottom next time.
        // eslint-disable-next-line functional/immutable-data
        nextBottomOffset.current = 0;
      }
      return remaining;
    });
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className={styles.stack}>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          ref={(node) => {
            if (!node) {
              return;
            }
            node.style.setProperty('bottom', `${toast.bottomOffset}px`);
            if (index === 0) {
              // eslint-disable-next-line functional/immutable-data
              firstSlotRef.current = node;
            }
          }}
          className={styles.slot}
        >
          <Toast
            message={toast.message}
            autoDismissMs={4000}
            onDismiss={() => dismiss(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};
