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

export const SortableRow = ({ id, disabled, children }: SortableRowProps) => {
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

  const style: CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return children({
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    style,
  });
};
