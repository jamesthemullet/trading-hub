import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

interface AccessibilityCheckOptions {
  exclude?: string[];
  include?: string[];
  tags?: string[];
  rules?: string[];
}

export const checkAccessibility = async (
  page: Page,
  options: AccessibilityCheckOptions = {}
) => {
  const {
    exclude = [
      // These are mantine-related issues, so code we cannot improve
      '.mantine-Modal-root',
      '[data-centered="true"]',
      '[data-portal="true"]',
      // Exclude Next.js dev tools that only appear in development
      '#nextjs-portal',
      '[data-nextjs-dev-tools-button]',
    ],
    include = [],
    tags = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'],
    rules = [],
  } = options;

  let axeBuilder = new AxeBuilder({ page }).withTags(tags);

  if (exclude.length > 0) {
    for (const selector of exclude) {
      axeBuilder = axeBuilder.exclude(selector);
    }
  }

  if (include.length > 0) {
    for (const selector of include) {
      axeBuilder = axeBuilder.include(selector);
    }
  }

  if (rules.length > 0) {
    axeBuilder = axeBuilder.withRules(rules);
  }

  const results = await axeBuilder.analyze();

  if (results.violations.length > 0) {
    const violationDetails = results.violations.map((violation) => ({
      rule: violation.id,
      description: violation.description,
      impact: violation.impact,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.map((node) => ({
        html: node.html,
        target: node.target,
        failureSummary: node.failureSummary,
      })),
    }));

    console.error(
      'Accessibility violations found:',
      JSON.stringify(violationDetails, null, 2)
    );
  }

  expect(results.violations).toEqual([]);
  return results;
};
