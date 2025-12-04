import type { DragEndEvent } from '@dnd-kit/core';

type SetBoostedOrderAction = {
  type: 'SET_BOOSTED_ORDER';
  payload: {
    id: string;
    newIndex: number;
  };
};

type CreateBoostedDragEndHandlerOptions = {
  writeEnabled: boolean;
  boostedOrder: string[];
  dispatch: (action: SetBoostedOrderAction) => void;
  shouldAbort?: (args: { activeId: string; overId: string }) => boolean;
  onBeforeDispatch?: () => void;
};

export const createBoostedDragEndHandler =
  ({
    writeEnabled,
    boostedOrder,
    dispatch,
    shouldAbort,
    onBeforeDispatch,
  }: CreateBoostedDragEndHandlerOptions) =>
  ({ active, over }: DragEndEvent) => {
    if (!over || !writeEnabled || active.id === over.id) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    if (shouldAbort?.({ activeId, overId })) {
      return;
    }

    const currentIndex = boostedOrder.indexOf(activeId);
    const newIndex = boostedOrder.indexOf(overId);

    if (currentIndex === -1 || newIndex === -1 || currentIndex === newIndex) {
      return;
    }

    onBeforeDispatch?.();

    dispatch({
      type: 'SET_BOOSTED_ORDER',
      payload: { id: activeId, newIndex },
    });
  };
