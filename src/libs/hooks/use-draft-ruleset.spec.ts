import { act, renderHook } from '@testing-library/react';

import type { MerchandisingRuleSet } from '@/libs/api';

import {
  DRAFT_RULESET_SESSION_KEY,
  useDraftRuleset,
} from './use-draft-ruleset';

type DraftRulesetState = NonNullable<
  ReturnType<ReturnType<typeof useDraftRuleset>['getDraft']>
>;

describe('useDraftRuleset', () => {
  let consoleErrorSpy: jest.SpyInstance;

  const createTestDraft = (
    overrides?: Partial<
      MerchandisingRuleSet & {
        categoryIds: string[];
        searchTerms: string[];
        name?: string;
        description?: string;
      }
    >
  ): MerchandisingRuleSet & {
    categoryIds: string[];
    searchTerms: string[];
  } =>
    ({
      id: 'new',
      name: 'Test Ruleset',
      description: 'A test ruleset',
      isEnabled: true,
      rules: [],
      facets: [],
      ...overrides,
    }) as MerchandisingRuleSet & {
      categoryIds: string[];
      searchTerms: string[];
    };

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  const parseStoredDraft = (): DraftRulesetState => {
    const stored = sessionStorage.getItem(DRAFT_RULESET_SESSION_KEY);
    expect(stored).not.toBeNull();
    if (!stored) {
      throw new Error('Draft ruleset not found in sessionStorage');
    }
    return JSON.parse(stored) as DraftRulesetState;
  };

  afterEach(() => {
    sessionStorage.clear();
    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe('saveDraft', () => {
    it('should save draft ruleset to session storage', () => {
      const { result } = renderHook(() => useDraftRuleset());
      const draftRuleset = createTestDraft({
        categoryIds: ['cat1', 'cat2'],
      });

      act(() => {
        result.current.saveDraft({ ruleset: draftRuleset, type: 'category' });
      });

      const parsed = parseStoredDraft();
      expect(parsed.ruleset).toEqual(draftRuleset);
      expect(parsed.type).toBe('category');
      expect(parsed.timestamp).toBeDefined();
    });

    it('should save draft with search terms', () => {
      const { result } = renderHook(() => useDraftRuleset());
      const draftRuleset = createTestDraft({
        name: 'Search Ruleset',
        description: 'A search ruleset',
        searchTerms: ['term1', 'term2'],
      });

      act(() => {
        result.current.saveDraft({ ruleset: draftRuleset, type: 'search' });
      });

      const parsed = parseStoredDraft();
      expect(parsed.type).toBe('search');
      expect(
        (parsed.ruleset as { searchTerms?: string[] }).searchTerms
      ).toEqual(['term1', 'term2']);
    });

    it('should overwrite existing draft when saving new one', () => {
      const { result } = renderHook(() => useDraftRuleset());
      const firstDraft = createTestDraft({
        name: 'First Draft',
        description: 'First',
      });
      const secondDraft = createTestDraft({
        name: 'Second Draft',
        description: 'Second',
      });

      act(() => {
        result.current.saveDraft({ ruleset: firstDraft, type: 'category' });
      });

      let parsed = parseStoredDraft();
      expect((parsed.ruleset as { name?: string }).name).toBe('First Draft');

      act(() => {
        result.current.saveDraft({ ruleset: secondDraft, type: 'search' });
      });

      parsed = parseStoredDraft();
      expect((parsed.ruleset as { name?: string }).name).toBe('Second Draft');
      expect(parsed.type).toBe('search');
    });

    it('should handle errors when saving draft', () => {
      const { result } = renderHook(() => useDraftRuleset());

      jest.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const draftRuleset = createTestDraft();

      act(() => {
        result.current.saveDraft({ ruleset: draftRuleset, type: 'category' });
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save draft ruleset:',
        expect.any(Error)
      );
    });
  });

  describe('getDraft', () => {
    it('should retrieve saved draft from session storage', () => {
      const { result: saveResult } = renderHook(() => useDraftRuleset());
      const draftRuleset = createTestDraft({
        categoryIds: ['cat1', 'cat2'],
      });

      act(() => {
        saveResult.current.saveDraft({
          ruleset: draftRuleset,
          type: 'category',
        });
      });

      const { result: getResult } = renderHook(() => useDraftRuleset());
      let draft: ReturnType<typeof getResult.current.getDraft> | undefined;

      act(() => {
        draft = getResult.current.getDraft();
      });

      expect(draft).not.toBeNull();
      expect(draft?.ruleset).toEqual(draftRuleset);
      expect(draft?.type).toBe('category');
      expect(draft?.timestamp).toBeDefined();
    });

    it('should return null when no draft exists', () => {
      const { result } = renderHook(() => useDraftRuleset());
      let draft: ReturnType<typeof result.current.getDraft> | undefined;

      act(() => {
        draft = result.current.getDraft();
      });

      expect(draft).toBeNull();
    });

    it('should handle errors when retrieving draft', () => {
      const { result } = renderHook(() => useDraftRuleset());

      jest.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      let draft: ReturnType<typeof result.current.getDraft> | undefined;
      act(() => {
        draft = result.current.getDraft();
      });

      expect(draft).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to get draft ruleset:',
        expect.any(Error)
      );
    });

    it('should handle invalid JSON in session storage', () => {
      sessionStorage.setItem(DRAFT_RULESET_SESSION_KEY, 'invalid json {');

      const { result } = renderHook(() => useDraftRuleset());
      let draft: ReturnType<typeof result.current.getDraft> | undefined;

      act(() => {
        draft = result.current.getDraft();
      });

      expect(draft).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to get draft ruleset:',
        expect.any(SyntaxError)
      );
    });
  });

  describe('clearDraft', () => {
    it('should remove draft from session storage', () => {
      const { result: saveResult } = renderHook(() => useDraftRuleset());
      const draftRuleset = createTestDraft();

      act(() => {
        saveResult.current.saveDraft({
          ruleset: draftRuleset,
          type: 'category',
        });
      });

      let stored = sessionStorage.getItem(DRAFT_RULESET_SESSION_KEY);
      expect(stored).not.toBeNull();

      const { result: clearResult } = renderHook(() => useDraftRuleset());
      act(() => {
        clearResult.current.clearDraft();
      });

      stored = sessionStorage.getItem(DRAFT_RULESET_SESSION_KEY);
      expect(stored).toBeNull();
    });

    it('should handle errors when clearing draft', () => {
      const { result } = renderHook(() => useDraftRuleset());

      jest.spyOn(Storage.prototype, 'removeItem').mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      act(() => {
        result.current.clearDraft();
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to clear draft ruleset:',
        expect.any(Error)
      );
    });
  });

  describe('isDraftRuleset', () => {
    it('should return true when draft exists and ruleSetId is not provided', () => {
      const { result: saveResult } = renderHook(() => useDraftRuleset());
      const draftRuleset = createTestDraft();

      act(() => {
        saveResult.current.saveDraft({
          ruleset: draftRuleset,
          type: 'category',
        });
      });

      const { result: isDraftResult } = renderHook(() => useDraftRuleset());
      let isDraft: boolean | undefined;

      act(() => {
        isDraft = isDraftResult.current.isDraftRuleset();
      });

      expect(isDraft).toBe(true);
    });

    it('should return false when no draft exists', () => {
      const { result } = renderHook(() => useDraftRuleset());
      let isDraft: boolean | undefined;

      act(() => {
        isDraft = result.current.isDraftRuleset();
      });

      expect(isDraft).toBe(false);
    });

    it('should return false when ruleSetId is provided', () => {
      const { result: saveResult } = renderHook(() => useDraftRuleset());
      const draftRuleset = createTestDraft();

      act(() => {
        saveResult.current.saveDraft({
          ruleset: draftRuleset,
          type: 'category',
        });
      });

      const { result: isDraftResult } = renderHook(() => useDraftRuleset());
      let isDraft: boolean | undefined;

      act(() => {
        isDraft = isDraftResult.current.isDraftRuleset('rule-123');
      });

      expect(isDraft).toBe(false);
    });

    it('should return true when ruleSetId is an empty string and draft exists', () => {
      const { result: saveResult } = renderHook(() => useDraftRuleset());
      const draftRuleset = createTestDraft();

      act(() => {
        saveResult.current.saveDraft({
          ruleset: draftRuleset,
          type: 'category',
        });
      });

      const { result: isDraftResult } = renderHook(() => useDraftRuleset());
      let isDraft: boolean | undefined;

      act(() => {
        isDraft = isDraftResult.current.isDraftRuleset('');
      });

      expect(isDraft).toBe(true);
    });
  });

  describe('integration', () => {
    it('should handle complete workflow: save, get, clear', () => {
      const { result } = renderHook(() => useDraftRuleset());
      const draftRuleset = createTestDraft({
        categoryIds: ['cat1'],
        searchTerms: ['term1'],
      });

      act(() => {
        result.current.saveDraft({ ruleset: draftRuleset, type: 'category' });
      });

      // Verify draft exists
      let isDraft: boolean | undefined;
      act(() => {
        isDraft = result.current.isDraftRuleset();
      });
      expect(isDraft).toBe(true);

      // Get draft
      let draft: ReturnType<typeof result.current.getDraft> | undefined;
      act(() => {
        draft = result.current.getDraft();
      });
      expect(draft?.type).toBe('category');
      expect((draft?.ruleset as { name?: string } | undefined)?.name).toBe(
        'Test Ruleset'
      );

      act(() => {
        result.current.clearDraft();
      });

      // Verify draft is cleared
      act(() => {
        isDraft = result.current.isDraftRuleset();
      });
      expect(isDraft).toBe(false);

      act(() => {
        draft = result.current.getDraft();
      });
      expect(draft).toBeNull();
    });

    it('should handle multiple draft saves with different types', () => {
      const { result } = renderHook(() => useDraftRuleset());

      const categoryDraft = createTestDraft({
        name: 'Category Ruleset',
        description: 'For categories',
        categoryIds: ['cat1'],
      });

      const searchDraft = createTestDraft({
        name: 'Search Ruleset',
        description: 'For search',
        searchTerms: ['term1'],
      });

      // Save category draft
      act(() => {
        result.current.saveDraft({ ruleset: categoryDraft, type: 'category' });
      });

      let draft: ReturnType<typeof result.current.getDraft> | undefined;
      act(() => {
        draft = result.current.getDraft();
      });
      expect(draft?.type).toBe('category');
      expect(draft).toEqual(
        expect.objectContaining({
          ruleset: expect.objectContaining({
            categoryIds: ['cat1'],
          }),
          type: 'category',
        })
      );

      // Save search draft (should replace)
      act(() => {
        result.current.saveDraft({ ruleset: searchDraft, type: 'search' });
      });

      act(() => {
        draft = result.current.getDraft();
      });
      expect(draft?.type).toBe('search');
      expect(draft).toEqual(
        expect.objectContaining({
          ruleset: expect.objectContaining({
            searchTerms: ['term1'],
          }),
          type: 'search',
        })
      );
      expect(draft?.type === 'category').toBe(false);
    });
  });
});
