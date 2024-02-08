import { render, screen } from '@testing-library/react';


import { Breadcrumb } from './breadcrumb';

describe('Breadcrumb', () => {
  it('should render accessibility title', () => {
    render(
      <Breadcrumb>
        <a href="/home">Home</a>
      </Breadcrumb>
    );

    expect(screen.getByText('You are here:')).toHaveStyle('left: -999px;');
    expect(screen.getByText('You are here:').tagName).toBe('P');
  });

  it('renders with links', () => {
    render(
      <Breadcrumb>
        <a href="/home">Home</a>
      </Breadcrumb>
    );

    const listItem = screen.getByText('Home').parentElement;
    expect(listItem).toHaveStyle('display: inline-block;');
    expect(listItem?.parentElement).toHaveStyle(`
      margin: 0;
      padding: 0;
    `);
  });

  it('should pass aria-current attribute to the last element', () => {
    render(
      <Breadcrumb>
        <a href="/home">Home</a>
        <a href="/women">Women</a>
      </Breadcrumb>
    );

    const listItems = screen.getAllByRole('link');
    expect(listItems[0]).not.toHaveAttribute('aria-current', 'page');
    expect(listItems[1]).toHaveAttribute('aria-current', 'page');
  });

  describe('when underlineLastElement is true', () => {
    it('should render the last link with underline', () => {
      render(
        <Breadcrumb shouldUnderlineLastElement>
          <a href="/home">Home</a>
          <a href="/women">Women</a>
          <a href="/jeans">Jeans</a>
        </Breadcrumb>
      );

      const link = screen.getByText('Jeans');
      expect(link).toHaveStyle('text-decoration: underline');
    });
  });

  describe('when listLength is <=2', () => {
    it('should not render the last link with "/" listLength is >=2', () => {
      render(
        <Breadcrumb>
          <a href="/home">Home</a>
          <a href="/women">Women</a>
          <a href="/jeans">Jeans</a>
        </Breadcrumb>
      );

      const listItem = screen.getByText('Home').parentElement;
      expect(listItem).toHaveStyle('display: none;');
      const listItemTwo = screen.getByText('Women').parentElement;
      expect(listItemTwo).toHaveStyle('display: inline-block;');
    });

    it('should render the last link with "/" listLength is <=2', () => {
      render(
        <Breadcrumb>
          <a href="/women">Women</a>
          <a href="/jeans">Jeans</a>
        </Breadcrumb>
      );
      const listItem = screen.getByText('Women').parentElement;
      expect(listItem).toHaveStyle('display: inline-block;');
    });
  });

  describe('when more than two links are rendered on mobile', () => {
    it('only displays the last two links', () => {
      render(
        <Breadcrumb>
          <a href="/home">Home</a>
          <a href="/women">Women</a>
          <a href="/jeans">Jeans</a>
        </Breadcrumb>
      );
      expect(screen.getByText('Home')).not.toBeVisible();
      expect(screen.getByText('Women')).toBeVisible();
      expect(screen.getByText('Jeans')).toBeVisible();
    });
  });

  describe('On breakpoints > sm', () => {
    it('displays all links when passed more than two links', () => {
      render(
        <Breadcrumb>
          <a href="/home">Home</a>
          <a href="/women">Women</a>
          <a href="/jeans">Jeans</a>
        </Breadcrumb>
      );

      expect(screen.getByText('Home').closest('li')).toHaveStyleRule(
        'display',
        'inline-block',
        { media: '(min-width: 768px)' }
      );
      expect(screen.getByText('Women')).toBeVisible();
      expect(screen.getByText('Jeans')).toBeVisible();
    });

    it('displays only two links when passed two links', () => {
      render(
        <Breadcrumb>
          <a href="/home">Home</a>
          <a href="/women">Women</a>
        </Breadcrumb>
      );

      expect(screen.getByText('Home')).toBeVisible();
      expect(screen.getByText('Women')).toBeVisible();
    });
  });
});
