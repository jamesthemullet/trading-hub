import { renderHook } from '@testing-library/react';

import { ReturnedGlobalFacet } from '@/libs/api';
import { useGetFacetAttributeValues } from '@/libs/hooks/use-get-facet-attribute-values';

import { useAttributeValuesRowsSelector } from './use-attribute-values-rows-selector';

jest.mock('@/libs/hooks/use-get-facet-attribute-values', () => ({
  ...jest.requireActual('@/libs/hooks/use-get-facet-attribute-values'),
  useGetFacetAttributeValues: jest.fn(),
}));

const mockReturnedGlobalFacetState: ReturnedGlobalFacet = {
  id: 'color',
  lastChanged: {
    date: '2021-10-01',
    user: 'Bob',
  },
  displayValue: 'color',
  indexPropertyName: 'color',
  boosted: [],
  excludedValues: [],
};

const useGetFacetAttributeValuesReturnValueMock: ReturnType<
  typeof useGetFacetAttributeValues
> = {
  isLoading: false,
  attributeValues: [],
  error: '',
  pagination: {
    totalItems: 0,
  },
  refetch: jest.fn(),
};

describe('useAttributeValuesRowsSelector', () => {
  it('should return correct attribute values', () => {
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      ...useGetFacetAttributeValuesReturnValueMock,
      attributeValues: [
        {
          displayValue: 'red',
        },
        {
          displayValue: 'blue',
        },
        {
          displayValue: 'green',
        },
        {
          displayValue: 'lime',
        },
      ],
      pagination: {
        totalItems: 2,
      },
    });
    const { result } = renderHook(() =>
      useAttributeValuesRowsSelector(
        {
          ...mockReturnedGlobalFacetState,
          merged: [
            {
              displayValue: 'navy',
              mergedValues: ['blue'],
            },
            {
              displayValue: 'emerald',
              mergedValues: ['green', 'lime'],
            },
          ],
        },
        'color'
      )
    );

    expect(result.current.attributeValuesState).toEqual([
      {
        displayType: 'default',
        displayValue: 'red',
        id: 'red',
        mergeType: 'unmerged',
        meta: {
          isBeginningOfDisplayTypeGroup: true,
          isEndOfDisplayTypeGroup: false,
        },
      },
      {
        displayType: 'default',
        displayValue: 'navy',
        id: 'blue',
        mergeType: 'unmerged',
        meta: {
          isBeginningOfDisplayTypeGroup: false,
          isEndOfDisplayTypeGroup: false,
        },
      },
      {
        displayType: 'default',
        displayValue: 'emerald',
        id: 'green',
        mergeType: 'merged',
        mergedValues: ['green', 'lime'],
        meta: {
          isBeginningOfDisplayTypeGroup: false,
          isEndOfDisplayTypeGroup: true,
        },
      },
    ]);
  });

  it('should return filtered attribute values', () => {
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      ...useGetFacetAttributeValuesReturnValueMock,
      attributeValues: [
        {
          displayValue: 'green',
        },
        {
          displayValue: 'greeen',
        },
      ],
      pagination: {
        totalItems: 2,
      },
    });
    const { result } = renderHook(() =>
      useAttributeValuesRowsSelector(
        {
          ...{
            ...mockReturnedGlobalFacetState,
            boosted: ['green', 'lime', 'blue'],
            excludedValues: ['greeen', 'red'],
          },
          merged: [
            {
              displayValue: 'navy',
              mergedValues: ['blue'],
            },
            {
              displayValue: 'emerald',
              mergedValues: ['green', 'lime'],
            },
          ],
        },
        'ee'
      )
    );

    expect(result.current.attributeValuesState).toEqual([
      {
        displayType: 'boosted',
        displayValue: 'emerald',
        id: 'green',
        mergeType: 'merged',
        mergedValues: ['green', 'lime'],
        meta: {
          isBeginningOfDisplayTypeGroup: true,
          isEndOfDisplayTypeGroup: true,
        },
      },
      {
        displayType: 'excluded',
        displayValue: 'greeen',
        id: 'greeen',
        mergeType: 'unmerged',
        meta: {
          isBeginningOfDisplayTypeGroup: true,
          isEndOfDisplayTypeGroup: true,
        },
      },
    ]);
  });

  it('should work with boosted and excludedValues being undefined', () => {
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      ...useGetFacetAttributeValuesReturnValueMock,
      attributeValues: [
        {
          displayValue: 'red',
        },
      ],
      pagination: {
        totalItems: 2,
      },
    });
    const { result } = renderHook(() =>
      useAttributeValuesRowsSelector(
        {
          ...mockReturnedGlobalFacetState,
          boosted: undefined,
          excludedValues: undefined,
        },
        'color'
      )
    );

    expect(result.current.attributeValuesState).toEqual([
      {
        displayType: 'default',
        displayValue: 'red',
        id: 'red',
        mergeType: 'unmerged',
        meta: {
          isBeginningOfDisplayTypeGroup: true,
          isEndOfDisplayTypeGroup: true,
        },
      },
    ]);
  });

  it('should work', () => {
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      ...useGetFacetAttributeValuesReturnValueMock,
      attributeValues: [
        {
          displayValue: 'Cotton',
        },
      ],
      pagination: {
        totalItems: 1,
      },
    });

    const { result } = renderHook(() =>
      useAttributeValuesRowsSelector(
        {
          ...mockReturnedGlobalFacetState,
          boosted: ['Cotton'],
          merged: [
            {
              displayValue: 'Merged group 1',
              mergedValues: ['Cotton', 'Duck Down'],
            },
          ],
        },
        ''
      )
    );

    const values = result.current.attributeValuesState;

    expect(values).toEqual([
      {
        displayType: 'boosted',
        displayValue: 'Merged group 1',
        id: 'Cotton',
        mergeType: 'merged',
        mergedValues: ['Cotton', 'Duck Down'],
        meta: {
          isBeginningOfDisplayTypeGroup: true,
          isEndOfDisplayTypeGroup: true,
        },
      },
    ]);
  });

  it('should work as expected with merged as undefined', () => {
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      ...useGetFacetAttributeValuesReturnValueMock,
      attributeValues: [
        {
          displayValue: 'Cotton',
        },
      ],
      pagination: {
        totalItems: 1,
      },
    });

    const { result } = renderHook(() =>
      useAttributeValuesRowsSelector(
        {
          ...mockReturnedGlobalFacetState,
          boosted: ['Cotton'],
          merged: undefined,
        },
        ''
      )
    );

    const values = result.current.attributeValuesState;

    expect(values).toEqual([
      {
        displayType: 'boosted',
        displayValue: 'Cotton',
        id: 'Cotton',
        mergeType: 'unmerged',
        meta: {
          isBeginningOfDisplayTypeGroup: true,
          isEndOfDisplayTypeGroup: true,
        },
      },
    ]);
  });

  it('should work as expected with merged values as undefined', () => {
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      ...useGetFacetAttributeValuesReturnValueMock,
      attributeValues: [
        {
          displayValue: 'Cotton',
        },
      ],
      pagination: {
        totalItems: 1,
      },
    });

    const { result } = renderHook(() =>
      useAttributeValuesRowsSelector(
        {
          ...mockReturnedGlobalFacetState,
          boosted: ['Merged group 1'],
          merged: [
            {
              displayValue: 'Merged group 1',
              mergedValues: undefined,
            },
          ],
        },
        ''
      )
    );

    const values = result.current.attributeValuesState;

    expect(values).toEqual([
      {
        displayType: 'boosted',
        displayValue: 'Merged group 1',
        id: 'Merged group 1',
        mergeType: 'unmerged',
        meta: {
          isBeginningOfDisplayTypeGroup: true,
          isEndOfDisplayTypeGroup: true,
        },
      },
      {
        displayType: 'default',
        displayValue: 'Cotton',
        id: 'Cotton',
        mergeType: 'unmerged',
        meta: {
          isBeginningOfDisplayTypeGroup: true,
          isEndOfDisplayTypeGroup: true,
        },
      },
    ]);
  });

  it('should add missing attributes from merged list', () => {
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      ...useGetFacetAttributeValuesReturnValueMock,
      attributeValues: [
        {
          displayValue: 'red',
        },
        {
          displayValue: 'blue',
        },
        {
          displayValue: 'green',
        },
        {
          displayValue: 'lime',
        },
        {
          displayValue: 'missing',
        },
        {
          displayValue: 'missing 2',
        },
      ],
      pagination: {
        totalItems: 2,
      },
    });
    const { result } = renderHook(() =>
      useAttributeValuesRowsSelector(
        {
          ...mockReturnedGlobalFacetState,
          boosted: ['missing'],
          merged: [
            {
              displayValue: 'missing',
              mergedValues: ['missing 2', 'missing', 'Missing'],
            },
            {
              displayValue: 'emerald',
              mergedValues: ['green', 'lime'],
            },
          ],
        },
        ''
      )
    );

    expect(result.current.attributeValuesState).toEqual([
      {
        displayType: 'boosted',
        displayValue: 'missing',
        id: 'missing 2',
        mergeType: 'merged',
        mergedValues: ['missing 2', 'missing', 'Missing'],
        meta: {
          isBeginningOfDisplayTypeGroup: true,
          isEndOfDisplayTypeGroup: true,
        },
      },
      {
        displayType: 'default',
        displayValue: 'red',
        id: 'red',
        mergeType: 'unmerged',
        meta: {
          isBeginningOfDisplayTypeGroup: true,
          isEndOfDisplayTypeGroup: false,
        },
      },
      {
        displayType: 'default',
        displayValue: 'blue',
        id: 'blue',
        mergeType: 'unmerged',
        meta: {
          isBeginningOfDisplayTypeGroup: false,
          isEndOfDisplayTypeGroup: false,
        },
      },
      {
        displayType: 'default',
        displayValue: 'emerald',
        id: 'green',
        mergeType: 'merged',
        mergedValues: ['green', 'lime'],
        meta: {
          isBeginningOfDisplayTypeGroup: false,
          isEndOfDisplayTypeGroup: true,
        },
      },
    ]);
  });
});
