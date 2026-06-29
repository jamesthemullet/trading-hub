/**
 * Some text we get back from various APIs contain html encoded values
 * This util replaces that with human readable content
 * From looking at Onyx the Euro is the only value that needs updating
 */

export function formatHTMLStrings(string: string): string;
export function formatHTMLStrings(string: undefined): undefined;
export function formatHTMLStrings(
  string: string | undefined
): string | undefined;
export function formatHTMLStrings(
  string: string | undefined
): string | undefined {
  return string?.replace('&euro;', '€');
}
