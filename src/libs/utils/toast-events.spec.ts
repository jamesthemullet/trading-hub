import { emitSaveSuccess, onSaveSuccess } from './toast-events';

describe('toast-events', () => {
  it('notifies subscribed listeners with the given message', () => {
    const listener = jest.fn();
    const unsubscribe = onSaveSuccess(listener);

    emitSaveSuccess('Custom message');

    expect(listener).toHaveBeenCalledWith('Custom message');
    unsubscribe();
  });

  it('defaults to a generic success message', () => {
    const listener = jest.fn();
    const unsubscribe = onSaveSuccess(listener);

    emitSaveSuccess();

    expect(listener).toHaveBeenCalledWith(
      'Changes have been saved successfully'
    );
    unsubscribe();
  });

  it('stops notifying a listener after it unsubscribes', () => {
    const listener = jest.fn();
    const unsubscribe = onSaveSuccess(listener);
    unsubscribe();

    emitSaveSuccess();

    expect(listener).not.toHaveBeenCalled();
  });

  it('notifies multiple listeners', () => {
    const listenerA = jest.fn();
    const listenerB = jest.fn();
    const unsubscribeA = onSaveSuccess(listenerA);
    const unsubscribeB = onSaveSuccess(listenerB);

    emitSaveSuccess();

    expect(listenerA).toHaveBeenCalledTimes(1);
    expect(listenerB).toHaveBeenCalledTimes(1);
    unsubscribeA();
    unsubscribeB();
  });
});
