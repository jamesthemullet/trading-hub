import {
  DEFAULT_PAGE_SIZE,
  getStoredRowsPerPage,
  saveRowsPerPage,
} from './use-rows-per-page-setting';

beforeEach(() => {
  localStorage.clear();
});

describe('getStoredRowsPerPage', () => {
  it('returns the default when nothing is stored', () => {
    expect(getStoredRowsPerPage()).toBe(DEFAULT_PAGE_SIZE);
  });

  it('returns a stored valid page size', () => {
    localStorage.setItem('user-rows-per-page', '20');
    expect(getStoredRowsPerPage()).toBe(20);
  });

  it('returns the default for an invalid stored value', () => {
    localStorage.setItem('user-rows-per-page', '999');
    expect(getStoredRowsPerPage()).toBe(DEFAULT_PAGE_SIZE);
  });

  it('returns the default when stored value is not a number', () => {
    localStorage.setItem('user-rows-per-page', 'not-a-number');
    expect(getStoredRowsPerPage()).toBe(DEFAULT_PAGE_SIZE);
  });

  it('returns the default when localStorage.getItem throws', () => {
    const spy = jest
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('access denied');
      });
    expect(getStoredRowsPerPage()).toBe(DEFAULT_PAGE_SIZE);
    spy.mockRestore();
  });
});

describe('saveRowsPerPage', () => {
  it('persists the page size to localStorage', () => {
    saveRowsPerPage(50);
    expect(localStorage.getItem('user-rows-per-page')).toBe('50');
  });

  it('does not throw when localStorage.setItem throws', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    expect(() => saveRowsPerPage(10)).not.toThrow();
  });
});
