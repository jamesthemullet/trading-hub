import type { MerchandisingKeywordRedirect } from '@/libs/api';

import { useRedirectDiff } from './use-redirect-diff';

const baseRedirect: MerchandisingKeywordRedirect = {
  isEnabled: true,
  keywords: ['shoes'],
  destinationUrl: '/shoes',
  ruleTitle: 'Shoes redirect',
  type: 'redirectTerm',
  countryCode: 'UK_IE',
  startDate: '2024-01-01T00:00:00.000Z',
  endDate: '2024-02-01T00:00:00.000Z',
};

describe('useRedirectDiff', () => {
  it('returns an empty diff when original is undefined', () => {
    expect(useRedirectDiff(undefined, baseRedirect)).toEqual([]);
  });

  it('returns an empty diff when nothing has changed', () => {
    expect(useRedirectDiff(baseRedirect, baseRedirect)).toEqual([]);
  });

  it('detects a title change', () => {
    const result = useRedirectDiff(baseRedirect, {
      ...baseRedirect,
      ruleTitle: 'New title',
    });
    expect(result).toContainEqual({
      type: 'changed',
      label: 'Title',
      description: 'Shoes redirect → New title',
    });
  });

  it('labels a missing original title as none', () => {
    const result = useRedirectDiff(
      { ...baseRedirect, ruleTitle: undefined },
      baseRedirect
    );
    expect(result).toContainEqual({
      type: 'changed',
      label: 'Title',
      description: 'none → Shoes redirect',
    });
  });

  it('detects added and removed keywords', () => {
    const result = useRedirectDiff(baseRedirect, {
      ...baseRedirect,
      keywords: ['boots'],
    });
    expect(result).toContainEqual({
      type: 'added',
      label: 'Keyword',
      description: 'boots',
    });
    expect(result).toContainEqual({
      type: 'removed',
      label: 'Keyword',
      description: 'shoes',
    });
  });

  it('detects a destination url change', () => {
    const result = useRedirectDiff(baseRedirect, {
      ...baseRedirect,
      destinationUrl: '/boots',
    });
    expect(result).toContainEqual({
      type: 'changed',
      label: 'Destination URL',
      description: '/shoes → /boots',
    });
  });

  it('detects a match type change', () => {
    const result = useRedirectDiff(baseRedirect, {
      ...baseRedirect,
      type: 'redirectPhrase',
    });
    expect(result).toContainEqual({
      type: 'changed',
      label: 'Match type',
      description: 'redirectTerm → redirectPhrase',
    });
  });

  it('describes a status change to disabled', () => {
    const result = useRedirectDiff(baseRedirect, {
      ...baseRedirect,
      isEnabled: false,
    });
    expect(result).toContainEqual({
      type: 'changed',
      label: 'Status',
      description: 'Enabled → Disabled',
    });
  });

  it('describes a status change to enabled', () => {
    const result = useRedirectDiff(
      { ...baseRedirect, isEnabled: false },
      baseRedirect
    );
    expect(result).toContainEqual({
      type: 'changed',
      label: 'Status',
      description: 'Disabled → Enabled',
    });
  });

  it('labels a removed country code as none', () => {
    const result = useRedirectDiff(baseRedirect, {
      ...baseRedirect,
      countryCode: undefined,
    });
    expect(result).toContainEqual({
      type: 'changed',
      label: 'Country',
      description: 'UK_IE → none',
    });
  });

  it('detects start and end date changes', () => {
    const result = useRedirectDiff(baseRedirect, {
      ...baseRedirect,
      startDate: '2024-03-01T00:00:00.000Z',
      endDate: '2024-04-01T00:00:00.000Z',
    });
    expect(result).toContainEqual(
      expect.objectContaining({ type: 'changed', label: 'Start date' })
    );
    expect(result).toContainEqual(
      expect.objectContaining({ type: 'changed', label: 'End date' })
    );
  });
});
