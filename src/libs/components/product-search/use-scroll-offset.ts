import { useEffect, useRef, useState } from 'react';

export const useScrollOffset = ({
  productSearchTerm,
  totalProducts,
  maxToQuery,
  categoryId,
}: {
  productSearchTerm: string;
  totalProducts: number;
  maxToQuery: number;
  categoryId?: string;
}) => {
  const [offsetState, setOffsetState] = useState<{
    offset: number;
    query: string;
  }>({ offset: 0, query: productSearchTerm });

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (
      scrollContainerRef.current &&
      'scrollTo' in scrollContainerRef.current
    ) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
    setOffsetState({
      offset: 0,
      query: productSearchTerm,
    });
  }, [productSearchTerm, categoryId]);

  useEffect(() => {
    // this function is called when the component is mounted
    // so scrollContainerRef will not be null
    if (!scrollContainerRef.current) {
      return;
    }

    const container = scrollContainerRef.current;

    const handleScroll = () => {
      const totalRowsCount = Math.ceil(totalProducts / 2);

      const scrollRatio =
        (container.scrollTop + container.clientHeight) / container.scrollHeight;

      const maxRowVisible = Math.floor(scrollRatio * totalRowsCount);
      const maxItemsVisible = maxRowVisible * 2;
      const offsetRoundedToNextMaxToQuery =
        Math.floor(maxItemsVisible / maxToQuery) * maxToQuery;

      setOffsetState((prev) => ({
        offset: Math.max(prev.offset, offsetRoundedToNextMaxToQuery),
        query: prev.query,
      }));
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [totalProducts, maxToQuery]);

  return {
    offset: offsetState.offset,
    query: offsetState.query,
    scrollContainerRef,
  };
};
