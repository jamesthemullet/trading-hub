/* istanbul ignore file */
/* eslint-disable react/forbid-dom-props */

import type { ReactElement } from 'react';

import { Button, Typography } from '@/libs/components';
import { color } from '@/libs/utils/constants';

import styles from './index.module.css';

const StyleGuide = (): ReactElement => {
  const stateColorTokens = [
    { label: 'Success', value: color.state.success.success },
    { label: 'On Success', value: color.state.success.onSuccess },
    { label: 'Success Container', value: color.state.success.successContainer },
    {
      label: 'On Success Container',
      value: color.state.success.onSuccessContainer,
    },
    { label: 'Error', value: color.state.error.error },
    { label: 'On Error', value: color.state.error.onError },
    { label: 'Error Container', value: color.state.error.errorContainer },
    { label: 'On Error Container', value: color.state.error.onErrorContainer },
    { label: 'Unactioned', value: color.state.unactioned.unactioned },
    { label: 'On Unactioned', value: color.state.unactioned.onUnactioned },
    {
      label: 'Unactioned Container',
      value: color.state.unactioned.unactionedContainer,
    },
    {
      label: 'On Unactioned Container',
      value: color.state.unactioned.onUnactionedContainer,
    },
    { label: 'Disabled', value: color.state.disabled.disabled },
    { label: 'On Disabled', value: color.state.disabled.onDisabled },
    { label: 'Disabled On Dark', value: color.state.disabled.disabledOnDark },
    {
      label: 'On Disabled On Dark',
      value: color.state.disabled.onDisabledOnDark,
    },
    {
      label: 'Warning',
      value: '#ea8212',
    },
    {
      label: 'On Warning',
      value: '#222',
    },
    {
      label: 'Warning Container',
      value: '#f7cda0',
    },
    {
      label: 'On Warning Container',
      value: '#8c4e0b',
    },
  ];

  const roleColorTokens = [
    { label: 'Info', value: color.role.info.info },
    { label: 'On Info', value: color.role.info.onInfo, withBorder: true },
    { label: 'Info Container', value: color.role.info.infoContainer },
    { label: 'On Info Container', value: color.role.info.onInfoContainer },
    { label: 'Link', value: color.role.link.link },
    { label: 'Link On Bright', value: color.role.link.linkOnBright },
    { label: 'Link On Dark', value: color.role.link.linkOnDark },
    { label: 'Outline', value: color.role.outline.outline },
    { label: 'Outline Variant', value: color.role.outline.outlineVariant },
    {
      label: 'Destructive',
      value: '#ea122a',
    },
    {
      label: 'On Destructive',
      value: '#000',
    },
    {
      label: 'Destructive Container',
      value: '#fff3f4',
    },
    {
      label: 'On Destructive Container',
      value: '#bb0e22',
    },
  ];

  const interactiveStateTokens = [
    { label: 'Black Dragged', value: 'rgb(0 0 0 / 20%)' },
    { label: 'Black Enabled', value: 'rgb(0 0 0 / 0%)' },
    { label: 'Black Focused', value: 'rgb(0 0 0 / 14%)' },
    { label: 'Black Hovered', value: 'rgb(0 0 0 / 6%)' },
    { label: 'Black Pressed', value: 'rgb(0 0 0 / 14%)' },
    { label: 'Blue Enabled', value: 'rgb(34 108 146 / 0%)' },
    {
      label: 'Blue Enabled On Dark',
      value: 'rgb(34 108 146 / 0%)',
    },
    { label: 'Blue Focused', value: 'rgb(34 108 146 / 14%)' },
    {
      label: 'Blue Focused On Dark',
      value: 'rgb(34 108 146 / 40%)',
    },
    { label: 'Blue Hovered', value: 'rgb(34 108 146 / 6%)' },
    {
      label: 'Blue Hovered On Dark',
      value: 'rgb(34 108 146 / 20%)',
    },
    { label: 'Blue Pressed', value: 'rgb(34 108 146 / 14%)' },
    {
      label: 'Blue Pressed On Dark',
      value: 'rgb(34 108 146 / 40%)',
    },
    { label: 'Highlighted', value: 'rgb(139 213 144 / 25%)' },
    { label: 'Red Enabled', value: 'rgb(234 18 42 / 0%)' },
    { label: 'Red Focused', value: 'rgb(234 18 42 / 14%)' },
    { label: 'Red Hovered', value: 'rgb(234 18 42 / 6%)' },
    { label: 'Red Pressed', value: 'rgb(234 18 42 / 14%)' },
    { label: 'Teal Dragged', value: 'rgb(0 86 64 / 20%)' },
    { label: 'Teal Enabled', value: 'rgb(0 86 64 / 0%)' },
    { label: 'Teal Focused', value: 'rgb(0 86 64 / 14%)' },
    { label: 'Teal Hovered', value: 'rgb(0 86 64 / 6%)' },
    { label: 'Teal Pressed', value: 'rgb(0 86 64 / 14%)' },
    { label: 'White Dragged', value: 'rgb(255 255 255 / 20%)' },
    { label: 'White Enabled', value: 'rgb(255 255 255 / 0%)' },
    { label: 'White Focused', value: 'rgb(255 255 255 / 20%)' },
    { label: 'White Hovered', value: 'rgb(255 255 255 / 14%)' },
    { label: 'White Pressed', value: 'rgb(255 255 255 / 20%)' },
  ];

  const accentColorTokens = [
    {
      label: 'On Primary',
      value: color.accent.primary.onPrimary,
      withBorder: true,
    },
    {
      label: 'On Primary Container',
      value: color.accent.primary.onPrimaryContainer,
    },
    { label: 'Primary', value: color.accent.primary.primary },
    {
      label: 'Primary Container',
      value: color.accent.primary.primaryContainer,
    },
    {
      label: 'On Secondary',
      value: color.accent.secondary.onSecondary,
      withBorder: true,
    },
    {
      label: 'On Secondary Container',
      value: color.accent.secondary.onSecondaryContainer,
    },
    { label: 'Secondary', value: color.accent.secondary.secondary },
    {
      label: 'Secondary Container',
      value: color.accent.secondary.secondaryContainer,
    },
    {
      label: 'On Tertiary',
      value: color.accent.tertiary.onTertiary,
      withBorder: true,
    },
    {
      label: 'On Tertiary Container',
      value: color.accent.tertiary.onTertiaryContainer,
    },
    { label: 'Tertiary', value: color.accent.tertiary.tertiary },
    {
      label: 'Tertiary Container',
      value: color.accent.tertiary.tertiaryContainer,
    },
  ];

  const surfaceColorTokens = [
    { label: 'On Surface', value: color.surface.onSurface },
    { label: 'On Surface Container', value: color.surface.onSurfaceContainer },
    { label: 'On Surface Variant', value: color.surface.onSurfaceVariant },
    { label: 'Surface', value: color.surface.surface, withBorder: true },
    {
      label: 'Surface Container',
      value: color.surface.surfaceContainer,
      withBorder: true,
    },
    { label: 'On Surface Bright', value: color.surfaceBright.onSurfaceBright },
    {
      label: 'On Surface Bright Container',
      value: color.surfaceBright.onSurfaceBrightContainer,
    },
    {
      label: 'On Surface Bright Variant',
      value: color.surfaceBright.onSurfaceBrightVariant,
    },
    {
      label: 'Surface Bright',
      value: color.surfaceBright.surfaceBright,
      withBorder: true,
    },
    {
      label: 'Surface Bright Container',
      value: color.surfaceBright.surfaceBrightContainer,
      withBorder: true,
    },
    {
      label: 'On Surface Dark',
      value: color.surfaceDark.onSurfaceDark,
      withBorder: true,
    },
    {
      label: 'On Surface Dark Container',
      value: color.surfaceDark.onSurfaceDarkContainer,
    },
    {
      label: 'On Surface Dark Variant',
      value: color.surfaceDark.onSurfaceDarkVariant,
    },
    { label: 'Surface Dark', value: color.surfaceDark.surfaceDark },
    {
      label: 'Surface Dark Container',
      value: color.surfaceDark.surfaceDarkContainer,
    },
  ];

  const typographySubsections = [
    {
      title: 'Display Styles',
      items: [
        {
          label: 'Display Large',
          variant: 'displayLarge',
          size: '52px / 60px line height',
          asTag: 'h1',
          isStrong: true,
        },
        {
          label: 'Display Medium',
          variant: 'displayMedium',
          size: '46px / 54px line height',
          asTag: 'h2',
          isStrong: true,
        },
        {
          label: 'Display Small',
          variant: 'displaySmall',
          size: '41px / 48px line height',
          asTag: 'h3',
          isStrong: true,
        },
      ],
    },
    {
      title: 'Headlines',
      items: [
        {
          label: 'Headline Large',
          variant: 'headlineLarge',
          size: '36px / 44px line height',
          asTag: 'h1',
          isStrong: true,
        },
        {
          label: 'Headline Medium',
          variant: 'headlineMedium',
          size: '32px / 40px line height',
          asTag: 'h2',
          isStrong: true,
        },
        {
          label: 'Headline Small',
          variant: 'headlineSmall',
          size: '29px / 36px line height',
          asTag: 'h3',
          isStrong: true,
        },
      ],
    },
    {
      title: 'Titles',
      items: [
        {
          label: 'Title Large',
          variant: 'titleLarge',
          size: '26px / 36px line height',
          isStrong: true,
        },
        {
          label: 'Title Medium',
          variant: 'titleMedium',
          size: '23px / 32px line height',
          isStrong: true,
        },
        {
          label: 'Title Small',
          variant: 'titleSmall',
          size: '20px / 28px line height',
          isStrong: true,
        },
      ],
    },
    {
      title: 'Body Text',
      items: [
        {
          label: 'Body Large',
          variant: 'bodyLarge',
          size: '18px / 28px line height',
          isStrong: false,
        },
        {
          label: 'Body Medium',
          variant: 'bodyMedium',
          size: '16px / 24px line height',
          isStrong: false,
        },
        {
          label: 'Body Small',
          variant: 'bodySmall',
          size: '14px / 20px line height',
          isStrong: false,
        },
      ],
    },
    {
      title: 'Labels',
      items: [
        {
          label: 'Label Large',
          variant: 'labelLarge',
          size: '13px / 20px line height',
          isStrong: false,
        },
        {
          label: 'Label Medium',
          variant: 'labelMedium',
          size: '11px / 18px line height',
          isStrong: false,
        },
        {
          label: 'Label Small',
          variant: 'labelSmall',
          size: '10px / 16px line height',
          isStrong: false,
        },
      ],
    },
  ] as const;

  const buttonExamples = [
    {
      label: 'Primary Button',
      code: '<Button theme="primary">',
      render: () => <Button theme="primary">Primary Button</Button>,
    },
    {
      label: 'Secondary Button',
      code: '<Button>',
      render: () => <Button>Secondary Button</Button>,
    },
    {
      label: 'Tertiary Button',
      code: '<Button theme="tertiary">',
      render: () => <Button theme="tertiary">Tertiary Button</Button>,
    },
    {
      label: 'Filled Button',
      code: '<Button theme="filled" isInline>',
      render: () => (
        <Button theme="filled" isInline>
          Filled Button
        </Button>
      ),
    },
    {
      label: 'Outlined Button',
      code: '<Button theme="outlined" isInline>',
      render: () => (
        <Button theme="outlined" isInline>
          Outlined Button
        </Button>
      ),
    },
    {
      label: 'Disabled Button',
      code: '<Button isDisabled>',
      render: () => <Button isDisabled>Disabled Button</Button>,
    },
  ] as const;

  return (
    <div className={styles.container}>
      <div className={styles.headingSection}>
        <Typography as="h1" variant="displayLarge" isStrong>
          Trading Hub Design System
        </Typography>
      </div>

      {/* Typography Section */}
      <section className={styles.section}>
        <Typography as="h2" variant="headlineLarge" isStrong>
          Typography
        </Typography>
        <Typography variant="bodyMedium" hasMargin>
          Typography scales based on the Colleague Design System using New MS
          London font.
        </Typography>

        {typographySubsections.map((subsection) => (
          <div key={subsection.title} className={styles.subsection}>
            <Typography as="h3" variant="headlineMedium" isStrong>
              {subsection.title}
            </Typography>
            {subsection.items.map((item) => (
              <div key={item.variant} className={styles.typeRow}>
                <div className={styles.typeExample}>
                  <Typography
                    as={'asTag' in item ? item.asTag : undefined}
                    variant={item.variant}
                    isStrong={item.isStrong}
                  >
                    {item.label}
                  </Typography>
                </div>
                <div className={styles.typeDetails}>
                  <Typography variant="bodySmall">
                    <strong>Variant:</strong> {item.variant}
                  </Typography>
                  <Typography variant="bodySmall">
                    <strong>Size:</strong> {item.size}
                  </Typography>
                  <Typography variant="bodySmall">
                    <code>
                      {`<Typography variant="${item.variant}"${item.isStrong ? ' isStrong' : ''}>`}
                    </code>
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>

      {/* Buttons Section */}
      <section className={styles.section}>
        <Typography as="h2" variant="headlineLarge" isStrong>
          Buttons
        </Typography>
        <Typography variant="bodyMedium" hasMargin>
          Button components with various themes and states.
        </Typography>

        <div className={styles.buttonGrid}>
          {buttonExamples.map((example) => (
            <div key={example.label} className={styles.buttonExample}>
              {example.render()}
              <Typography variant="bodySmall">
                <code>{example.code}</code>
              </Typography>
            </div>
          ))}
        </div>
      </section>

      {/* Color Palette Section */}
      <section className={styles.section}>
        <Typography as="h2" variant="headlineLarge" isStrong>
          Color Palette
        </Typography>
        <Typography variant="bodyMedium" hasMargin>
          Colors from the Colleague Design System organized by category.
        </Typography>

        <div className={styles.subsection}>
          <Typography as="h3" variant="headlineMedium" isStrong>
            Accent Colors
          </Typography>
          <div className={styles.colorGrid}>
            {accentColorTokens.map((token) => (
              <div key={token.label} className={styles.colorItem}>
                <div
                  className={styles.colorSwatch}
                  style={{
                    backgroundColor: token.value,
                    border: token.withBorder
                      ? '1px solid var(--color-role-outline-outline-variant)'
                      : undefined,
                  }}
                />
                <Typography variant="labelSmall">{token.label}</Typography>
                <Typography variant="bodySmall">
                  <code>{token.value}</code>
                </Typography>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.subsection}>
          <Typography as="h3" variant="headlineMedium" isStrong>
            State Colors
          </Typography>
          <div className={styles.colorGrid}>
            {stateColorTokens.map((token) => (
              <div key={token.label} className={styles.colorItem}>
                <div
                  className={styles.colorSwatch}
                  style={{
                    backgroundColor: token.value,
                  }}
                />
                <Typography variant="labelSmall">{token.label}</Typography>
                <Typography variant="bodySmall">
                  <code>{token.value}</code>
                </Typography>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.subsection}>
          <Typography as="h3" variant="headlineMedium" isStrong>
            Interactive States
          </Typography>
          <div className={styles.colorGrid}>
            {interactiveStateTokens.map((token) => (
              <div key={token.label} className={styles.colorItem}>
                <div
                  className={styles.colorSwatch}
                  style={{
                    backgroundColor: token.value,
                    border:
                      '1px solid var(--color-role-outline-outline-variant)',
                  }}
                />
                <Typography variant="labelSmall">{token.label}</Typography>
                <Typography variant="bodySmall">
                  <code>{token.value}</code>
                </Typography>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.subsection}>
          <Typography as="h3" variant="headlineMedium" isStrong>
            Role Colors
          </Typography>
          <div className={styles.colorGrid}>
            {roleColorTokens.map((token) => (
              <div key={token.label} className={styles.colorItem}>
                <div
                  className={styles.colorSwatch}
                  style={{
                    backgroundColor: token.value,
                    border: token.withBorder
                      ? '1px solid var(--color-role-outline-outline-variant)'
                      : undefined,
                  }}
                />
                <Typography variant="labelSmall">{token.label}</Typography>
                <Typography variant="bodySmall">
                  <code>{token.value}</code>
                </Typography>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.subsection}>
          <Typography as="h3" variant="headlineMedium" isStrong>
            Surface Colors
          </Typography>
          <div className={styles.colorGrid}>
            {surfaceColorTokens.map((token) => (
              <div key={token.label} className={styles.colorItem}>
                <div
                  className={styles.colorSwatch}
                  style={{
                    backgroundColor: token.value,
                    border: token.withBorder
                      ? '1px solid var(--color-role-outline-outline-variant)'
                      : undefined,
                  }}
                />
                <Typography variant="labelSmall">{token.label}</Typography>
                <Typography variant="bodySmall">
                  <code>{token.value}</code>
                </Typography>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spacing Section */}
      <section className={styles.section}>
        <Typography as="h2" variant="headlineLarge" isStrong>
          Spacing Scale
        </Typography>
        <Typography variant="bodyMedium" hasMargin>
          Base unit: 8px. Use the spacing function or CSS variables for
          consistent spacing.
        </Typography>

        <div className={styles.spacingGrid}>
          {[0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6].map((unit) => (
            <div key={unit} className={styles.spacingItem}>
              <div
                className={styles.spacingBlock}
                style={{ width: `${unit * 8}px`, height: '40px' }}
              />
              <Typography variant="bodySmall">
                <strong>
                  {unit} ({unit * 8}px)
                </strong>
              </Typography>
              <Typography variant="labelSmall">
                <code>spacing({unit})</code>
              </Typography>
              <Typography variant="labelSmall">
                <code>--mns-spacing-{unit.toString().replace('.', '-')}</code>
              </Typography>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StyleGuide;
