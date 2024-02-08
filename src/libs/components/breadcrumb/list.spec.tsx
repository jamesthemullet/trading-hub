import { render, screen } from '@testing-library/react';

import { List } from './list';

describe('List', () => {
  it('should render successfully with expected default styles', () => {
    const { container } = render(
      <List>
        <li>List item 1</li>
        <li>List item 2</li>
        <li>List item 3</li>
      </List>
    );
    expect(container).toBeInTheDocument();
    const screenList = screen.getByRole('list');
    expect(screenList).toBeInTheDocument();
    expect(screenList).toHaveStyleRule('list-style', 'disc');
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it("should render successfully as ordered list with as='ol'", () => {
    render(
      <List as="ol">
        <li>List item 1</li>
        <li>List item 2</li>
      </List>
    );
    expect(screen.getByRole('list')).toHaveStyleRule('list-style', 'decimal');
  });

  it("should render successfully as un-ordered list with as='ul'", () => {
    render(
      <List as="ul">
        <li>List item 1</li>
        <li>List item 2</li>
      </List>
    );
    expect(screen.getByRole('list')).toHaveStyleRule('list-style', 'disc');
  });

  it('should render with no bullets', () => {
    render(
      <List isUnstyled>
        <li>List item 1</li>
        <li>List item 2</li>
        <li>List item 3</li>
      </List>
    );
    expect(screen.getByRole('list')).toHaveStyle('list-style: none;');
  });

  it('should render with with a horizontal orientation', () => {
    render(
      <List isHorizontal>
        <li>List item 1</li>
        <li>List item 2</li>
        <li>List item 3</li>
      </List>
    );
    expect(screen.getByRole('list')).toHaveStyle({
      display: 'flex',
    });
  });
});
