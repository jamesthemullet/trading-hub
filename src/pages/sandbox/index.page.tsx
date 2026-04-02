/* istanbul ignore file */
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { ArrowButton } from '@/libs/components/arrow-button/arrow-button';
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

const Sandbox = ({ nodeVersion }: { nodeVersion: string }) => {
  return (
    <>
      <h1>Sandbox examples</h1>
      <div className={styles.example}>
        <h3>Running on Node version {nodeVersion}</h3>
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
