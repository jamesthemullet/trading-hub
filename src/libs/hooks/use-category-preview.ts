import { useEffect, useState } from 'react';

import type { MerchandisingRules, Product } from '@/libs/api';
import { merchandising } from '@/libs/api';

export const useCategoryPreview = (
  categoryId: string | undefined,
  merchandisingRules: MerchandisingRules
) => {
  const [categoryPreview, setCategoryPreview] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [shouldRefetch, refetch] = useState({});

  useEffect(() => {
    const asyncCall = async () => {
      if (!categoryId) {
        setCategoryPreview([]);
        return;
      }

      try {
        const categoryPreview = await merchandising().categoryPreviewCreate(
          categoryId,
          { rows: 12, start: 0 },
          merchandisingRules
        );

        const previewData = categoryPreview.data;

        setCategoryPreview(previewData.products);
        setError('');
      } catch (error) {
        if (error && typeof error === 'object' && 'status' in error) {
          setError(`POST status ${error.status}`);
          return;
        }
        setError(`Failed to get categories ${error}`);
      }
    };

    void asyncCall();
  }, [categoryId, shouldRefetch]);

  return {
    categoryPreview, error,
    refetchRuleSetPreview: () => refetch({}),
  };
};
