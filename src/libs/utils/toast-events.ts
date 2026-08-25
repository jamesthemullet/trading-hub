type Listener = (message: string) => void;

const listeners = new Set<Listener>();

export const emitSaveSuccess = (
  message = 'Changes have been saved successfully'
): void => {
  listeners.forEach((listener) => listener(message));
};

export const onSaveSuccess = (listener: Listener): (() => void) => {
  // eslint-disable-next-line functional/immutable-data
  listeners.add(listener);
  // eslint-disable-next-line functional/immutable-data
  return () => listeners.delete(listener);
};
