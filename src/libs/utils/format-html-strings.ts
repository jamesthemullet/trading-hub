/**
 * Some text we get back from various APIs contain html encoded values
 * This util replaces that with human readable content
 * From looking at Onyx the Euro is the only value that needs updating
 */

export const formatHTMLStrings = (string: string | undefined) =>
  string?.replace('&euro;', '€');
