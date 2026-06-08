import type { MerchandisingAttributesResponse } from '@/libs/api';

export const mockCategoryNumericAttributes: MerchandisingAttributesResponse = {
  attributes: [
    {
      name: 'predictions.salesIn1Day.normalisedValue',
      type: 'numeric',
    },
    {
      name: 'newInFreshNess',
      type: 'numeric',
    },
  ],
};

export const mockCategoryAlphanumericAttributes: MerchandisingAttributesResponse =
  {
    attributes: [
      {
        name: 'offerFlag',
        type: 'alphanumeric',
        values: [
          {
            value: '0',
          },
          {
            value: '1',
          },
        ],
      },
      {
        name: 'fit',
        type: 'alphanumeric',
        values: [
          {
            value: 'Regular fit',
          },
          {
            value: 'Relaxed fit',
          },
          {
            value: 'Fitted',
          },
          {
            value: 'Straight leg',
          },
        ],
      },
    ],
  };
