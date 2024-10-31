import { act } from 'react-dom/test-utils';
import { renderHook } from '@testing-library/react';

import { useScrollOffset } from './use-scroll-offset';

describe('use-scroll-offset', () => {
  it('should render the hook', () => {
    let scrollCallback: EventListener = () => {};
    const divMock = {
      addEventListener: (_type: string, fn: EventListener) => {
        scrollCallback = fn;
      },
      removeEventListener: () => {},
      scrollTop: 600,
      clientHeight: 400,
      scrollHeight: 1000,
      scrollTo: () => {},
    } as unknown as HTMLDivElement;

    const { result } = renderHook(() => {
      const result = useScrollOffset({
        totalProducts: 25,
        maxToQuery: 10,
        productSearchTerm: 'test',
      });

      result.scrollContainerRef.current = divMock;
      return result;
    });

    act(() => {
      scrollCallback(new Event('scroll'));
    });

    expect(result.current).toEqual({
      offset: 20,
      scrollContainerRef: { current: divMock },
      query: 'test',
    });
  });

  it('should not set offset if scrollContainerRef is null', () => {
    const { result } = renderHook(() =>
      useScrollOffset({
        totalProducts: 25,
        maxToQuery: 10,
        productSearchTerm: 'test',
      })
    );

    expect(result.current).toEqual({
      offset: 0,
      scrollContainerRef: { current: null },
      query: 'test',
    });
  });
});
