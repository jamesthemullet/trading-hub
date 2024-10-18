import { useEffect, useRef, useState } from 'react';

export const useScrollOffset = ({
  totalProducts,
  maxToQuery,
}: {
  totalProducts: number;
  maxToQuery: number;
}) => {
  const [offset, setOffset] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

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
      setOffset((prev) => Math.max(prev, offsetRoundedToNextMaxToQuery));
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [totalProducts, maxToQuery]);

  return {
    offset,
    scrollContainerRef,
  };
};
