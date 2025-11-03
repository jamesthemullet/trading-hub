import { useCallback, useEffect, useRef, useState } from 'react';

type OrderChangeCallback = (displayValue: string, newIndex: number) => void;

export const useFacetOrderInput = (
  onOrderChange: OrderChangeCallback,
  initialOrders: Record<string, number>
) => {
  const inputRefs = useRef<Record<string, HTMLInputElement>>({});
  const [orderChanged, setOrderChanged] = useState<string | null>(null);
  const [localOrders, setLocalOrders] = useState<
    Record<string, number | string>
  >({});

  useEffect(() => {
    setLocalOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    if (orderChanged && inputRefs.current[orderChanged]) {
      const input = inputRefs.current[orderChanged];
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      input.focus();
      input.select();
      setOrderChanged(null);
    }
  }, [orderChanged]);

  const handleOrderChange = useCallback(
    (displayValue: string, newIndex: number) => {
      onOrderChange(displayValue, newIndex);
      setOrderChanged(displayValue);
    },
    [onOrderChange]
  );

  const handleInputChange = useCallback(
    (displayValue: string, value: string) => {
      if (value.startsWith('0')) {
        return;
      }
      const newOrder = value === '' ? '' : Number(value);
      setLocalOrders((prev) => ({
        ...prev,
        [displayValue]: newOrder,
      }));
    },
    []
  );

  const handleInputBlur = useCallback(
    (displayValue: string, value: string, order: number) => {
      const newOrder = Number(value);

      if (value === '' || !Number.isInteger(newOrder)) {
        setLocalOrders((prev) => ({
          ...prev,
          [displayValue]: order,
        }));
        return;
      }

      onOrderChange(displayValue, newOrder - 1);
    },
    [onOrderChange]
  );

  const handleInputKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLInputElement>,
      displayValue: string,
      order: number
    ) => {
      const invalidKeys = ['.', 'e', 'E', '-', '+'];
      if (invalidKeys.includes(e.key)) {
        e.preventDefault();
        return;
      }

      if (e.key === 'Enter') {
        const value = e.currentTarget.value;
        const newOrder = Number(value);

        if (value === '' || !Number.isInteger(newOrder)) {
          setLocalOrders((prev) => ({
            ...prev,
            [displayValue]: order,
          }));
          return;
        }

        handleOrderChange(displayValue, newOrder - 1);
      }
    },
    [handleOrderChange]
  );

  return {
    inputRefs,
    localOrders,
    handleInputChange,
    handleInputBlur,
    handleInputKeyDown,
  };
};
