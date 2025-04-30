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
    expect(listItem?.parentElement).toHaveStyle(`
      margin: 0px 0.5rem;
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

  it('displays all links when passed more than two links', () => {
    render(
      <Breadcrumb>
        <a href="/home">Home</a>
        <a href="/women">Women</a>
        <a href="/jeans">Jeans</a>
      </Breadcrumb>
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
