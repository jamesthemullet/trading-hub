import { formatHTMLStrings } from './format-html-strings';

describe('formatHTMLStrings', () => {
  it('should return a Euro symbol if provided an html encoded string', async () => {
    const result = formatHTMLStrings('&euro;27 Jeans');

    expect(result).toBe('€27 Jeans');
  });

  it('should return text if only euro is passed', async () => {
    const result = formatHTMLStrings('euro 96 football shirt');

    expect(result).toBe('euro 96 football shirt');
  });

  it('should return undefined if no text passed', async () => {
    const result = formatHTMLStrings(undefined);

    expect(result).toBe(undefined);
  });
});
