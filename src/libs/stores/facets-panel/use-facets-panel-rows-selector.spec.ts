import { renderHook } from '@testing-library/react';

import { facetsListMock } from '@/pages/api/search/mocks';

import { useFacetsRowsSelector } from './use-facets-panel-rows-selector';

describe('useFacetsRowsSelector', () => {
  it('should return correct included and excluded facets', () => {
    const { result } = renderHook(() =>
      useFacetsRowsSelector(
        {
          includedFacets: [
            'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
            'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
          ],
          excludedFacets: ['b04eaac3-f4ea-4f21-9459-0b4302dc2a87'],
          countryCode: 'UK_IE',
          orders: {
            'b04eaac3-f4ea-4f21-9459-0b4302dc2a84': 1,
            'b04eaac3-f4ea-4f21-9459-0b4302dc2a86': 2,
          },
        },
        facetsListMock.facets
      )
    );

    expect(result.current.facetsState).toEqual([
      {
        displayType: 'included',
        displayValue: 'color',
        id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
        indexPropertyName: 'color',
        lastChanged: {
          date: '2021-01-01T08:34:15Z',
          user: 'Test User',
        },
        boosted: ['Cotton', 'Duck Down'],
        excludedValues: ['Ducky Downy'],
        merged: [
          {
            displayValue: 'test merged group',
            mergedValues: ['merged 1', 'merged 2'],
          },
        ],
        type: 'root',
        meta: {
          isBeginningOfDisplayTypeGroup: true,
          isEndOfDisplayTypeGroup: false,
        },
      },
      {
        displayType: 'included',
        displayValue: 'brand',
        id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
        indexPropertyName: 'brand',
        lastChanged: {
          date: '2021-01-03T08:34:15Z',
          user: 'Test User',
        },
        merged: [],
        type: 'root',
        meta: {
          isBeginningOfDisplayTypeGroup: false,
          isEndOfDisplayTypeGroup: true,
        },
      },
      {
        displayType: 'algoControl',
        displayValue: 'size',
        id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
        indexPropertyName: 'size',
        lastChanged: {
          date: '2021-01-02T08:34:15Z',
          user: 'Test User',
        },
        merged: [],
        type: 'root',
        meta: {
          isBeginningOfDisplayTypeGroup: true,
          isEndOfDisplayTypeGroup: false,
        },
      },
      {
        displayType: 'algoControl',
        displayValue: 'price',
        id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a88',
        indexPropertyName: 'price',
        lastChanged: {
          date: '2021-01-05T08:34:15Z',
          user: 'Test User',
        },
        merged: [],
        type: 'root',
        meta: {
          isBeginningOfDisplayTypeGroup: false,
          isEndOfDisplayTypeGroup: true,
        },
      },
      {
        displayType: 'excluded',
        displayValue: 'category',
        id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a87',
        indexPropertyName: 'category',
        lastChanged: {
          date: '2021-01-04T08:34:15Z',
          user: 'Test User',
        },
        merged: [],
        type: 'root',
        meta: {
          isBeginningOfDisplayTypeGroup: true,
          isEndOfDisplayTypeGroup: true,
        },
      },
    ]);
  });
});
