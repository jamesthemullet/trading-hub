/* istanbul ignore file */
import { useState } from 'react';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { ArrowButton } from '@/libs/components/arrow-button/arrow-button';
import { Button } from '@/libs/components/button/button';
import { Toast } from '@/libs/components/toast/toast';
import { Typography } from '@/libs/components/typography/typography';

import styles from './index.module.css';

const BOX_SHADOWS = [
  {
    label: '#000 0 0 10px -5px',
    value: '#000 0 0 10px -5px',
    sources: [
      'facets-panel .sectionWrapper',
      'table-panel .wrapper',
      'table.module .facetAttributeValuesTableRow',
      'table.module .editFacetAttributesModalTableRow',
    ],
  },
  {
    label: 'var(--color-surface-dark-surface-dark) 0 0 10px -5px',
    value: 'var(--color-surface-dark-surface-dark) 0 0 10px -5px',
    sources: ['facet-attributes-page-layout-header .wrapper'],
  },
  {
    label: '0 2px 6px 2px + 0 2px 3px 0 (dark token)',
    value:
      '0 2px 6px 2px var(--color-surface-dark-on-surface-dark-container), 0 2px 3px 0 var(--color-surface-dark-on-surface-dark-container)',
    sources: ['facets-panel .facetTableRow'],
  },
  {
    label: 'rgb(0 0 0 / 24%) 0 8px 12px 0',
    value: 'rgb(0 0 0 / 24%) 0 8px 12px 0',
    sources: ['preview .facetDropdown'],
  },
  {
    label: '0 2px 4px 0 #0000003d',
    value: '0 2px 4px 0 #0000003d',
    sources: ['category-search .tooltip'],
  },
  {
    label: 'rgb(0 0 0 / 10%) 0 0 5px 2px',
    value: 'rgb(0 0 0 / 10%) 0 0 5px 2px',
    sources: ['category-search .resultsContainer'],
  },
  {
    label: 'var(--color-surface-on-surface-container) 0 0 4px',
    value: 'var(--color-surface-on-surface-container) 0 0 4px',
    sources: ['heading .headingWrapper'],
  },
  {
    label: 'var(--color-surface-dark-surface-dark) 0 4px 2px -4px',
    value: 'var(--color-surface-dark-surface-dark) 0 4px 2px -4px',
    sources: ['table .dropdownOptions button'],
  },
  {
    label: '0 2px 10px 0 #0000001a',
    value: '0 2px 10px 0 #0000001a',
    sources: ['product .productMenu'],
  },
  {
    label: '0 2px 10px 0 color-mix (on-surface-container 10%)',
    value:
      '0 2px 10px 0 color-mix(in srgb, var(--color-surface-on-surface-container) 10%, transparent)',
    sources: ['bulk-actions .productMenu'],
  },
  {
    label: '0 2px 4px rgb(0 0 0 / 10%)',
    value: '0 2px 4px rgb(0 0 0 / 10%)',
    sources: ['styleguide .colorSwatch'],
  },
] as const;

// Colors from the Colleague Design button component — not our tokens to fix,
// but documented here for visibility during the standardisation audit.
const COLLEAGUE_BUTTON_COLOURS = [
  {
    value: '#1d1d1b',
    sources: ['Button default text and border colour'],
  },
  {
    value: '#e1ece3',
    sources: ['Button — primary theme (active state)'],
  },
  {
    value: '#c0e2c9',
    sources: ['Button — tertiary theme (hover / focus / active states)'],
  },
  {
    value: '#10604b',
    sources: ['Button — filled theme (hover state)'],
  },
  {
    value: '#226c59',
    sources: ['Button — filled theme (focus state)'],
  },
  {
    value: '#f0f5f4',
    sources: ['Button — secondary and outlined themes (hover state)'],
  },
  {
    value: '#dee9e6',
    sources: ['Button — secondary and outlined themes (focus state)'],
  },
  {
    value: '#e5e5e5',
    sources: ['Button default border colour'],
  },
  {
    value: '#8e8e8e',
    sources: ['Button disabled text colour'],
  },
  {
    value: '#8c8c8c',
    sources: ['Button — secondary theme border colour'],
  },
] as const;

const NON_STANDARD_COLORS = [
  // #1d1d1b and #dfece2 also appear in button.module.css (colleague design) but
  // are additionally used in our own components — listed here for that reason.
  {
    value: '#1d1d1b',
    suggestion: '--shade-87',
    suggestionColor: '#222',
    sources: [
      'Table column headings (Facets page)',
      'Category search result text',
    ],
  },
  {
    value: '#dfece2',
    sources: [
      'Active step indicator in Add Attribute modal',
      'Product action menu button (hover / focus states)',
      'Date range highlight in date picker',
    ],
  },
  {
    value: '#b1b1b1',
    suggestion: '--shade-30',
    suggestionColor: '#b2b2b2',
    sources: [
      'Category panel border (Ruleset page)',
      'Dropdown component border',
    ],
  },
  {
    value: '#bdbdbd',
    suggestion: '--shade-30',
    suggestionColor: '#b2b2b2',
    sources: ['Disabled checkbox border and fill'],
  },
  {
    value: '#e1e1e1',
    suggestion: '--shade-12',
    suggestionColor: '#e0e0e0',
    sources: ['Pagination button icon fill (hover state)'],
  },
  {
    value: '#4273b7',
    sources: [
      'Focus ring on Boost / Bury arrow buttons',
      'Button text in Add Attribute modal',
    ],
  },
  {
    value: '#f4faed',
    label: 'non-standard-include-row-colour',
    sources: [
      'Included facet row background (Facets panel)',
      'Pinned attribute row background (Facet attributes table)',
    ],
  },
  {
    value: '#f1f1f1',
    suggestion: '--shade-4',
    suggestionColor: '#f5f5f5',
    sources: ['Category search result row (hover state)'],
  },
  {
    value: '#e0e4e7',
    suggestion: '--pewter-25',
    suggestionColor: '#e2eaef',
    sources: ['Out-of-stock product overlay (Preview panel)'],
  },
  {
    value: '#fbf6f4',
    sources: ['Date picker modal body background'],
  },
] as const;

const NON_STANDARD_BORDER_RADIUS = [
  { value: '2px', sources: ['checkbox::before'] },
  {
    value: '3px',
    sources: [
      'product .productMenu',
      'product .productNumber',
      'bulk-actions .productMenuButton',
      'tabs .tabs',
    ],
  },
  {
    value: '4px',
    sources: [
      'button',
      'dropdown',
      'tooltip',
      'table rows',
      'facets',
      'input',
      'editable-label',
      'table-panel (common)',
    ],
  },
  {
    value: '4px 4px 0 0',
    sources: [
      'dropdown .dropdownWrapper/button/contentContainer',
      'calendar .styledInput/Container',
    ],
  },
  { value: '5px', sources: ['table .dropdownOptions'] },
  { value: '6px', sources: ['ruleset-attributes'] },
  {
    value: '8px',
    sources: [
      'styleguide .buttonExample',
      'styleguide .colorItem',
      'styleguide .spacingItem',
    ],
  },
  { value: '16px', sources: ['toggle .toggle'] },
  { value: '20px', sources: ['button[data-theme=tertiary]'] },
  { value: '30px', sources: ['search .search'] },
  {
    value: '50%',
    sources: [
      'radio',
      'pagination button',
      'toggle::before',
      'checkbox:disabled::after',
      'datepicker day',
      'preview slider',
    ],
  },
  {
    value: '100px',
    sources: [
      'tabs[data-appearance=pill]',
      'category-search .keywordPill',
      'search-keywords .keywordPill',
    ],
  },
] as const;

const Sandbox = ({ nodeVersion }: { nodeVersion: string }) => {
  const [isToastVisible, setIsToastVisible] = useState(false);

  return (
    <>
      <h1>Sandbox examples</h1>
      <div className={styles.example}>
        <h2>Running on Node version {nodeVersion}</h2>
      </div>
      <div className={styles.example}>
        <h2>Toast</h2>
        <Button type="button" onClick={() => setIsToastVisible(true)}>
          Show toast
        </Button>
        {isToastVisible && (
          <Toast
            message="Changes have been saved successfully"
            onDismiss={() => setIsToastVisible(false)}
          />
        )}
      </div>
      <div className={styles.example}>
        <h2>Arrow Button</h2>
        <ArrowButton direction="up" />
        <ArrowButton direction="down" />
        <ArrowButton isDisabled />
      </div>
      <div className={styles.example}>
        <h2>New arrow icons</h2>
        <img src="/trading-hub/asset/icon-boost-button.svg" alt="" />
        <img src="/trading-hub/asset/icon-bury-button.svg" alt="" />
      </div>
      <div className={styles.example}>
        <h2>Box Shadows</h2>
        <div className={styles.shadowGrid}>
          {BOX_SHADOWS.map((shadow) => (
            <div key={shadow.value} className={styles.shadowCard}>
              <div
                className={styles.shadowBox}
                style={{ boxShadow: shadow.value }}
              />
              <Typography variant="labelSmall" className={styles.shadowLabel}>
                {shadow.label}
              </Typography>
              {shadow.sources.map((source) => (
                <Typography
                  key={source}
                  variant="labelSmall"
                  className={styles.shadowSource}
                >
                  {source}
                </Typography>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.example}>
        <h2>Non-Standard Colours — Colleague Design Button Component</h2>
        <div className={styles.shadowGrid}>
          {COLLEAGUE_BUTTON_COLOURS.map((color) => (
            <div key={color.value} className={styles.shadowCard}>
              <div className={styles.swatchRow}>
                <div className={styles.swatchItem}>
                  <div
                    className={styles.colorSwatchBox}
                    style={{ background: color.value }}
                  />
                  <Typography
                    variant="labelSmall"
                    className={styles.shadowSource}
                  >
                    {color.value}
                  </Typography>
                </div>
              </div>
              {color.sources.map((source) => (
                <Typography
                  key={source}
                  variant="labelSmall"
                  className={styles.shadowSource}
                >
                  {source}
                </Typography>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.example}>
        <h2>Non-Standard Colours — Our Components</h2>
        <div className={styles.shadowGrid}>
          {NON_STANDARD_COLORS.map((color) => (
            <div key={color.value} className={styles.shadowCard}>
              <div className={styles.swatchRow}>
                <div className={styles.swatchItem}>
                  <div
                    className={styles.colorSwatchBox}
                    style={{ background: color.value }}
                  />
                  <Typography
                    variant="labelSmall"
                    className={styles.shadowSource}
                  >
                    {'label' in color ? color.label : color.value}
                  </Typography>
                  {'label' in color && (
                    <Typography
                      variant="labelSmall"
                      className={styles.shadowSource}
                    >
                      {color.value}
                    </Typography>
                  )}
                </div>
                {'suggestionColor' in color && (
                  <>
                    <span className={styles.swatchArrow}>→</span>
                    <div className={styles.swatchItem}>
                      <div
                        className={styles.colorSwatchBox}
                        style={{ background: color.suggestionColor }}
                      />
                      <Typography
                        variant="labelSmall"
                        className={styles.shadowSuggestion}
                      >
                        {color.suggestion}
                      </Typography>
                      <Typography
                        variant="labelSmall"
                        className={styles.shadowSuggestion}
                      >
                        {color.suggestionColor}
                      </Typography>
                    </div>
                  </>
                )}
              </div>
              {color.sources.map((source) => (
                <Typography
                  key={source}
                  variant="labelSmall"
                  className={styles.shadowSource}
                >
                  {source}
                </Typography>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.example}>
        <h2>Non-Standard Border Radii (no design token standard exists)</h2>
        <div className={styles.shadowGrid}>
          {NON_STANDARD_BORDER_RADIUS.map((radius) => (
            <div key={radius.value} className={styles.shadowCard}>
              <div
                className={styles.borderRadiusBox}
                style={{ borderRadius: radius.value }}
              />
              <Typography variant="labelSmall" className={styles.shadowLabel}>
                {radius.value}
              </Typography>
              {radius.sources.map((source) => (
                <Typography
                  key={source}
                  variant="labelSmall"
                  className={styles.shadowSource}
                >
                  {source}
                </Typography>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export const getServerSideProps = () => {
  return {
    props: {
      nodeVersion: process.version,
    },
  };
};

export default Sandbox;
