import type { CSSProperties, ReactElement } from 'react';

import { useSortable } from '@dnd-kit/sortable';

export type SortableRowRenderArgs = Pick<
  ReturnType<typeof useSortable>,
  'attributes' | 'listeners' | 'setActivatorNodeRef' | 'setNodeRef'
> & {
  style?: CSSProperties;
};

type SortableRowProps = {
  id: string;
  disabled: boolean;
  children: (args: SortableRowRenderArgs) => ReactElement;
};

export const SortableRow = ({
  id,
  disabled,
  children,
}: SortableRowProps): ReactElement => {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
  });

  // Restrict horizontal movement by clamping x-axis to 0
  const restrictedTransform = transform ? { ...transform, x: 0 } : transform;

  const style: CSSProperties = {
    transform: restrictedTransform
      ? `translate3d(${restrictedTransform.x}px, ${restrictedTransform.y}px, 0)`
      : undefined,
    transition,
    zIndex: isDragging ? 10 : undefined,
    boxShadow: isDragging ? 'var(--elevation-action)' : undefined,
  };

  return children({
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    style,
  });
};
