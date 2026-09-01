import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { AxeResults } from 'axe-core';

type AccessibilityCheckOptions = {
  exclude?: string[];
  include?: string[];
  tags?: string[];
  rules?: string[];
  disableRules?: string[];
};

export const checkAccessibility = async (
  page: Page,
  options: AccessibilityCheckOptions = {}
): Promise<AxeResults> => {
  const {
    exclude = [
      // These are mantine-related issues, so code we cannot improve
      '.mantine-Modal-root',
      '[data-centered="true"]',
      '[data-portal="true"]',
      // Exclude Next.js dev tools that only appear in development
      '#nextjs-portal',
      '[data-nextjs-dev-tools-button]',
      'nextjs-portal',
    ],
    include = [],
    tags = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'],
    // Disable target-size rule as it falsely fails due to Next.js dev tools overlay in dev mode
    disableRules = ['target-size'],
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

  if (disableRules.length > 0) {
    axeBuilder = axeBuilder.disableRules(disableRules);
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
