import { act, renderHook } from '@testing-library/react';

import { useFacetOrderInput } from './use-facet-order-input';

describe('useFacetOrderInput', () => {
  const mockOnOrderChange = jest.fn();
  const initialOrders = {
    item1: 1,
    item2: 2,
    item3: 3,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialisation', () => {
    it('should initialise with provided orders', () => {
      const { result } = renderHook(() =>
        useFacetOrderInput(mockOnOrderChange, initialOrders)
      );

      expect(result.current.localOrders).toEqual(initialOrders);
    });

    it('should update localOrders when initialOrders changes', () => {
      const { result, rerender } = renderHook(
        ({ orders }) => useFacetOrderInput(mockOnOrderChange, orders),
        { initialProps: { orders: initialOrders } }
      );

      expect(result.current.localOrders).toEqual(initialOrders);

      const newOrders = { item1: 3, item2: 2, item3: 1 };
      rerender({ orders: newOrders });

      expect(result.current.localOrders).toEqual(newOrders);
    });
  });

  describe('handleInputChange', () => {
    it('should update local order with valid number', () => {
      const { result } = renderHook(() =>
        useFacetOrderInput(mockOnOrderChange, initialOrders)
      );

      act(() => {
        result.current.handleInputChange('item1', '5');
      });

      expect(result.current.localOrders.item1).toBe(5);
    });

    it('should reject values starting with 0', () => {
      const { result } = renderHook(() =>
        useFacetOrderInput(mockOnOrderChange, initialOrders)
      );

      act(() => {
        result.current.handleInputChange('item1', '05');
      });

      expect(result.current.localOrders.item1).toBe(1);
    });
  });

  describe('handleInputBlur', () => {
    it('should call onOrderChange with valid integer', () => {
      const { result } = renderHook(() =>
        useFacetOrderInput(mockOnOrderChange, initialOrders)
      );

      act(() => {
        result.current.handleInputBlur('item1', '5', 1);
      });

      expect(mockOnOrderChange).toHaveBeenCalledWith('item1', 4); // newIndex = value - 1
    });

    it('should reset to original order on empty string', () => {
      const { result } = renderHook(() =>
        useFacetOrderInput(mockOnOrderChange, initialOrders)
      );

      act(() => {
        result.current.handleInputChange('item1', '10');
      });

      expect(result.current.localOrders.item1).toBe(10);

      act(() => {
        result.current.handleInputBlur('item1', '', 1);
      });

      expect(result.current.localOrders.item1).toBe(1);
      expect(mockOnOrderChange).not.toHaveBeenCalled();
    });

    it('should handle valid integer values correctly', () => {
      const { result } = renderHook(() =>
        useFacetOrderInput(mockOnOrderChange, initialOrders)
      );

      act(() => {
        result.current.handleInputBlur('item2', '7', 2);
      });

      expect(mockOnOrderChange).toHaveBeenCalledWith('item2', 6);
    });
  });

  describe('handleInputKeyDown', () => {
    it('should prevent default for invalid keys', () => {
      const { result } = renderHook(() =>
        useFacetOrderInput(mockOnOrderChange, initialOrders)
      );

      const invalidKeys = ['.', 'e', 'E', '-', '+'];

      invalidKeys.forEach((key) => {
        const mockEvent = {
          key,
          preventDefault: jest.fn(),
          currentTarget: { value: '5' },
        } as unknown as React.KeyboardEvent<HTMLInputElement>;

        act(() => {
          result.current.handleInputKeyDown(mockEvent, 'item1', 1);
        });

        expect(mockEvent.preventDefault).toHaveBeenCalled();
      });
    });

    it('should call onOrderChange on Enter with valid integer', () => {
      const { result } = renderHook(() =>
        useFacetOrderInput(mockOnOrderChange, initialOrders)
      );

      const mockEvent = {
        key: 'Enter',
        preventDefault: jest.fn(),
        currentTarget: { value: '8' },
      } as unknown as React.KeyboardEvent<HTMLInputElement>;

      act(() => {
        result.current.handleInputKeyDown(mockEvent, 'item1', 1);
      });

      expect(mockOnOrderChange).toHaveBeenCalledWith('item1', 7);
    });

    it('should reset to original order on Enter with empty string', () => {
      const { result } = renderHook(() =>
        useFacetOrderInput(mockOnOrderChange, initialOrders)
      );

      act(() => {
        result.current.handleInputChange('item1', '10');
      });

      expect(result.current.localOrders.item1).toBe(10);

      const mockEvent = {
        key: 'Enter',
        preventDefault: jest.fn(),
        currentTarget: { value: '' },
      } as unknown as React.KeyboardEvent<HTMLInputElement>;

      act(() => {
        result.current.handleInputKeyDown(mockEvent, 'item1', 1);
      });

      expect(result.current.localOrders.item1).toBe(1);
      expect(mockOnOrderChange).not.toHaveBeenCalled();
    });
  });

  describe('inputRefs', () => {
    it('should provide inputRefs object', () => {
      const { result } = renderHook(() =>
        useFacetOrderInput(mockOnOrderChange, initialOrders)
      );

      expect(result.current.inputRefs).toBeDefined();
      expect(result.current.inputRefs.current).toEqual({});
    });
  });
});
