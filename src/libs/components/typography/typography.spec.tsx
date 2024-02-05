import { render, screen } from '@testing-library/react';

import { matchers } from '@emotion/jest';

import { Typography } from './typography';

expect.extend(matchers);

const text = 'Some text';
const londonSemibold = 'mnsLondonSemiBold,Helvetica,Arial,sans-serif';
const londonRegular = 'mnsLondonRegular,Helvetica,Arial,sans-serif';
const mdBreakpoint = {
  media: '(min-width: 768px)',
};
const lgBreakpoint = {
  media: '(min-width: 1024px)',
};
const xlBreakpoint = {
  media: '(min-width: 1280px)',
};

describe('Typography', () => {
  it('should render successfully', () => {
    render(<Typography as="p">{text}</Typography>);

    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it('should render displayExtraLarge variant', () => {
    render(
      <Typography variant="displayExtraLarge" as="p">
        {text}
      </Typography>
    );

    expect(screen.getByText(text)).toHaveStyleRule(
      'font-family',
      londonSemibold
    );
    expect(screen.getByText(text)).toHaveStyleRule('font-size', '3.75rem');
    expect(screen.getByText(text)).toHaveStyleRule('line-height', '1.233');
    expect(screen.getByText(text)).toHaveStyleRule(
      'font-size',
      '5rem',
      mdBreakpoint
    );
    expect(screen.getByText(text)).toHaveStyleRule(
      'line-height',
      '1.25',
      mdBreakpoint
    );
  });

  it('should render displayLarge variant', () => {
    render(
      <Typography variant="displayLarge" as="p">
        {text}
      </Typography>
    );

    expect(screen.getByText(text)).toHaveStyleRule(
      'font-family',
      londonSemibold
    );
    expect(screen.getByText(text)).toHaveStyleRule('font-size', '2.5rem');
    expect(screen.getByText(text)).toHaveStyleRule('line-height', '1.25');
    expect(screen.getByText(text)).toHaveStyleRule(
      'font-size',
      '3.5rem',
      mdBreakpoint
    );
    expect(screen.getByText(text)).toHaveStyleRule(
      'line-height',
      '1.214',
      mdBreakpoint
    );
  });

  it('should render displayMedium variant', () => {
    render(
      <Typography variant="displayMedium" as="p">
        {text}
      </Typography>
    );

    expect(screen.getByText(text)).toHaveStyleRule(
      'font-family',
      londonSemibold
    );
    expect(screen.getByText(text)).toHaveStyleRule('font-size', '1.875rem');
    expect(screen.getByText(text)).toHaveStyleRule('line-height', '1.333');
    expect(screen.getByText(text)).toHaveStyleRule(
      'font-size',
      '2.5rem',
      mdBreakpoint
    );
    expect(screen.getByText(text)).toHaveStyleRule(
      'line-height',
      '1.25',
      mdBreakpoint
    );
  });

  it('should render displaySmall variant', () => {
    render(
      <Typography variant="displaySmall" as="p">
        {text}
      </Typography>
    );

    expect(screen.getByText(text)).toHaveStyleRule(
      'font-family',
      londonSemibold
    );
    expect(screen.getByText(text)).toHaveStyleRule('font-size', '1.5rem');
    expect(screen.getByText(text)).toHaveStyleRule('line-height', '1.25');
    expect(screen.getByText(text)).toHaveStyleRule(
      'font-size',
      '1.875rem',
      mdBreakpoint
    );
    expect(screen.getByText(text)).toHaveStyleRule(
      'line-height',
      '1.333',
      mdBreakpoint
    );
  });

  it('should render headingLarge variant', () => {
    render(
      <Typography variant="headingLarge" as="p">
        {text}
      </Typography>
    );

    expect(screen.getByText(text)).toHaveStyleRule(
      'font-family',
      londonRegular
    );
    expect(screen.getByText(text)).toHaveStyleRule('font-size', '1.75rem');
    expect(screen.getByText(text)).toHaveStyleRule('line-height', '1.286');
    expect(screen.getByText(text)).toHaveStyleRule(
      'font-size',
      '2.25rem',
      mdBreakpoint
    );
    expect(screen.getByText(text)).toHaveStyleRule(
      'line-height',
      '1.222',
      mdBreakpoint
    );
  });

  it('should render headingLarge strong variant', () => {
    render(
      <Typography variant="headingLarge" as="p" isStrong>
        {text}
      </Typography>
    );

    expect(screen.getByText(text)).toHaveStyleRule(
      'font-family',
      londonSemibold
    );
  });

  it('should render headingMedium variant', () => {
    render(
      <Typography variant="headingMedium" as="p">
        {text}
      </Typography>
    );

    expect(screen.getByText(text)).toHaveStyleRule(
      'font-family',
      londonRegular
    );
    expect(screen.getByText(text)).toHaveStyleRule('font-size', '1.5rem');
    expect(screen.getByText(text)).toHaveStyleRule('line-height', '1.333');
    expect(screen.getByText(text)).toHaveStyleRule(
      'font-size',
      '1.75rem',
      mdBreakpoint
    );
    expect(screen.getByText(text)).toHaveStyleRule(
      'line-height',
      '1.357',
      mdBreakpoint
    );
  });

  it('should render strong headingMedium variant', () => {
    render(
      <Typography variant="headingMedium" as="p" isStrong>
        {text}
      </Typography>
    );

    expect(screen.getByText(text)).toHaveStyleRule(
      'font-family',
      londonSemibold
    );
  });

  it('should render headingSmall variant', () => {
    render(
      <Typography variant="headingSmall" as="p">
        {text}
      </Typography>
    );

    expect(screen.getByText(text)).toHaveStyleRule(
      'font-family',
      londonRegular
    );
    expect(screen.getByText(text)).toHaveStyleRule('font-size', '1.25rem');
    expect(screen.getByText(text)).toHaveStyleRule('line-height', '1.4');
  });

  it('should render body variant', () => {
    render(
      <Typography as="p" variant="body">
        text
      </Typography>
    );

    expect(screen.getByText('text')).toHaveStyleRule('font-size', '1rem');
    expect(screen.getByText('text')).toHaveStyleRule('line-height', '1.625');
  });

  it('should render textSmall', () => {
    render(
      <Typography variant="textSmall" as="p">
        {text}
      </Typography>
    );

    expect(screen.getByText(text)).toHaveStyleRule(
      'font-family',
      londonRegular
    );
    expect(screen.getByText(text)).toHaveStyleRule('font-size', '0.875rem');
    expect(screen.getByText(text)).toHaveStyleRule('line-height', '1.5714');
  });

  it('should render textExtraSmall variant', () => {
    render(
      <Typography variant="textExtraSmall" as="p">
        {text}
      </Typography>
    );

    expect(screen.getByText(text)).toHaveStyleRule(
      'font-family',
      londonRegular
    );
    expect(screen.getByText(text)).toHaveStyleRule('font-size', '0.75rem');
    expect(screen.getByText(text)).toHaveStyleRule('line-height', '1.5');
  });

  it('should render extraSmall variant', () => {
    render(
      <Typography variant="extraSmall" as="p">
        {text}
      </Typography>
    );

    expect(screen.getByText(text)).toHaveStyleRule(
      'font-family',
      londonRegular
    );
    expect(screen.getByText(text)).toHaveStyleRule('font-size', '0.75rem');
    expect(screen.getByText(text)).toHaveStyleRule('line-height', '1.5');
  });

  it('should render overline variant', () => {
    render(
      <Typography variant="overline" as="p">
        {text}
      </Typography>
    );

    expect(screen.getByText(text)).toHaveStyleRule(
      'font-family',
      londonSemibold
    );
    expect(screen.getByText(text)).toHaveStyleRule('font-size', '0.75rem');
    expect(screen.getByText(text)).toHaveStyleRule('line-height', '1.333');
    expect(screen.getByText(text)).toHaveStyleRule('letter-spacing', '1px');
    expect(screen.getByText(text)).toHaveStyleRule(
      'text-transform',
      'uppercase'
    );
  });

  it('should render micro variant', () => {
    render(
      <Typography variant="micro" as="p">
        {text}
      </Typography>
    );

    expect(screen.getByText(text)).toHaveStyleRule(
      'font-family',
      londonSemibold
    );
    expect(screen.getByText(text)).toHaveStyleRule('font-size', '0.625rem');
    expect(screen.getByText(text)).toHaveStyleRule('line-height', '1.4');
    expect(screen.getByText(text)).toHaveStyleRule('letter-spacing', '0.25px');
  });

  it('should render the landingPage variants', () => {
    render(
      <>
        <Typography variant="landingPage" as="p">
          landingPage
        </Typography>
        <Typography variant="landingPagePrimary" as="p">
          landingPagePrimary
        </Typography>
        <Typography variant="landingPagePrimaryOutline" as="p">
          landingPagePrimaryOutline
        </Typography>
      </>
    );
    const landingPage = screen.getByText('landingPage');
    const landingPagePrimary = screen.getByText('landingPagePrimary');
    const landingPagePrimaryOutline = screen.getByText(
      'landingPagePrimaryOutline'
    );

    expect(landingPage).toHaveStyleRule('font-family', londonSemibold);
    expect(landingPage).toHaveStyleRule('display', 'inline-flex');
    expect(landingPage).toHaveStyleRule('border', '0');
    expect(landingPagePrimary).toHaveStyleRule('padding', '0.25rem 1.5rem');
    expect(landingPagePrimaryOutline).toHaveStyleRule(
      'border',
      '1px solid #000000'
    );
  });

  it('should handle invalid type', () => {
    const invalidType = 'handle-invalid-type' as 'body';
    render(
      <Typography variant={invalidType} as="p">
        {text}
      </Typography>
    );

    expect(screen.getByText(text)).not.toHaveStyleRule(
      'font-family',
      londonSemibold
    );
  });

  it('should render the additional styling props', () => {
    render(
      <Typography
        variant="body"
        as="p"
        letterSpacing="2px"
        textTransform="uppercase"
        color="#cccccc"
        textDecoration="line-through"
        wordBreak="break-all"
        isStrong
        hasDropShadow
        textAlign="left"
      >
        {text}
      </Typography>
    );

    expect(screen.getByText(text)).toHaveStyleRule(
      'font-family',
      'mnsLondonSemiBold,Helvetica,Arial,sans-serif'
    );
    expect(screen.getByText(text)).toHaveStyleRule('letter-spacing', '2px');
    expect(screen.getByText(text)).toHaveStyleRule(
      'text-transform',
      'uppercase'
    );
    expect(screen.getByText(text)).toHaveStyleRule('color', '#cccccc');
    expect(screen.getByText(text)).toHaveStyleRule(
      'text-decoration',
      'line-through'
    );
    expect(screen.getByText(text)).toHaveStyleRule('word-break', 'break-all');
    expect(screen.getByText(text)).toHaveStyleRule('text-align', 'left');
  });

  describe('Responsive variants', () => {
    it('should set the variants at different breakpoints', () => {
      render(
        <Typography
          as="p"
          variant={{
            sm: 'small',
            md: 'body',
            lg: 'headingSmall',
            xl: 'displayLarge',
          }}
          isStrong
        >
          {text}
        </Typography>
      );

      expect(screen.getByText(text)).toHaveStyleRule('font-size', '0.875rem');
      expect(screen.getByText(text)).toHaveStyleRule(
        'font-size',
        '1rem',
        mdBreakpoint
      );
      expect(screen.getByText(text)).toHaveStyleRule(
        'font-size',
        '1.25rem',
        lgBreakpoint
      );
      expect(screen.getByText(text)).toHaveStyleRule(
        'font-size',
        '3.5rem',
        xlBreakpoint
      );
      expect(screen.getByText(text)).toHaveStyleRule(
        'font-family',
        londonSemibold,
        mdBreakpoint
      );
    });
  });

  it('should add correct styles for shouldRemoveTextDecoration', () => {
    render(
      <Typography as="a" href="" shouldRemoveTextDecoration>
        {text}
      </Typography>
    );
    const link = screen.getByRole('link');

    expect(link).toHaveStyleRule('text-decoration', 'none');
    expect(link).toHaveStyleRule('text-decoration', 'underline', {
      target: ':hover',
    });
  });
});
