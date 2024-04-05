import { useEffect, useState } from 'react';

import type { Product, ReturnedRuleSet } from '@/libs/api';
import { merchandising } from '@/libs/api';

export const useRuleSetPreview = (id: string) => {
  const [ruleSets, setRuleSets] = useState<ReturnedRuleSet>({
    categoryId: '',
    categoryName: '',
    id: '',
    isEnabled: false,
    lastChanged: {
      date: '',
      user: '',
    },
    rules: {
      pinnedProducts: [],
      boosts: { numeric: [], alphaNumeric: [], product: [] },
      buries: { numeric: [], alphaNumeric: [], product: [] }
    },
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const asyncCall = async () => {
      try {
        const response = await merchandising().rulesetDetail(id);

        const data = response.data;

        setRuleSets(data);

        const categoryId = data.categoryId;

        const categoryPreview = await merchandising().categoryPreviewCreate(
          categoryId,
          { rows: 12, start: 0 },
          {
            pinnedProducts: data.rules.pinnedProducts,
            boosts: { numeric: [], alphaNumeric: [], product: [] },
            buries: { numeric: [], alphaNumeric: [], product: [] }
          }
        );

        const previewData = categoryPreview.data;

        setProducts(previewData.products);
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
  }, [id]);

  return { ruleSets, products, error };
};
