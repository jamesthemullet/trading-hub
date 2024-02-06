import { screen, render } from '@testing-library/react';

import { colourDictionary } from '../utils/constants';

import { RenderSvg } from './render-svg';

describe('Render SVG component', () => {
  it('should render an svg', () => {
    render(<RenderSvg name="Starters" />);
    const icon = screen.getByRole('presentation');

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveStyleRule('width', '40px');
    expect(icon).toHaveStyleRule('height', '40px');
  });

  it('should render an svg with custom width and height', () => {
    render(<RenderSvg name="Starters" width={60} height={80} />);
    const icon = screen.getByRole('presentation');

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveStyleRule('width', '60px');
    expect(icon).toHaveStyleRule('height', '80px');
  });

  it('should render an svg with a percentage width or height', () => {
    render(<RenderSvg name="Starters" width="100%" height="50%" />);
    const icon = screen.getByRole('presentation');

    expect(icon).toHaveStyleRule('width', '100%');
    expect(icon).toHaveStyleRule('height', '50%');
  });

  it('should render a non-colourable svg with custom background-size', () => {
    render(<RenderSvg name="PaginationOn" innerSvgSize={4} />);

    const icon = screen.getByRole('presentation');

    expect(icon).toHaveStyleRule('background-size', '4px');
  });

  it('should render an coloured svg', () => {
    render(<RenderSvg name="TickSuccess" color={colourDictionary.white} />);
    const icon = screen.getByRole('presentation');

    expect(icon).toHaveStyleRule('mask-size', 'contain');
    expect(icon).toHaveStyleRule('background', colourDictionary.white);
  });

  it('should render an coloured svg with custom mask-size', () => {
    render(
      <RenderSvg
        name="TickSuccess"
        color={colourDictionary.white}
        innerSvgSize={4}
      />
    );
    const icon = screen.getByRole('presentation');

    expect(icon).toHaveStyleRule('mask-size', '4px');
  });

  it('should not render an coloured svg when colour is passed but svg mapping says we can not', () => {
    render(<RenderSvg name="PaginationOn" color={colourDictionary.white} />);
    const icon = screen.getByRole('presentation');

    expect(icon).toHaveStyleRule(
      'background-image',
      expect.stringContaining('PaginationOn')
    );
    expect(icon).not.toHaveStyleRule(
      'mask-image',
      expect.stringContaining('PaginationOn')
    );
  });
});
