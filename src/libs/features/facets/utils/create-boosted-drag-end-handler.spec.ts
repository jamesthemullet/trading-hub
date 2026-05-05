import type { DragEndEvent } from '@dnd-kit/core';

import { createBoostedDragEndHandler } from './create-boosted-drag-end-handler';

const createDragEndEvent = (
  activeId: string,
  overId: string | null
): DragEndEvent =>
  ({
    active: { id: activeId },
    over: overId ? { id: overId } : null,
  }) as unknown as DragEndEvent;

describe('createBoostedDragEndHandler', () => {
  it('dispatches the new order when drag ends between distinct items', () => {
    const dispatch = jest.fn();
    const handler = createBoostedDragEndHandler({
      boostedOrder: ['a', 'b', 'c'],
      dispatch,
      isWriteEnabled: true,
    });

    handler(createDragEndEvent('a', 'b'));

    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_BOOSTED_ORDER',
      payload: { id: 'a', newIndex: 1 },
    });
  });

  it('does not dispatch when writes are disabled', () => {
    const dispatch = jest.fn();
    const handler = createBoostedDragEndHandler({
      boostedOrder: ['a', 'b'],
      dispatch,
      isWriteEnabled: false,
    });

    handler(createDragEndEvent('a', 'b'));

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('runs onBeforeDispatch prior to dispatching the action', () => {
    const callOrder: string[] = [];
    const dispatch = jest.fn(() => {
      callOrder.push('dispatch');
    });
    const onBeforeDispatch = jest.fn(() => {
      callOrder.push('before');
    });
    const handler = createBoostedDragEndHandler({
      boostedOrder: ['a', 'b'],
      dispatch,
      isWriteEnabled: true,
      onBeforeDispatch,
    });

    handler(createDragEndEvent('a', 'b'));

    expect(callOrder).toEqual(['before', 'dispatch']);
    expect(onBeforeDispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});
