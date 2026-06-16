import { renderHook } from '@testing-library/react';

import * as mostViewedStorage from './use-most-viewed-rulesets';
import * as storage from './use-recently-viewed-rulesets';
import { useTrackRecentlyViewed } from './use-track-recently-viewed';

jest.mock('./use-recently-viewed-rulesets', () => ({
  ...jest.requireActual('./use-recently-viewed-rulesets'),
  saveRecentlyViewed: jest.fn(),
}));

jest.mock('./use-most-viewed-rulesets', () => ({
  ...jest.requireActual('./use-most-viewed-rulesets'),
  saveRulesetVisit: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useTrackRecentlyViewed', () => {
  it('does not save when id is undefined', () => {
    renderHook(() =>
      useTrackRecentlyViewed({
        id: undefined,
        label: 'test',
        url: '/test',
        type: 'category',
      })
    );
    expect(storage.saveRecentlyViewed).not.toHaveBeenCalled();
    expect(mostViewedStorage.saveRulesetVisit).not.toHaveBeenCalled();
  });

  it('does not save when label is undefined', () => {
    renderHook(() =>
      useTrackRecentlyViewed({
        id: 'abc',
        label: undefined,
        url: '/test',
        type: 'category',
      })
    );
    expect(storage.saveRecentlyViewed).not.toHaveBeenCalled();
    expect(mostViewedStorage.saveRulesetVisit).not.toHaveBeenCalled();
  });

  it('saves to both stores when id and label are both defined', () => {
    renderHook(() =>
      useTrackRecentlyViewed({
        id: 'abc',
        label: 'Category A',
        url: '/category/rulesets/edit/abc',
        type: 'category',
      })
    );
    expect(storage.saveRecentlyViewed).toHaveBeenCalledWith({
      id: 'abc',
      label: 'Category A',
      url: '/category/rulesets/edit/abc',
      type: 'category',
      viewedAt: expect.any(Number),
    });
    expect(mostViewedStorage.saveRulesetVisit).toHaveBeenCalledWith({
      id: 'abc',
      label: 'Category A',
      url: '/category/rulesets/edit/abc',
      type: 'category',
    });
  });
});
