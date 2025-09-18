import { getAttributeToMergeGroupMap } from './get-attribute-to-merge-group-map';

describe('getAttributeToMergeGroupMap', () => {
  it('should return correct attribute to merge group map', () => {
    const merged = [
      {
        mergedValues: ['blue'],
        displayValue: 'navy',
      },
      {
        mergedValues: ['green', 'lime'],
        displayValue: 'emerald',
      },
      {
        mergedValues: undefined,
        displayValue: undefined,
      },
      {
        mergedValues: undefined,
        displayValue: '',
      },
      {
        mergedValues: [],
        displayValue: undefined,
      },
    ];

    const result = getAttributeToMergeGroupMap(merged);

    expect(result).toEqual({
      blue: {
        mergedValues: ['blue'],
        displayValue: 'navy',
      },
      green: {
        mergedValues: ['green', 'lime'],
        displayValue: 'emerald',
      },
      lime: {
        mergedValues: ['green', 'lime'],
        displayValue: 'emerald',
      },
    });
  });
});
