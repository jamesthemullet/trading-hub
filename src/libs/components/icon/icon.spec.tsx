import { render, screen } from '@testing-library/react';

import { Icon } from './icon';

jest.mock(
  './svg-mapping.json',
  () => ({
    Starters: {
      file: 'libs/static-assets/src/icons/svgs/Starters.svg',
      url: 'https://static.marksandspencer.com/icons/svgs/Starters.svg',
      canBeColoured: true,
    },
    TickSuccess: {
      file: 'libs/static-assets/src/icons/svgs/TickSuccess.svg',
      url: 'https://static.marksandspencer.com/icons/svgs/TickSuccess.svg',
      canBeColoured: true,
    },
    MAndSLogo: {
      file: 'libs/static-assets/src/images/MAndSLogo.svg',
      url: 'https://static.marksandspencer.com/images/MAndSLogo.svg',
      canBeColoured: false,
    },
    PaginationOn: {
      file: 'libs/static-assets/src/icons/svgs/PaginationOn.svg',
      url: 'https://static.marksandspencer.com/icons/svgs/PaginationOn.svg',
      canBeColoured: false,
    },
  }),
  {
    virtual: true,
  }
);

describe('Icon component', () => {
  it('should render an icon at the default size', () => {
    render(<Icon name="Starters" />);
    const icon = screen.getByRole('presentation');

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveStyle('width: 40px;');
    expect(icon).toHaveStyle('height: 40px;');
    expect(icon).toHaveStyle('mask-size: 30px;');
  });

  it('should render an icon with a set size with legacy padding', () => {
    render(<Icon name="Starters" size={56} />);
    const icon = screen.getByRole('presentation');

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveStyle('width: 56px;');
    expect(icon).toHaveStyle('height: 56px;');
    expect(icon).toHaveStyle('mask-size: 40px;');
  });

  it('should render icon with padding added', () => {
    render(<Icon name="TickSuccess" shouldAddPadding size={32} />);
    const icon = screen.getByRole('presentation');

    expect(icon).toHaveStyle('width: 40px;');
    expect(icon).toHaveStyle('mask-size: 32px;');
  });

  it('should render icon with no padding', () => {
    render(<Icon name="TickSuccess" shouldRemovePadding size={32} />);
    const icon = screen.getByRole('presentation');

    expect(icon).toHaveStyle('width: 32px;');
    expect(icon).toHaveStyle('mask-size: 32px;');
  });

  it('should render an icon with a deprecated width and some standard padding', () => {
    render(<Icon name="Starters" widthDeprecated={30} />);
    const icon = screen.getByRole('presentation');

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveStyle('width: 30px;');
    expect(icon).toHaveStyle('height: 30px;');
    expect(icon).toHaveStyle('mask-size: 26px;');
  });

  it('should render a coloured icon', () => {
    render(<Icon name="TickSuccess" color={'#fff'} />);
    const icon = screen.getByRole('presentation');

    expect(icon).toHaveStyle('background: #fff');
  });

  it('should not render an coloured icon when colour is passed but icon mapping says we can not', () => {
    render(<Icon name="PaginationOn" color={'#fff'} />);
    const icon = screen.getByRole('presentation');

    expect(icon).toHaveStyle({
      backgroundImage: expect.stringContaining('PaginationOn'),
    });
    expect(icon).not.toHaveStyle({
      maskImage: expect.stringContaining('PaginationOn'),
    });
  });

  it('should temporarily remove the padding from specific chevron icons', () => {
    render(<Icon name="ChevronDownDefault" />);
    const icon = screen.getByRole('presentation');

    expect(icon).toHaveStyle('width: 40px;');
    expect(icon).toHaveStyle('height: 40px;');
    expect(icon).toHaveStyle('mask-size: 40px;');
  });
});
